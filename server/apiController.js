const { v4: uuidv4 } = require('uuid');
const aiService = require('./aiService');
const pdfService = require('./pdfService');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// --- SIMULATED IN-MEMORY DATABASE ---
const resumeStore = {};

/**
 * Helper to convert structured resume JSON to a simple plain text preview string.
 * Handles both the resume builder format and AI tailored format.
 */
const formatResumeToPlainText = (data) => {
    // Handle different data structures
    const name = data.name || 'Your Name';
    const title = data.title || 'Professional Title';
    const email = data.contact?.email || data.email || '';
    const phone = data.contact?.phone || data.phone || '';
    const location = data.contact?.location || data.location || '';
    const linkedin = data.links?.LinkedIn || data.linkedin || '';
    const github = data.links?.GitHub || data.github || '';
    const summary = data.professional_summary || data.summary || '';
    const experience = data.professional_experience || data.experience || [];
    const skills = data.skills || [];
    const education = data.education || [];
    const projects = data.projects || [];

    let text = `${name}\n${title}\n${'='.repeat(name.length)}\n\n`;
    text += `Contact: ${email}${phone ? ' | ' + phone : ''}${location ? ' | ' + location : ''}\n`;
    
    if (linkedin || github) {
        text += `Links:${linkedin ? ' LinkedIn (' + linkedin + ')' : ''}${github ? ' | GitHub (' + github + ')' : ''}\n`;
    }
    text += '\n';
    
    if (summary) {
        text += "PROFESSIONAL SUMMARY\n" + '-'.repeat(25) + "\n";
        text += `${summary}\n\n`;
    }

    if (experience && experience.length > 0) {
        text += "EXPERIENCE\n" + '-'.repeat(10) + "\n";
        experience.forEach(exp => {
            const expTitle = exp.title || '';
            const company = exp.company || '';
            const duration = exp.duration || '';
            const description = exp.description || '';
            
            text += `${expTitle}${company ? ' at ' + company : ''}${duration ? ' (' + duration + ')' : ''}\n`;
            if (description) {
                text += `\t- ${description}\n`;
            }
        });
        text += '\n';
    }

    if (skills && skills.length > 0) {
        text += "SKILLS\n" + '-'.repeat(6) + "\n";
        text += skills.join(' | ') + '\n\n';
    }

    if (education && education.length > 0) {
        text += "EDUCATION\n" + '-'.repeat(10) + "\n";
        if (typeof education === 'string') {
            text += education + '\n';
        } else {
            education.forEach(edu => {
                if (typeof edu === 'string') {
                    text += edu + '\n';
                } else {
                    const degree = edu.degree || '';
                    const institution = edu.institution || '';
                    const eduDuration = edu.duration || '';
                    text += `${degree}${institution ? ', ' + institution : ''}${eduDuration ? ' (' + eduDuration + ')' : ''}\n`;
                }
            });
        }
        text += '\n';
    }
    
    if (projects && projects.length > 0) {
        text += "PROJECTS/CERTIFICATIONS\n" + '-'.repeat(25) + "\n";
        text += projects.join('\n');
    }

    return text;
};

/**
 * POST /api/resume/create - Saves a structured resume draft.
 */
exports.createResume = (req, res) => {
    const { resumeData } = req.body;
    if (!resumeData || !resumeData.name) {
        return res.status(400).json({ success: false, message: 'Missing resume data.' });
    }

    const id = uuidv4();
    resumeStore[id] = { id, ...resumeData, createdAt: new Date().toISOString() };
    console.log(`Resume created and saved: ${id}`);

    res.status(201).json({ success: true, message: 'Resume draft saved successfully.', id });
};

/**
 * GET /api/resume/:id - Fetches a saved resume draft.
 */
exports.getResume = (req, res) => {
    const { id } = req.params;
    const resume = resumeStore[id];

    if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.status(200).json({ success: true, resume });
};

/**
 * POST /api/resume/summarize - AI generates an enhanced professional summary (Form Step 1 AI feature).
 */
