const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a professional PDF resume from structured JSON data
 * @param {Object} resumeData - The resume data object
 * @param {String} outputPath - Path where PDF will be saved
 * @returns {Promise<String>} - Path to generated PDF
 */
exports.generateResumePDF = (resumeData, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // --- HEADER SECTION ---
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .text(resumeData.name || 'Your Name', { align: 'center' });

            doc.fontSize(14)
               .font('Helvetica')
               .fillColor('#2563eb')
               .text(resumeData.title || 'Professional Title', { align: 'center' });

            doc.moveDown(0.5);

            // Contact Info
            doc.fontSize(10)
               .fillColor('#666666')
               .text([
                   resumeData.email || '',
                   resumeData.phone || '',
                   resumeData.location || ''
               ].filter(Boolean).join(' | '), { align: 'center' });

            if (resumeData.linkedin || resumeData.github) {
                doc.text([
                    resumeData.linkedin ? `LinkedIn: ${resumeData.linkedin}` : '',
                    resumeData.github ? `GitHub: ${resumeData.github}` : ''
                ].filter(Boolean).join(' | '), { align: 'center' });
            }

            doc.moveDown(1);
            doc.strokeColor('#2563eb').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);

            // --- SUMMARY SECTION ---
            if (resumeData.summary) {
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#000000')
                   .text('PROFESSIONAL SUMMARY');
                
                doc.moveDown(0.3);
                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(resumeData.summary, { align: 'justify' });
                
                doc.moveDown(1);
            }

            // --- EXPERIENCE SECTION ---
            if (resumeData.experience && resumeData.experience.length > 0) {
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#000000')
                   .text('PROFESSIONAL EXPERIENCE');
                
                doc.moveDown(0.5);

                resumeData.experience.forEach((exp, index) => {
                    doc.fontSize(11)
                       .font('Helvetica-Bold')
                       .fillColor('#000000')
                       .text(exp.title || 'Job Title', { continued: true })
                       .font('Helvetica')
                       .text(` | ${exp.company || 'Company'}`, { continued: true })
                       .fillColor('#666666')
                       .text(` (${exp.duration || 'Duration'})`, { align: 'left' });

                    doc.moveDown(0.3);

                    if (exp.description) {
                        const bullets = exp.description.split('\n').filter(b => b.trim());
                        bullets.forEach(bullet => {
                            doc.fontSize(10)
                               .font('Helvetica')
                               .fillColor('#333333')
                               .text(`• ${bullet.trim()}`, { indent: 15 });
                        });
                    }

                    if (index < resumeData.experience.length - 1) {
                        doc.moveDown(0.8);
                    }
                });

                doc.moveDown(1);
            }

            // --- EDUCATION SECTION ---
            if (resumeData.education && resumeData.education.length > 0) {
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#000000')
                   .text('EDUCATION');
                
                doc.moveDown(0.5);

                resumeData.education.forEach((edu, index) => {
                    doc.fontSize(11)
                       .font('Helvetica-Bold')
                       .fillColor('#000000')
                       .text(edu.degree || 'Degree', { continued: true })
                       .font('Helvetica')
                       .text(` | ${edu.institution || 'Institution'}`, { continued: true })
                       .fillColor('#666666')
                       .text(` (${edu.duration || 'Duration'})`, { align: 'left' });

                    if (index < resumeData.education.length - 1) {
                        doc.moveDown(0.5);
                    }
                });

                doc.moveDown(1);
            }

            // --- SKILLS SECTION ---
            if (resumeData.skills && resumeData.skills.length > 0) {
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#000000')
                   .text('SKILLS');
                
                doc.moveDown(0.3);
                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(resumeData.skills.join(' • '), { align: 'left' });
                
                doc.moveDown(1);
            }

            // --- PROJECTS/CERTIFICATIONS SECTION ---
            if (resumeData.projects && resumeData.projects.length > 0) {
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#000000')
                   .text('PROJECTS & CERTIFICATIONS');
                
                doc.moveDown(0.5);

                resumeData.projects.forEach(project => {
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#333333')
                       .text(`• ${project}`, { indent: 15 });
                });
            }

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generates a simple PDF from plain text (for AI-tailored resumes)
 * @param {String} textContent - The plain text content
 * @param {String} outputPath - Path where PDF will be saved
 * @returns {Promise<String>} - Path to generated PDF
 */
exports.generateTextOnlyPDF = (textContent, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Simple text layout
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#000000')
               .text(textContent, {
                   align: 'left',
                   lineGap: 2
               });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};
