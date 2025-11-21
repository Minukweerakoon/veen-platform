import React, { useState, useCallback, useEffect } from 'react';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:3001/api/resume';

// Initial dummy state reflecting a structured resume
const INITIAL_RESUME_STATE = {
    name: "Jane Doe",
    title: "Senior Full Stack Developer",
    email: "jane.doe@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "janedoe",
    github: "janedoe",
    summary: "Motivated developer with expertise in React and Node.js. Seeking a challenging role to build impactful applications.",
    photoUrl: "https://placehold.co/100x100/2563eb/ffffff?text=JD",
    experience: [
        { id: 1, title: "Software Engineer", company: "TechCorp", duration: "2022 - Present", description: "Developed scalable APIs and maintained frontend components." },
    ],
    education: [
        { id: 1, institution: "State University", degree: "B.S. Computer Science", duration: "2018 - 2022" },
    ],
    skills: ["React", "Node.js", "TypeScript", "Tailwind CSS"],
    projects: ["E-commerce Platform Optimization", "AI Chatbot Integration"],
};

// --- SUBSCRIPTION PLANS & BENEFITS ---
const PLANS = [
    { name: 'Free', price: '$0', tagline: 'The perfect starter to build a basic resume.', color: 'gray', benefits: [
        'Multi-step Resume Builder', 'AI Summary Enhancement', 'Live Preview', 'Basic ATS formatting'
    ]},
    { name: 'Pro', price: '$9/mo', tagline: 'Unlock AI tailoring and advanced features.', color: 'blue', benefits: [
        'All Free features', 'Unlimited AI Tailoring', 'ATS Keyword Density Check', 'Download PDF/DOCX Export'
    ]},
    { name: 'Ultimate', price: '$19/mo', tagline: 'Premium support and highest AI quality.', color: 'indigo', benefits: [
        'All Pro features', 'Priority AI Processing (Lower Latency)', 'Dedicated Support', 'Customizable Premium Templates', 'Integrated Cover Letter Generation'
    ]},
];

// --- UTILITY COMPONENTS ---

const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-white"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-white delay-150"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-white delay-300"></div>
    </div>
);

const SectionTitle = ({ icon: Icon, title, color = 'text-blue-500' }) => (
    <h2 className={`flex items-center text-2xl font-bold mb-6 ${color}`}>
        <Icon className={`w-6 h-6 mr-3 ${color}`} />
        {title}
    </h2>
);