exports.summarizeResume = async (req, res) => {
    const { name, title, summaryDraft, userPlan } = req.body;
    const provider = 'gemini'; // Default to Gemini for this quick task

    if (!name || !title || !summaryDraft) {
        return res.status(400).json({ success: false, message: 'Missing essential data for summarization.' });
    }

    const prompt = `Based on the following details, write a highly professional, 3-sentence summary.
    Name: ${name}, Title: ${title}. Draft Notes: ${summaryDraft}`;

    try {
        // AI service will implicitly use only Gemini and check usage against the plan (not strictly enforced here)
        const generatedSummary = await aiService.tailorResumeWithAI(prompt, "", provider, userPlan); 
        res.status(200).json({ success: true, summary: generatedSummary });
    } catch (error) {
        console.error("Gemini summarization failed:", error);
        res.status(500).json({ success: false, message: 'AI processing failed during summarization.' });
    }
};

/**
 * POST /api/resume/tailor - AI tailors an existing resume text to a job description.
 */
exports.tailorResume = async (req, res) => {
    const { resumeText, jobDescription, modelProvider, userPlan } = req.body;

    if (!resumeText || !jobDescription || !modelProvider || !userPlan) {
        return res.status(400).json({ success: false, message: 'Missing content, description, AI provider, or user plan.' });
    }

    try {
        console.log(`Starting AI tailoring using ${modelProvider} for plan ${userPlan}...`);
        
        // This returns structured JSON from aiService.js. The AI service handles plan validation.
        const tailoredJson = await aiService.tailorResumeWithAI(resumeText, jobDescription, modelProvider, userPlan);
        
        console.log('AI Response:', JSON.stringify(tailoredJson, null, 2));
        
        // Convert the structured JSON result into a clean plain text preview
        // Add safety checks for the response structure
        let tailoredPlainText = '';
        
        if (tailoredJson && typeof tailoredJson === 'object') {
            try {
                tailoredPlainText = formatResumeToPlainText(tailoredJson);
            } catch (formatError) {
                console.error('Format error:', formatError);
                // Fallback: just stringify the JSON response
                tailoredPlainText = JSON.stringify(tailoredJson, null, 2);
            }
        } else {
            // If AI returned plain text instead of JSON
            tailoredPlainText = String(tailoredJson);
        }

        res.status(200).json({ 
            success: true, 
            tailoredJson, // Structured data for the frontend to render the preview
            tailoredPlainText // Plain text for display in the tailor view
        });

    } catch (error) {
        console.error(`AI Tailoring Failed (${modelProvider}):`, error);
        res.status(500).json({ success: false, message: `AI Tailoring failed: ${error.message}` });
    }
};

/**
 * POST /api/resume/upload - Real file upload endpoint with PDF parsing.
 * Parses file, extracts text, and IMMEDIATELY deletes the temp file.
 */
exports.uploadResume = async (req, res) => {
    let filePath = null;
    
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        let rawContent = '';

        // Parse PDF files
        if (fileExtension === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            rawContent = pdfData.text;
        } 
        // Parse text files
        else if (fileExtension === '.txt') {
            rawContent = fs.readFileSync(filePath, 'utf-8');
        }
        // For DOC/DOCX, we'll use the rawResumeText from body as fallback
        else {
            rawContent = req.body.rawResumeText || 'Unable to parse this file format. Please copy and paste the content.';
        }

        // Delete the temp file immediately after parsing
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Temp file deleted: ${filePath}`);
        }

        // Store only the text content in memory (no file)
        const id = uuidv4();
        resumeStore[id] = { 
            id, 
            rawContent, 
            filename: req.file.originalname,
            createdAt: new Date().toISOString() 
        };

        res.status(200).json({ 
            success: true, 
            message: 'Resume file uploaded and parsed successfully.', 
            id, 
            rawContent 
        });

    } catch (error) {
        // Clean up temp file if error occurs
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Temp file deleted after error: ${filePath}`);
        }
        
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: `Upload failed: ${error.message}` });
    }
};

