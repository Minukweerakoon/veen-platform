const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Load keys from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Structured JSON Schema for Resume Output (ATS-friendly)
const RESUME_SCHEMA = {
    type: "OBJECT",
    properties: {
        summary: { "type": "STRING", "description": "The rewritten professional summary, tailored to the job description." },
        experience: {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": { "type": "STRING" },
                    "company": { "type": "STRING" },
                    "duration": { "type": "STRING" },
                    "description": { "type": "STRING", "description": "The primary bullet point, rewritten to be quantified and keyword-optimized." }
                }
            }
        },
        skills: { "type": "ARRAY", "items": { "type": "STRING" }, "description": "Top 10 skills directly relevant to the job description." },
        education: { "type": "STRING", "description": "Education details, kept as is." },
        // Add other sections as needed (e.g., projects)
    }
};

const SYSTEM_INSTRUCTION_BASE = "You are a professional resume tailoring specialist. Your task is to rewrite the provided resume content to maximize its relevance and keyword density for the target job description. Focus on quantifiable achievements and use ATS-friendly formatting. DO NOT invent experience; only rephrase existing points.";


/**
 * Core function to tailor resume content using the selected AI model.
 * @param {string} resumeText - The raw or JSON string of the existing resume.
 * @param {string} jobDescription - The target job description.
 * @param {string} provider - 'gemini' or 'openai'.
 * @param {string} userPlan - The user's current subscription plan ('Free', 'Pro', 'Ultimate').
 * @returns {Promise<object>} Parsed JSON object matching the RESUME_SCHEMA.
 */
exports.tailorResumeWithAI = async (resumeText, jobDescription, provider = 'openai', userPlan) => {
    // Default to OpenAI if no provider specified
    const aiProvider = provider || 'openai';

    const fullPrompt = `Existing Resume Content (JSON or plain text):
---
${resumeText}
---

Target Job Description:
---
${jobDescription}
---

Please rewrite and optimize the Summary, Experience descriptions, and Skills section to perfectly match the job description's requirements. Maintain the structure and only output the result as a single JSON object.`;

    if (aiProvider === 'gemini') {
        if (!GEMINI_API_KEY) {
            console.warn('Gemini API key not configured, falling back to OpenAI');
            if (!OPENAI_API_KEY) throw new Error("No AI API key is configured.");
            return callOpenAI(fullPrompt, OPENAI_API_KEY, OPENAI_API_URL);
        }
        return callGemini(fullPrompt, GEMINI_API_KEY, GEMINI_API_URL);

    } else if (aiProvider === 'openai') {
        if (!OPENAI_API_KEY) throw new Error("OpenAI API key is not configured.");
        return callOpenAI(fullPrompt, OPENAI_API_KEY, OPENAI_API_URL);

    } else {
        throw new Error(`Unsupported AI provider: ${aiProvider}`);
    }
};

// --- Gemini API Call ---
async function callGemini(prompt, apiKey, apiUrl, retries = 3) {
    const url = `${apiUrl}?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION_BASE }] },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESUME_SCHEMA,
        },
    };

    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.post(url, payload);
            const jsonText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) return JSON.parse(jsonText);
            throw new Error("No structured content received from Gemini.");
        } catch (error) {
            if (error.response?.status === 429 && i < retries - 1) {
                const delay = Math.pow(2, i) * 2000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw new Error(`Gemini API Failed: ${error.message}`);
        }
    }
}

// --- OpenAI API Call ---
async function callOpenAI(prompt, apiKey, apiUrl, retries = 3) {
    const payload = {
        model: "gpt-4o-mini", // Cost-effective model for text processing
        messages: [
            { role: "system", content: SYSTEM_INSTRUCTION_BASE },
            { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
    };

    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.post(apiUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const rawText = response.data.choices[0].message.content;
            return JSON.parse(rawText);

        } catch (error) {
            if (error.response?.status === 429 && i < retries - 1) {
                const delay = Math.pow(2, i) * 2000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw new Error(`OpenAI API Failed: ${error.message}`);
        }
    }
}