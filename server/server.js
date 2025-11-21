const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST, before requiring other modules
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const apiController = require('./apiController');

const app = express();
const PORT = process.env.PORT || 5000;

// --- File Upload Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        
        if (extname || mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- Middleware ---
// Configure CORS to allow frontend access
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite default is 5173
    methods: ['GET', 'POST'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' })); // Increased limit for large resume text/data
app.use(express.urlencoded({ extended: true }));

// Serve static files (PDFs)
app.use('/downloads', express.static(path.join(__dirname, '..', 'downloads')));

// --- API Routes ---

// Resume Builder/Draft routes
app.post('/api/resume/create', apiController.createResume);
app.get('/api/resume/:id', apiController.getResume);

// AI Processing routes
app.post('/api/resume/tailor', apiController.tailorResume);
app.post('/api/resume/summarize', apiController.summarizeResume);

// File Upload and Export routes
app.post('/api/resume/upload', upload.single('resume'), apiController.uploadResume);
app.post('/api/resume/export', apiController.exportResume);
app.get('/api/resume/download/:filename', apiController.downloadPDF);

// Approve tailored changes
app.post('/api/resume/approve-changes', apiController.approveChanges);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Veen Backend Running', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Veen Backend Server running on http://localhost:${PORT}`);
    console.log(`Using Gemini: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
    console.log(`Using OpenAI: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
});