/**
 * POST /api/resume/export - Real PDF generation, stream download, and delete temp PDF.
 * Supports both structured resumeData and plain text resumeText.
 */
exports.exportResume = async (req, res) => {
    const { resumeData, resumeText, userPlan } = req.body;
    
    // Check if we have either resumeData or resumeText
    if (!resumeData && !resumeText) {
        return res.status(400).json({ success: false, message: 'Missing resume data or text for export.' });
    }

    // If userPlan is provided and it's Free, deny PDF export
    if (userPlan === 'Free') {
        return res.status(403).json({ success: false, message: 'PDF export is only available for Pro and Ultimate plans.' });
    }

    let outputPath = null;

    try {
        // Create downloads directory if it doesn't exist
        const downloadsDir = path.join(__dirname, '..', 'downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        const filename = `${(resumeData?.name || 'tailored-resume').replace(/\s+/g, '_')}-${Date.now()}.pdf`;
        outputPath = path.join(downloadsDir, filename);

        // If resumeText is provided (plain text), generate a simple PDF
        if (resumeText) {
            await pdfService.generateTextOnlyPDF(resumeText, outputPath);
        } else {
            // Generate structured PDF from resumeData
            await pdfService.generateResumePDF(resumeData, outputPath);
        }

        // Stream the PDF to the client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        const fileStream = fs.createReadStream(outputPath);
        
        fileStream.pipe(res);

        // Delete the temp PDF after streaming is complete
        fileStream.on('end', () => {
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
                console.log(`Temp PDF deleted after download: ${filename}`);
            }
        });

        // Handle stream errors
        fileStream.on('error', (error) => {
            console.error('Stream error:', error);
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Download failed.' });
            }
        });

    } catch (error) {
        // Clean up temp PDF if error occurs
        if (outputPath && fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log(`Temp PDF deleted after error: ${outputPath}`);
        }
        
        console.error('PDF generation error:', error);
        res.status(500).json({ success: false, message: `PDF generation failed: ${error.message}` });
    }
};

/**
 * GET /api/resume/download/:filename - Download generated PDF
 */
exports.downloadPDF = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'downloads', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found.' });
    }

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).json({ success: false, message: 'Download failed.' });
        }
    });
};

/**
 * POST /api/resume/approve-changes - User approves AI-suggested changes and generates PDF.
 * PDF is streamed to client and deleted immediately.
 */
exports.approveChanges = async (req, res) => {
    const { originalData, tailoredData, userPlan } = req.body;

    if (!tailoredData || !userPlan) {
        return res.status(400).json({ success: false, message: 'Missing tailored data or user plan.' });
    }

    let outputPath = null;

    try {
        // Save the approved version in memory only
        const id = uuidv4();
        resumeStore[id] = { 
            id, 
            ...tailoredData, 
            approved: true,
            createdAt: new Date().toISOString() 
        };

        // Generate and stream PDF if user has Pro/Ultimate
        if (userPlan !== 'Free') {
            const downloadsDir = path.join(__dirname, '..', 'downloads');
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            const filename = `${(tailoredData.name || 'resume').replace(/\s+/g, '_')}-tailored-${Date.now()}.pdf`;
            outputPath = path.join(downloadsDir, filename);

            // Generate PDF
            await pdfService.generateResumePDF(tailoredData, outputPath);

            // Stream the PDF to client
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            const fileStream = fs.createReadStream(outputPath);
            fileStream.pipe(res);

            // Delete temp PDF after streaming
            fileStream.on('end', () => {
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                    console.log(`Temp PDF deleted after download: ${filename}`);
                }
            });

            fileStream.on('error', (error) => {
                console.error('Stream error:', error);
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
            });

        } else {
            res.status(200).json({ 
                success: true, 
                message: 'Changes approved and saved.',
                id
            });
        }

    } catch (error) {
        // Clean up temp PDF if error occurs
        if (outputPath && fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log(`Temp PDF deleted after error: ${outputPath}`);
        }
        
        console.error('Approve changes error:', error);
        res.status(500).json({ success: false, message: `Failed to approve changes: ${error.message}` });
    }
};