const GlassButton = ({ children, onClick, disabled = false, className = '', color = 'blue' }) => {
    const baseStyle = "px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
    let colorStyle = '';

    switch (color) {
        case 'blue':
            colorStyle = 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/60';
            break;
        case 'green':
            colorStyle = 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/60';
            break;
        case 'indigo':
            colorStyle = 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/60';
            break;
        case 'gray':
            colorStyle = 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-md hover:shadow-gray-400/50';
            break;
        default:
            colorStyle = 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/60';
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${colorStyle} ${className}`}
        >
            {children}
        </button>
    );
};

// Tailwind class for input fields
const INPUT_CLASS = "w-full p-3 border border-gray-300 bg-white/70 backdrop-blur-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200";

// --- ICONS (Lucide) ---
const HomeIcon = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FileText = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>;
const UploadCloud = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>;
const Zap = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const ChevronRight = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const Download = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const Save = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const Trash2 = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/></svg>;
const User = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Briefcase = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const GraduationCap = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.5 5.586a1 1 0 0 0-1 0L2.6 9.084a1 1 0 0 0-.019 1.838l8.9 3.336a1 1 0 0 0 1 0z"/><path d="M11 12v6h2v-6"/><path d="M12 22a4 4 0 0 0 4-4v-4l-4-1-4 1v4a4 4 0 0 0 4 4z"/></svg>;
const Settings = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.19a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.33a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.19a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.56a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const X = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const Check = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
const DollarSign = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;


// --- API FETCH HELPER ---
const fetchApi = async (endpoint, method = 'GET', body = null) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok || data.success === false) {
            throw new Error(data.message || `API Error: ${response.status} ${response.statusText}`);
        }
        return data;
    } catch (error) {
        console.error("API Call Failed:", error);
        throw error;
    }
};

// --- MULTI-STEP RESUME BUILDER COMPONENTS ---

const stepConfig = [
    { title: "Personal Info", icon: User, key: 'personal', component: 'PersonalInfoForm' },
    { title: "Experience", icon: Briefcase, key: 'experience', component: 'ExperienceForm' },
    { title: "Education", icon: GraduationCap, key: 'education', component: 'EducationForm' },
    { title: "Skills & Projects", icon: Settings, key: 'skills', component: 'SkillsProjectsForm' },
];

const PersonalInfoForm = ({ data, setData, goNext, setIsLoading, setMessage, isLoading, userPlan }) => {
    const handleChange = (e) => {
        setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSummarize = async () => {
        if (!data.name || !data.title || !data.summary) {
            setMessage({ text: "Please fill in Name, Title, and a Summary Draft first.", type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: "AI is writing a professional summary...", type: 'loading' });

        try {
            const result = await fetchApi('/summarize', 'POST', {
                name: data.name,
                title: data.title,
                summaryDraft: data.summary,
                userPlan: userPlan
            });

            setData(prev => ({ ...prev, summary: result.summary }));
            setMessage({ text: "Professional summary enhanced successfully!", type: 'success' });
        } catch (error) {
            setMessage({ text: `AI Enhancement Failed: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <SectionTitle icon={User} title="Personal & Contact Information" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="name" placeholder="Full Name" value={data.name} onChange={handleChange} className={`${INPUT_CLASS} md:col-span-2 text-xl font-semibold`} />
                <input name="photoUrl" placeholder="Photo URL" value={data.photoUrl} onChange={handleChange} className={INPUT_CLASS} />
                <input name="title" placeholder="Professional Title" value={data.title} onChange={handleChange} className={`${INPUT_CLASS} md:col-span-3`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="email" placeholder="Email Address" value={data.email} onChange={handleChange} className={INPUT_CLASS} />
                <input name="phone" placeholder="Phone Number" value={data.phone} onChange={handleChange} className={INPUT_CLASS} />
                <input name="location" placeholder="City, State" value={data.location} onChange={handleChange} className={INPUT_CLASS} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="linkedin" placeholder="LinkedIn Profile Name" value={data.linkedin} onChange={handleChange} className={INPUT_CLASS} />
                <input name="github" placeholder="GitHub Username" value={data.github} onChange={handleChange} className={INPUT_CLASS} />
            </div>

            <label className="block text-gray-700 font-medium pt-2">Professional Summary Draft</label>
            <textarea name="summary" placeholder="Your draft summary... (The AI will enhance this)" value={data.summary} onChange={handleChange} rows="4" className={INPUT_CLASS} />
            
            <GlassButton onClick={handleSummarize} color="green" disabled={isLoading} className="w-full">
                {isLoading ? <LoadingSpinner /> : <><Zap className="w-5 h-5 mr-2" /> Auto-Enhance Summary</>}
            </GlassButton>
             <p className="text-sm text-gray-500 text-center mt-2">Available for all plans (AI-Powered)</p>

            <GlassButton onClick={goNext} className="w-full mt-4">
                Save & Continue <ChevronRight className="w-5 h-5 ml-2" />
            </GlassButton>
        </div>
    );
};

const ExperienceForm = ({ data, setData, goNext, goBack }) => {
    const handleExpChange = (id, field, value) => {
        setData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            ),
        }));
    };

    const handleAddExp = () => {
        const newId = data.experience.length ? Math.max(...data.experience.map(e => e.id)) + 1 : 1;
        setData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: newId, title: '', company: '', duration: '', description: '' }],
        }));
    };

    const handleDeleteExp = (id) => {
        setData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id),
        }));
    };

    return (
        <div className="space-y-6">
            <SectionTitle icon={Briefcase} title="Work Experience" />

            {data.experience.map(exp => (
                <div key={exp.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 shadow-inner relative transition duration-300 hover:shadow-lg">
                    <button onClick={() => handleDeleteExp(exp.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 transition">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input placeholder="Job Title" value={exp.title} onChange={(e) => handleExpChange(exp.id, 'title', e.target.value)} className={INPUT_CLASS} />
                        <input placeholder="Company Name" value={exp.company} onChange={(e) => handleExpChange(exp.id, 'company', e.target.value)} className={INPUT_CLASS} />
                        <input placeholder="Duration (e.g., 2020-Present)" value={exp.duration} onChange={(e) => handleExpChange(exp.id, 'duration', e.target.value)} className="col-span-2 input-field" />
                    </div>
                    <textarea placeholder="Key achievement or responsibility (use quantified results!)" value={exp.description} rows="2" onChange={(e) => handleExpChange(exp.id, 'description', e.target.value)} className={INPUT_CLASS} />
                </div>
            ))}
            
            <GlassButton onClick={handleAddExp} color="gray" className="w-full">
                + Add Another Position
            </GlassButton>

            <div className="flex justify-between pt-4">
                <GlassButton onClick={goBack} color="gray">
                    Back
                </GlassButton>
                <GlassButton onClick={goNext}>
                    Save & Continue <ChevronRight className="w-5 h-5 ml-2" />
                </GlassButton>
            </div>
        </div>
    );
};

const EducationForm = ({ data, setData, goNext, goBack }) => {
    const handleEduChange = (id, field, value) => {
        setData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            ),
        }));
    };

    const handleAddEdu = () => {
        const newId = data.education.length ? Math.max(...data.education.map(e => e.id)) + 1 : 1;
        setData(prev => ({
            ...prev,
            education: [...prev.education, { id: newId, institution: '', degree: '', duration: '' }],
        }));
    };

    const handleDeleteEdu = (id) => {
        setData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id),
        }));
    };

    return (
        <div className="space-y-6">
            <SectionTitle icon={GraduationCap} title="Education" />

            {data.education.map(edu => (
                <div key={edu.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 shadow-inner relative transition duration-300 hover:shadow-lg">
                    <button onClick={() => handleDeleteEdu(edu.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 transition">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input placeholder="Institution Name" value={edu.institution} onChange={(e) => handleEduChange(edu.id, 'institution', e.target.value)} className={INPUT_CLASS} />
                        <input placeholder="Degree / Certification" value={edu.degree} onChange={(e) => handleEduChange(edu.id, 'degree', e.target.value)} className={INPUT_CLASS} />
                        <input placeholder="Duration (e.g., 2018 - 2022)" value={edu.duration} onChange={(e) => handleEduChange(edu.id, 'duration', e.target.value)} className="col-span-2 input-field" />
                    </div>
                </div>
            ))}

            <GlassButton onClick={handleAddEdu} color="gray" className="w-full">
                + Add Another Entry
            </GlassButton>

            <div className="flex justify-between pt-4">
                <GlassButton onClick={goBack} color="gray">
                    Back
                </GlassButton>
                <GlassButton onClick={goNext}>
                    Save & Continue <ChevronRight className="w-5 h-5 ml-2" />
                </GlassButton>
            </div>
        </div>
    );
};

const SkillsProjectsForm = ({ data, setData, goFinal, goBack, setIsLoading, setMessage }) => {
    const [skillInput, setSkillInput] = useState('');

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const newSkill = skillInput.trim();
            if (newSkill && !data.skills.includes(newSkill)) {
                setData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
                setSkillInput('');
            }
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };
    
    const handleProjectChange = (e) => {
         // Converts comma/newline separated text into an array of strings
        const projectsArray = e.target.value.split(/[\n,]/).map(p => p.trim()).filter(p => p.length > 0);
        setData(prev => ({ ...prev, projects: projectsArray }));
    };

    const handleFinalSubmit = async () => {
        setIsLoading(true);
        setMessage({ text: "Saving your completed resume...", type: 'loading' });

        try {
            const result = await fetchApi('/create', 'POST', { resumeData: data });
            setMessage({ text: `Resume saved successfully! ID: ${result.id}`, type: 'success' });
            goFinal(result.id);
        } catch (error) {
            setMessage({ text: `Save Failed: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <SectionTitle icon={Settings} title="Skills & Optional Details" />

            {/* Skills */}
            <div className="bg-white p-5 rounded-xl shadow-md border-t-2 border-indigo-500">
                <label className="block text-gray-700 font-medium mb-2">Technical Skills (Press Enter or click Add)</label>
                <div className="flex mb-4">
                    <input
                        placeholder="e.g., Docker, Python, Figma"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        className={`${INPUT_CLASS} flex-grow mr-2`}
                    />
                    <GlassButton onClick={handleAddSkill} color="gray" className="flex-shrink-0">Add</GlassButton>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {data.skills.map(skill => (
                        <span key={skill} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full flex items-center shadow-sm transition hover:bg-indigo-200">
                            {skill}
                            <button onClick={() => handleRemoveSkill(skill)} className="ml-2 text-indigo-600 hover:text-indigo-900 transition leading-none">
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Projects/Certifications */}
            <div className="bg-white p-5 rounded-xl shadow-md border-t-2 border-indigo-500">
                <label className="block text-gray-700 font-medium mb-2">Projects / Certifications (One per line)</label>
                <textarea 
                    placeholder="List key projects or certifications (e.g., AWS Certified Developer, E-commerce App built with React)"
                    value={data.projects.join('\n')}
                    rows="3"
                    onChange={handleProjectChange}
                    className={INPUT_CLASS}
                />
            </div>

            <div className="flex justify-between pt-4">
                <GlassButton onClick={goBack} color="gray">
                    Back
                </GlassButton>
                <GlassButton onClick={handleFinalSubmit} color="green">
                    <Save className="w-5 h-5 mr-2" />
                    Finish & View Resume
                </GlassButton>
            </div>
        </div>
    );
};

// --- TAILORING PAGE COMPONENT ---

const UploadTailorPage = ({ setPage, setIsLoading, setMessage, isLoading, userPlan }) => {
    const [rawResumeText, setRawResumeText] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [jobDescription, setJobDescription] = useState("Lead Software Engineer: 5+ years React/TypeScript, high-performance data visualization tools, AWS cloud infrastructure (Lambda, DynamoDB). Strong design patterns and CI/CD.");
    const [originalData, setOriginalData] = useState(null); // Original parsed CV data
    const [tailoredData, setTailoredData] = useState(null); // AI-enhanced data (editable)
    const [showComparison, setShowComparison] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleFileUpload = async (file) => {
        if (!file) return;
        
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
        if (!validTypes.includes(file.type)) {
            setMessage({ text: "Please upload a PDF, DOC, DOCX, or TXT file.", type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: "Uploading and parsing your resume...", type: 'loading' });

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await fetch(`${API_BASE_URL.replace('/resume', '')}/resume/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            setRawResumeText(result.rawContent || '');
            
            // Try to parse the CV into structured data
            try {
                const parsed = typeof result.rawContent === 'string' ? JSON.parse(result.rawContent) : result.rawContent;
                setOriginalData(parsed);
            } catch (e) {
                // If not JSON, keep as text - AI will parse it
                setOriginalData({ rawText: result.rawContent });
            }
            
            setUploadedFileName(file.name);
            setMessage({ text: `✓ Resume uploaded and parsed successfully! (${file.name})`, type: 'success' });
        } catch (error) {
            setMessage({ text: `Upload failed: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    };

    const handleTailor = async () => {
        if (!rawResumeText || !jobDescription) {
            setMessage({ text: "Please provide both resume content and the job description.", type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: `AI is analyzing your resume and suggesting improvements...`, type: 'loading' });
        setShowComparison(false);

        try {
            // Call the tailor endpoint with original resume
            const result = await fetchApi('/tailor', 'POST', { 
                resumeText: rawResumeText, 
                jobDescription, 
                modelProvider: 'openai',
                userPlan,
                preserveOriginal: true // Tell backend to preserve original data
            });
            
            // Merge original data with AI suggestions
            // AI will fill in missing fields, but preserve original data
            const enhancedData = {
                // Preserve original contact info
                name: result.tailoredJson.name || originalData?.name || '',
                title: result.tailoredJson.title || originalData?.title || '',
                email: result.tailoredJson.contact?.email || result.tailoredJson.email || originalData?.email || '',
                phone: result.tailoredJson.contact?.phone || result.tailoredJson.phone || originalData?.phone || '',
                location: result.tailoredJson.contact?.location || result.tailoredJson.location || originalData?.location || '',
                linkedin: result.tailoredJson.links?.LinkedIn || result.tailoredJson.linkedin || originalData?.linkedin || '',
                github: result.tailoredJson.links?.GitHub || result.tailoredJson.github || originalData?.github || '',
                
                // Use AI-enhanced summary but preserve original if AI didn't provide one
                professional_summary: result.tailoredJson.professional_summary || result.tailoredJson.summary || originalData?.summary || '',
                
                // Merge experience - AI enhancements + original data
                professional_experience: result.tailoredJson.professional_experience || result.tailoredJson.experience || originalData?.experience || [],
                
                // Skills - AI should enhance these based on job description
                skills: result.tailoredJson.skills || originalData?.skills || [],
                
                // Education - preserve original
                education: result.tailoredJson.education || originalData?.education || [],
                
                // Projects - preserve original
                projects: result.tailoredJson.projects || originalData?.projects || []
            };
            
            setTailoredData(enhancedData);
            setShowComparison(true);
            setMessage({ text: "✓ AI-enhanced! Review your CV with improvements, edit as needed, then download.", type: 'success' });

        } catch (error) {
            setMessage({ text: `Tailoring Failed: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle field changes in tailored data
    const handleTailoredChange = (field, value) => {
        setTailoredData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTailoredContactChange = (field, value) => {
        setTailoredData(prev => ({
            ...prev,
            contact: {
                ...(prev.contact || {}),
                [field]: value
            }
        }));
    };

    const handleTailoredExperienceChange = (index, field, value) => {
        setTailoredData(prev => ({
            ...prev,
            professional_experience: (prev.professional_experience || prev.experience).map((exp, idx) =>
                idx === index ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const handleDownloadTailored = async () => {
        if (!tailoredData) {
            setMessage({ text: "No tailored resume to download!", type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: "Generating PDF...", type: 'loading' });
        
        try {
            const response = await fetch(`${API_BASE_URL.replace('/resume', '')}/resume/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: tailoredData, userPlan })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(tailoredData.name || 'tailored-resume').replace(/\s+/g, '_')}-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setMessage({ text: "Tailored resume downloaded successfully!", type: 'success' });
        } catch (error) {
            setMessage({ text: `Download failed: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-6 flex items-center">
                <UploadCloud className="w-8 h-8 mr-3 text-blue-600" /> Upload & Auto-Tailor
            </h1>
            <p className="text-gray-600 mb-8">
                Paste your existing resume content and the job description. Veen's AI will rewrite and optimize it for the specific role.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                        <h2 className="text-xl font-semibold mb-3">Existing Resume Content</h2>
                        {/* Drag and drop area */}
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-6 border-2 border-dashed rounded-lg text-center mb-4 cursor-pointer transition-all ${
                                isDragging 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/50'
                            }`}
                        >
                            <UploadCloud className={`w-10 h-10 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-500'}`} />
                            <p className="text-sm text-gray-600 font-medium">
                                {isDragging ? 'Drop your file here' : 'Drag & Drop PDF/DOCX or Click to Browse'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOC, DOCX, TXT</p>
                            {uploadedFileName && (
                                <p className="text-xs text-green-600 mt-2 font-semibold">
                                    ✓ Uploaded: {uploadedFileName}
                                </p>
                            )}
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                        <textarea
                            value={rawResumeText}
                            onChange={(e) => setRawResumeText(e.target.value)}
                            rows="12"
                            placeholder="Your resume content will appear here after upload, or you can paste it directly..."
                            className={`${INPUT_CLASS} font-mono text-sm`}
                        ></textarea>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                        <h2 className="text-xl font-semibold mb-3">Target Job Description</h2>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows="8"
                            placeholder="Paste the target job description here..."
                            className={INPUT_CLASS}
                        ></textarea>
                    </div>

                    <GlassButton onClick={handleTailor} disabled={isLoading} color="indigo" className="w-full">
                        {isLoading ? <LoadingSpinner /> : <><Zap className="w-5 h-5 mr-2" /> Auto-Tailor My Resume</>}
                    </GlassButton>
                </div>

                {/* Enhanced Resume Editor */}
                <div className="lg:sticky lg:top-8 self-start">
                    <div className="bg-white p-8 rounded-xl shadow-2xl h-full min-h-[500px] border-t-4 border-green-500">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-green-600" />
                            {showComparison ? 'AI-Enhanced Resume (Editable)' : 'Enhanced Resume Preview'}
                        </h2>
                        {showComparison && tailoredData ? (
                            <>
                                <div className="p-6 bg-gray-50 rounded-lg max-h-[60vh] overflow-y-auto space-y-4">
                                    {/* Editable Header */}
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={tailoredData.name || ''}
                                            onChange={(e) => handleTailoredChange('name', e.target.value)}
                                            placeholder="Full Name"
                                            className={`${INPUT_CLASS} text-2xl font-bold text-center`}
                                        />
                                        <input
                                            type="text"
                                            value={tailoredData.title || ''}
                                            onChange={(e) => handleTailoredChange('title', e.target.value)}
                                            placeholder="Professional Title"
                                            className={`${INPUT_CLASS} text-lg text-center text-blue-600`}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <input
                                                type="email"
                                                value={tailoredData.contact?.email || tailoredData.email || ''}
                                                onChange={(e) => handleTailoredContactChange('email', e.target.value)}
                                                placeholder="Email"
                                                className={`${INPUT_CLASS} text-sm`}
                                            />
                                            <input
                                                type="tel"
                                                value={tailoredData.contact?.phone || tailoredData.phone || ''}
                                                onChange={(e) => handleTailoredContactChange('phone', e.target.value)}
                                                placeholder="Phone"
                                                className={`${INPUT_CLASS} text-sm`}
                                            />
                                            <input
                                                type="text"
                                                value={tailoredData.contact?.location || tailoredData.location || ''}
                                                onChange={(e) => handleTailoredContactChange('location', e.target.value)}
                                                placeholder="Location"
                                                className={`${INPUT_CLASS} text-sm`}
                                            />
                                        </div>
                                    </div>

                                    {/* Professional Summary */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-gray-700">PROFESSIONAL SUMMARY</h3>
                                        <textarea
                                            value={tailoredData.professional_summary || tailoredData.summary || ''}
                                            onChange={(e) => handleTailoredChange('professional_summary', e.target.value)}
                                            rows="4"
                                            placeholder="Professional summary..."
                                            className={`${INPUT_CLASS} text-sm`}
                                        />
                                    </div>

                                    {/* Experience */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-gray-700">PROFESSIONAL EXPERIENCE</h3>
                                        {(tailoredData.professional_experience || tailoredData.experience || []).map((exp, idx) => (
                                            <div key={idx} className="pl-4 border-l-2 border-green-400 space-y-2">
                                                <input
                                                    type="text"
                                                    value={exp.title || ''}
                                                    onChange={(e) => handleTailoredExperienceChange(idx, 'title', e.target.value)}
                                                    placeholder="Job Title"
                                                    className={`${INPUT_CLASS} font-semibold text-sm`}
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        value={exp.company || ''}
                                                        onChange={(e) => handleTailoredExperienceChange(idx, 'company', e.target.value)}
                                                        placeholder="Company"
                                                        className={`${INPUT_CLASS} text-sm`}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={exp.duration || ''}
                                                        onChange={(e) => handleTailoredExperienceChange(idx, 'duration', e.target.value)}
                                                        placeholder="Duration"
                                                        className={`${INPUT_CLASS} text-sm`}
                                                    />
                                                </div>
                                                <textarea
                                                    value={exp.description || ''}
                                                    onChange={(e) => handleTailoredExperienceChange(idx, 'description', e.target.value)}
                                                    rows="2"
                                                    placeholder="Key achievements..."
                                                    className={`${INPUT_CLASS} text-sm`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Skills */}
                                    {tailoredData.skills && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-bold text-gray-700">SKILLS</h3>
                                            <input
                                                type="text"
                                                value={Array.isArray(tailoredData.skills) ? tailoredData.skills.join(', ') : tailoredData.skills}
                                                onChange={(e) => handleTailoredChange('skills', e.target.value.split(',').map(s => s.trim()))}
                                                placeholder="Comma-separated skills"
                                                className={`${INPUT_CLASS} text-sm`}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-6 space-y-3">
                                    <GlassButton onClick={handleDownloadTailored} color="green" className="w-full">
                                        <Download className="w-5 h-5 mr-2" />
                                        Save & Download Professional PDF
                                    </GlassButton>
                                    <p className="text-xs text-gray-500 text-center">
                                        ✓ AI-enhanced • Editable • ATS-friendly
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-400 italic text-center">
                                    {isLoading ? "AI is processing the content. Stand by..." : "Upload your resume and click 'Auto-Tailor My Resume' to see AI suggestions."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- RESUME PREVIEW & PDF DOWNLOAD LOGIC ---

const ResumePreview = ({ data, isFinal = false, resumeId, setIsLoading, setMessage, userPlan }) => {
    const canDownload = userPlan !== 'Free';
    
    const handleDownload = async () => {
        if (!canDownload) {
            setMessage({ text: "Error: PDF export requires a Pro or Ultimate subscription.", type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: "Generating PDF...", type: 'loading' });
        
        try {
            const response = await fetch(`${API_BASE_URL.replace('/resume', '')}/resume/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: data, userPlan: userPlan }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'PDF generation failed');
            }

            // Get the PDF blob and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(data.name || 'resume').replace(/\s+/g, '_')}-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setMessage({ text: "PDF downloaded successfully!", type: 'success' });
        } catch (error) {
            setMessage({ text: `PDF Export Failed: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 shadow-2xl rounded-xl h-full border border-gray-100 overflow-hidden">
            
            {/* Final View Header */}
            {isFinal && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                    <p className="text-lg font-semibold text-green-700">Resume saved and finalized!</p>
                    <p className="text-sm text-green-600">Draft ID: {resumeId || 'N/A'}</p>
                </div>
            )}

            {/* Header */}
            <header className="pb-4 mb-4 border-b-2 border-blue-500 flex items-start space-x-4">
                <img src={data.photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover shadow-md" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{data.name || 'Your Name'}</h1>
                    <p className="text-lg font-medium text-blue-600">{data.title || 'Your Title'}</p>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                        <span>{data.email}</span>
                        <span>{data.phone}</span>
                        <span>{data.location}</span>
                    </div>
                </div>
            </header>

            {/* Summary */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200">Summary</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
            </div>

            {/* Experience */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200">Experience</h2>
                {data.experience.map(exp => (
                    <div key={exp.id} className="mb-4 pl-3 border-l-2 border-blue-200">
                        <div className="flex justify-between items-start">
                            <h3 className="text-base font-semibold text-gray-900">{exp.title}</h3>
                            <span className="text-sm text-gray-500">{exp.duration}</span>
                        </div>
                        <p className="text-sm italic text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                    </div>
                ))}
            </div>

            {/* Education */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200">Education</h2>
                {data.education.map(edu => (
                    <div key={edu.id} className="mb-2">
                        <div className="flex justify-between items-start">
                            <h3 className="text-base font-semibold text-gray-900">{edu.degree}</h3>
                            <span className="text-sm text-gray-500">{edu.duration}</span>
                        </div>
                        <p className="text-sm italic text-gray-600">{edu.institution}</p>
                    </div>
                ))}
            </div>

            {/* Skills & Projects */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200">Skills & Projects</h2>
                
                <h3 className="text-sm font-semibold text-gray-700 mt-3">Skills:</h3>
                <div className="flex flex-wrap gap-2">
                    {data.skills.map(skill => (
                        <span key={skill} className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">{skill}</span>
                    ))}
                </div>

                {data.projects && data.projects.length > 0 && (
                    <>
                        <h3 className="text-sm font-semibold text-gray-700 mt-4">Projects / Certifications:</h3>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                            {data.projects.map((proj, index) => <li key={index}>{proj}</li>)}
                        </ul>
                    </>
                )}
            </div>


            {isFinal && (
                <>
                    <GlassButton onClick={handleDownload} color={canDownload ? "blue" : "gray"} disabled={!canDownload} className="w-full mt-4">
                        <Download className="w-5 h-5 mr-2" />
                        {canDownload ? 'Download PDF' : 'Upgrade for PDF Export'}
                    </GlassButton>
                    {!canDownload && (
                         <p className="text-xs text-red-500 mt-2 text-center">PDF Export requires Pro or Ultimate plan.</p>
                    )}
                </>
            )}
        </div>
    );
};

// --- PRICING PAGE COMPONENT ---
const PricingPage = ({ setPage, userPlan, setUserPlan }) => {
    
    // Helper to determine tailwind colors dynamically
    const getColorClasses = (color) => {
        switch (color) {
            case 'blue': return 'bg-blue-600 border-blue-600 text-blue-600';
            case 'indigo': return 'bg-indigo-600 border-indigo-600 text-indigo-600';
            default: return 'bg-gray-400 border-gray-400 text-gray-500';
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-16 px-4">
            <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-4">
                <DollarSign className="inline w-8 h-8 mr-3 text-green-500" /> Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 text-center mb-12">
                Unlock powerful AI tools and premium features to land your dream job faster.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan) => {
                    const isCurrent = userPlan === plan.name;
                    const colorClasses = getColorClasses(plan.color);

                    return (
                        <div key={plan.name} className={`bg-white p-8 rounded-2xl shadow-2xl transition duration-300 transform ${isCurrent ? 'ring-4 ring-offset-4 ring-green-500' : 'hover:scale-[1.03] hover:shadow-xl'}`}>
                            
                            <p className={`text-sm font-semibold mb-2 ${isCurrent ? 'text-green-600' : colorClasses}`}>
                                {isCurrent ? 'CURRENT PLAN' : plan.tagline}
                            </p>
                            <h2 className="text-3xl font-bold mb-1 text-gray-900">{plan.name}</h2>
                            <p className="text-5xl font-extrabold text-gray-900 mb-6">
                                {plan.price}
                                {plan.price !== '£0' && <span className="text-lg font-normal text-gray-500">/month</span>}
                            </p>

                            <ul className="space-y-3 mb-8 text-gray-700">
                                {plan.benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-center text-sm">
                                        <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>

                            <GlassButton 
                                onClick={() => setUserPlan(plan.name)} 
                                disabled={isCurrent} 
                                className="w-full text-lg"
                                color={isCurrent ? 'gray' : plan.color}
                            >
                                {isCurrent ? 'Your Current Plan' : 'Select Plan'}
                            </GlassButton>
                        </div>
                    );
                })}
            </div>
             <div className="text-center mt-12 text-sm text-gray-500">
                <p>This is a simulated pricing page. Switching plans here is for demonstration purposes only.</p>
            </div>
        </div>
    );
};


// --- CORE PAGES ---

const CreateResumePage = ({ setPage, isLoading, setIsLoading, message, setMessage, userPlan }) => {
    const [resumeData, setResumeData] = useState(INITIAL_RESUME_STATE);
    const [step, setStep] = useState(0);
    const [finalId, setFinalId] = useState(null);

    const goNext = () => setStep(prev => Math.min(prev + 1, stepConfig.length));
    const goBack = () => setStep(prev => Math.max(prev - 1, 0));
    const goFinal = (id) => {
        setFinalId(id);
        setStep(stepConfig.length);
    };

    const CurrentFormComponent = () => {
        const currentStep = stepConfig[step];
        if (!currentStep) return null;

        const props = { 
            data: resumeData, 
            setData: setResumeData, 
            goNext, 
            goBack, 
            setIsLoading, 
            setMessage,
            goFinal,
            isLoading,
            userPlan
        };

        switch (currentStep.component) {
            case 'PersonalInfoForm': return <PersonalInfoForm {...props} />;
            case 'ExperienceForm': return <ExperienceForm {...props} />;
            case 'EducationForm': return <EducationForm {...props} />;
            case 'SkillsProjectsForm': return <SkillsProjectsForm {...props} />;
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-blue-600" /> Resume Builder
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Builder Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-blue-200/50">
                        
                        {/* Stepper Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between mb-2 text-sm font-medium">
                                {stepConfig.map((s, index) => (
                                    <span key={s.key} className={`flex-1 text-center ${index <= step ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                        {s.title}
                                    </span>
                                ))}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                                    style={{ width: `${(step / stepConfig.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Current Form */}
                        {step < stepConfig.length ? (
                            <CurrentFormComponent />
                        ) : (
                            <div className="text-center p-12">
                                <h2 className="text-3xl font-bold text-green-600 mb-4">Resume Finalized!</h2>
                                <GlassButton onClick={() => setPage('home')} color="gray">
                                    <HomeIcon className="w-5 h-5 mr-2" /> Back to Home
                                </GlassButton>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview */}
                <div className="lg:col-span-1 lg:sticky lg:top-8 self-start hidden lg:block">
                    <div className="text-center text-gray-500 mb-3 font-semibold">
                        {step < stepConfig.length ? "Live Preview" : "Final Resume"}
                    </div>
                    <ResumePreview 
                        data={resumeData} 
                        isFinal={step === stepConfig.length} 
                        resumeId={finalId}
                        setIsLoading={setIsLoading}
                        setMessage={setMessage}
                        userPlan={userPlan}
                    />
                </div>
            </div>
        </div>
    );
};

const HomePage = ({ setPage }) => (
    <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Hero Section */}
        <div className="mb-20">
            <h1 className="text-7xl font-extrabold text-gray-900 tracking-tight mb-4 animate-fadeIn">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Veen</span> — Build Smarter Resumes, Instantly.
            </h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto mb-10 font-light">
                Create a professional resume from scratch or upload your existing one and effortlessly tailor it to **any job in seconds** using AI-powered technology.
            </p>
            <div className="flex justify-center space-x-6">
                <GlassButton onClick={() => setPage('create')} color="blue" className="text-xl">
                    <FileText className="w-6 h-6 mr-2" />
                    Start Creating Now
                </GlassButton>
                <GlassButton onClick={() => setPage('upload')} color="gray" className="text-xl">
                    <UploadCloud className="w-6 h-6 mr-2" />
                    Upload & Tailor
                </GlassButton>
            </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-800 mb-12">Core Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                {/* Card 1: Builder */}
                <div className="p-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl transition duration-300 transform hover:scale-[1.03] border-t-4 border-blue-500 hover:shadow-blue-300/50">
                    <FileText className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">Create From Scratch</h3>
                    <p className="text-gray-600">Our guided, multi-step builder helps you input your career history and skills. Use AI enhancements to polish your language at every step, guaranteeing an ATS-friendly, impactful final document.</p>
                </div>
                {/* Card 2: Tailor */}
                <div className="p-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl transition duration-300 transform hover:scale-[1.03] border-t-4 border-indigo-500 hover:shadow-indigo-300/50">
                    <Zap className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">Upload & Auto-Tailor</h3>
                    <p className="text-gray-600">Paste a job description, and our AI-powered service will rewrite your summary and bullet points to match the target keywords and requirements exactly.</p>
                </div>
            </div>
        </div>
        
        {/* How-It-Works Section */}
        <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-12">How It Works</h2>
            <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-12">
                
                <div className="w-full md:w-1/3 p-4">
                    <div className="w-14 h-14 flex items-center justify-center bg-blue-600 text-white rounded-full font-extrabold text-2xl mx-auto mb-4 shadow-xl">1</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Input or Upload</h3>
                    <p className="text-base text-gray-600">Enter your data into the guided builder or provide an existing document to the tailoring tool.</p>
                </div>

                <div className="w-full md:w-1/3 p-4">
                    <div className="w-14 h-14 flex items-center justify-center bg-blue-600 text-white rounded-full font-extrabold text-2xl mx-auto mb-4 shadow-xl">2</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Optimization</h3>
                    <p className="text-base text-gray-600">Our AI-powered technology processes your content against job requirements and applies professional edits.</p>
                </div>

                <div className="w-full md:w-1/3 p-4">
                    <div className="w-14 h-14 flex items-center justify-center bg-blue-600 text-white rounded-full font-extrabold text-2xl mx-auto mb-4 shadow-xl">3</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Download & Apply</h3>
                    <p className="text-base text-gray-600">Download your final, perfected, and keyword-optimized resume as an ATS-friendly PDF.</p>
                </div>
            </div>
        </div>

    </div>
);

// --- MAIN APPLICATION COMPONENT ---

const App = () => {
    const [page, setPage] = useState('home'); // home, create, upload, pricing
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // { text, type: 'success' | 'error' | 'loading' }
    const [userPlan, setUserPlan] = useState('Free'); // Default plan is Free

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const getMessageBgColor = () => {
        switch (message.type) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'loading':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const renderPage = () => {
        switch (page) {
            case 'create':
                return <CreateResumePage 
                    setPage={setPage} 
                    isLoading={isLoading} 
                    setIsLoading={setIsLoading} 
                    message={message} 
                    setMessage={setMessage}
                    userPlan={userPlan}
                />;
            case 'upload':
                return <UploadTailorPage 
                    setPage={setPage} 
                    isLoading={isLoading} 
                    setIsLoading={setIsLoading} 
                    message={message} 
                    setMessage={setMessage}
                    userPlan={userPlan}
                />;
            case 'pricing':
                return <PricingPage setPage={setPage} userPlan={userPlan} setUserPlan={setUserPlan} />;
            case 'home':
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div className="min-h-screen font-sans" style={{ background: '#f4f7f9' }}>
            {/* Global Styles for input fields */}
            <style>{`
                .input-field {
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #3b82f6; /* blue-500 */
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
                }
            `}</style>
            
            <header className="bg-white shadow-xl sticky top-0 z-10 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div onClick={() => setPage('home')} className="flex items-center cursor-pointer transition hover:opacity-80">
                        <Zap className="w-6 h-6 text-blue-600 animate-pulse" />
                        <span className="ml-2 text-xl font-extrabold text-gray-900">Veen</span>
                        <span className={`ml-4 px-2 py-0.5 text-xs font-bold rounded-full ${userPlan === 'Free' ? 'bg-gray-200 text-gray-700' : userPlan === 'Pro' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {userPlan}
                        </span>
                    </div>
                    <nav className="space-x-4 flex items-center">
                        <button onClick={() => setPage('create')} className="text-gray-600 hover:text-blue-600 transition text-sm font-medium hidden sm:inline-block">
                            <FileText className="w-4 h-4 mr-1 inline" /> Create Resume
                        </button>
                         <button onClick={() => setPage('upload')} className="text-gray-600 hover:text-blue-600 transition text-sm font-medium hidden sm:inline-block">
                            <UploadCloud className="w-4 h-4 mr-1 inline" /> Tailor Resume
                        </button>
                        <button onClick={() => setPage('pricing')} className="text-gray-600 hover:text-blue-600 transition text-sm font-medium">
                            <DollarSign className="w-4 h-4 mr-1 inline" /> Pricing
                        </button>
                        <GlassButton onClick={() => setPage('create')} color="blue" className="py-2 px-4 text-sm">
                            Get Started
                        </GlassButton>
                    </nav>
                </div>
            </header>

            {/* Global Message/Loading Indicator */}
            {message.text && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 p-3 rounded-xl shadow-xl text-white transition-all duration-300 ${getMessageBgColor()}`}>
                    <div className="flex items-center space-x-2">
                        {(isLoading || message.type === 'loading') && <LoadingSpinner />} 
                        <span>{message.text}</span>
                    </div>
                </div>
            )}
            
            {isLoading && !message.text && (
                 <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-40 flex items-center justify-center">
                    <div className="flex items-center space-x-2 p-4 bg-gray-800/80 rounded-lg">
                        <LoadingSpinner />
                        <span className="text-white">Processing...</span>
                    </div>
                </div>
            )}

            <main>
                {renderPage()}
            </main>

            <footer className="max-w-7xl mx-auto p-8 border-t border-gray-200 text-center text-sm text-gray-500 mt-16">
                &copy; {new Date().getFullYear()} Veen AI. All rights reserved. | Built with React, Node.js & AI Technology.
            </footer>
        </div>
    );
};

export default App;