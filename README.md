# Veen - AI Resume Platform

A modern, full-stack AI-powered resume builder and tailoring platform.

## Features

- **Multi-step Resume Builder**: Create professional resumes from scratch with guided steps
- **AI-Powered Tailoring**: Upload existing resumes and auto-tailor them to job descriptions
- **Dual AI Model Support**: Choose between Google Gemini or OpenAI GPT models
- **Modern SaaS UI**: Built with React, TailwindCSS, with glassmorphism and smooth animations
- **Simulated Subscription Tiers**: Free, Pro, and Ultimate plans with different features

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **AI**: Google Gemini API, OpenAI API
- **Database**: In-memory JSON store (for demo)

## Project Structure

```
veen-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── VeenApp.jsx    # Main React component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Tailwind styles
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
├── server/                # Backend Express server
│   ├── server.js          # Express server setup
│   ├── apiController.js   # API endpoint handlers
│   └── aiService.js       # AI integration logic
├── .env                   # Environment variables (API keys)
└── package.json          # Server dependencies
```

## Setup Instructions

### 1. Install Dependencies

**Backend dependencies:**
```bash
npm install
```

**Frontend dependencies:**
```bash
cd client
npm install
cd ..
```

Or install both at once:
```bash
npm run install:all
```

### 2. Configure Environment Variables

Edit the `.env` file in the root directory and add your API keys:

```env
# At least one API key is required
GEMINI_API_KEY="your_gemini_api_key_here"
OPENAI_API_KEY="your_openai_api_key_here"
PORT=5000
```

**To get API keys:**
- **Gemini**: Visit [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **OpenAI**: Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 3. Run the Application

You need to run both the backend and frontend in separate terminals:

**Terminal 1 - Backend Server:**
```bash
npm run server
```
The server will start on `http://localhost:5000`

**Terminal 2 - Frontend Dev Server:**
```bash
npm run client
```
The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

### 4. Open the Application

Open your browser and navigate to the frontend URL (typically `http://localhost:5173`)

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/resume/create` - Save a resume draft
- `GET /api/resume/:id` - Retrieve a saved resume
- `POST /api/resume/upload` - Upload and parse resume
- `POST /api/resume/tailor` - AI-powered resume tailoring
- `POST /api/resume/summarize` - AI-enhanced summary generation
- `POST /api/resume/export` - Export resume as PDF (simulated)

## User Flows

### Create Resume From Scratch
1. Click "Start Creating Now"
2. Complete multi-step form (Personal Info → Experience → Education → Skills)
3. Use AI to enhance your professional summary
4. View live preview
5. Save and download (Pro/Ultimate plans)

### Upload & Auto-Tailor
1. Click "Upload & Tailor"
2. Paste existing resume content
3. Paste target job description
4. Select AI model (Gemini or OpenAI)
5. Click "Auto-Tailor My Resume"
6. Download optimized version (Pro/Ultimate plans)

## Subscription Tiers

- **Free**: Basic resume builder, AI summary enhancement (Gemini only)
- **Pro**: Unlimited AI tailoring, PDF export, both AI models
- **Ultimate**: All Pro features + priority processing + custom templates

## Development Notes

- The backend uses in-memory storage (data is lost on restart)
- PDF export is simulated with placeholder URLs
- File uploads are simulated (paste text instead)
- The app uses a simulated subscription system

## Troubleshooting

**Issue: `npm` or `node` not found**
- Ensure Node.js is installed: [https://nodejs.org/](https://nodejs.org/)
- Restart your terminal after installation
- Verify with: `node --version` and `npm --version`

**Issue: API errors**
- Check that your API keys are correctly set in `.env`
- Ensure the backend server is running
- Check the browser console for CORS errors

**Issue: Frontend can't connect to backend**
- Verify backend is running on port 5000
- Check `API_BASE_URL` in `client/src/VeenApp.jsx` (should be `http://localhost:5000/api/resume`)

## License

This is a demonstration project for educational purposes.
