// Enhanced Upload & Tailor Page Component with Real File Upload and Approval Flow
// This replaces the UploadTailorPage component in VeenApp.jsx

const UploadTailorPageEnhanced = ({ setPage, setIsLoading, setMessage, isLoading, userPlan }) => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [rawResumeText, setRawResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState("Lead Software Engineer: 5+ years React/TypeScript, high-performance data visualization tools, AWS cloud infrastructure (Lambda, DynamoDB). Strong design patterns and CI/CD.");
    const [tailoredResult, setTailoredResult] = useState(null);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [modelProvider, setModelProvider] = useState('gemini');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadedFile(file);
        setIsLoading(true);
        setMessage({ text: `Uploading and parsing ${file.name}...`, type: 'loading' });

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await fetch(`${API_BASE_URL.replace('/resume', '')}/resume/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Upload failed');
            }

            setRawResumeText(data.rawContent);
            setMessage({ text: `File uploaded successfully! ${file.name} parsed.`, type: 'success' });

        } catch (error) {
            setMessage({ text: `Upload failed: ${error.message}`, type: 'error' });
            setUploadedFile(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTailor = async () => {
        if (userPlan === 'Free' && modelProvider !== 'gemini') {
            setMessage({ text: "Error: Free tier users must use the Standard AI model.", type: 'error' });
            return;
        }
        if (!rawResumeText || !jobDescription) {
            setMessage({ text: "Please provide both resume content and the job description.", type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: `AI is analyzing and tailoring your resume...`, type: 'loading' });
        setTailoredResult(null);

        try {
            const result = await fetchApi('/tailor', 'POST', { 
                resumeText: rawResumeText, 
                jobDescription, 
                modelProvider,
                userPlan
            });
            
            setTailoredResult(result);
            setShowApprovalDialog(true);
            setMessage({ text: "AI tailoring complete! Review the suggested changes.", type: 'success' });

        } catch (error) {
            setMessage({ text: `Tailoring Failed: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveChanges = async () => {
        setIsLoading(true);
        setMessage({ text: "Applying approved changes and generating PDF...", type: 'loading' });

        try {
            const result = await fetchApi('/approve-changes', 'POST', {
                originalData: JSON.parse(rawResumeText),
                tailoredData: tailoredResult.tailoredJson,
                userPlan
            });

            if (result.downloadUrl) {
                // Trigger download
                window.open(result.downloadUrl, '_blank');
                setMessage({ text: `PDF generated! Download started: ${result.filename}`, type: 'success' });
            } else {
                setMessage({ text: "Changes saved successfully!", type: 'success' });
            }

            setShowApprovalDialog(false);

        } catch (error) {
            setMessage({ text: `Failed to approve changes: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectChanges = () => {
        setShowApprovalDialog(false);
        setTailoredResult(null);
        setMessage({ text: "Changes rejected. You can modify and try again.", type: 'success' });
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-6 flex items-center">
                <UploadCloud className="w-8 h-8 mr-3 text-blue-600" /> Upload & Auto-Tailor
            </h1>
            <p className="text-gray-600 mb-8">
                Upload your resume file (PDF/DOCX) or paste content, then provide a job description for AI-powered tailoring.
            </p>

            {/* Approval Dialog Modal */}
            {showApprovalDialog && tailoredResult && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <h2 className="text-2xl font-bold">Review AI-Suggested Changes</h2>
                            <p className="text-sm mt-1 opacity-90">Compare the changes and approve or reject them</p>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">📄 Original Resume</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-y-auto border">
                                        {rawResumeText.substring(0, 500)}...
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-700 mb-2">✨ AI-Tailored Version</h3>
                                    <div className="bg-green-50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-y-auto border border-green-200">
                                        {tailoredResult.tailoredPlainText}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                <h4 className="font-semibold text-blue-900 mb-2">🎯 Key Changes:</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Summary optimized with target keywords</li>
                                    <li>• Experience bullets rewritten for ATS compatibility</li>
                                    <li>• Skills prioritized based on job requirements</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                            <GlassButton onClick={handleRejectChanges} color="gray">
                                <X className="w-5 h-5 mr-2" />
                                Reject Changes
                            </GlassButton>
                            <GlassButton onClick={handleApproveChanges} color="green" disabled={isLoading}>
                                <Check className="w-5 h-5 mr-2" />
                                {userPlan !== 'Free' ? 'Approve & Download PDF' : 'Approve Changes'}
                            </GlassButton>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                        <h2 className="text-xl font-semibold mb-3">Upload Resume File</h2>
                        
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="resume-upload"
                            />
                            <label
                                htmlFor="resume-upload"
                                className="block p-8 border-2 border-dashed border-blue-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition duration-200"
                            >
                                <UploadCloud className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                                <p className="text-sm font-medium text-gray-700">
                                    {uploadedFile ? uploadedFile.name : 'Click to upload or drag & drop'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT (Max 5MB)</p>
                            </label>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Or Paste Resume Content:</label>
                            <textarea
                                value={rawResumeText}
                                onChange={(e) => setRawResumeText(e.target.value)}
                                rows="8"
                                placeholder="Paste your resume content here..."
                                className={`${INPUT_CLASS} font-mono text-sm`}
                            ></textarea>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                        <h2 className="text-xl font-semibold mb-3">Target Job Description</h2>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows="6"
                            placeholder="Paste the target job description here..."
                            className={INPUT_CLASS}
                        ></textarea>
                        
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select AI Model:</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="model" value="gemini" checked={modelProvider === 'gemini'} onChange={() => setModelProvider('gemini')} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Standard AI (All Plans)</span>
                                </label>
                                <label className={`flex items-center ${userPlan === 'Free' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input type="radio" name="model" value="openai" checked={modelProvider === 'openai'} disabled={userPlan === 'Free'} onChange={() => setModelProvider('openai')} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Advanced AI (Pro/Ultimate only)</span>
                                </label>
                            </div>
                            {userPlan === 'Free' && <p className="text-xs text-red-500 mt-1">Upgrade to Pro or Ultimate to use Advanced AI models.</p>}
                        </div>
                    </div>

                    <GlassButton onClick={handleTailor} disabled={isLoading} color="indigo" className="w-full">
                        {isLoading ? <LoadingSpinner /> : <><Zap className="w-5 h-5 mr-2" /> Auto-Tailor My Resume</>}
                    </GlassButton>
                </div>

                <div className="lg:sticky lg:top-8 self-start">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl h-full min-h-[500px] border-t-4 border-yellow-400">
                        <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
                        <div className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed max-h-[80vh] overflow-y-auto">
                            {tailoredResult ? (
                                <>
                                    <p className="text-green-400 mb-3 font-semibold">✨ AI Tailoring Complete!</p>
                                    <p className="text-yellow-300 mb-3">Review the suggested changes and click 'Approve' to generate your PDF.</p>
                                    {tailoredResult.tailoredPlainText}
                                </>
                            ) : rawResumeText ? (
                                <>
                                    <p className="text-blue-400 mb-3 font-semibold">Current Resume Content:</p>
                                    {rawResumeText.substring(0, 1000)}
                                    {rawResumeText.length > 1000 && '...'}
                                </>
                            ) : (
                                <p className="text-gray-400 italic">
                                    Upload a resume file or paste content to begin. The AI will tailor it to match your target job description.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
