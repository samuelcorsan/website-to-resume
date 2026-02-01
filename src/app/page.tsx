'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface ProjectItem {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

interface EducationItem {
  degree: string;
  institution: string;
  location?: string;
  year?: string;
  description?: string;
}

interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  pdfPreview?: string;
  resumeData?: ResumeData;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'scrape' | 'crawl'>('scrape');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) {
      setUrlError(null);
      return false;
    }

    try {
      const urlObj = new URL(urlString);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setUrlError('URL must start with http:// or https://');
        return false;
      }
      setUrlError(null);
      return true;
    } catch {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    validateUrl(newUrl);
    if (error) setError(null);
  };
  const [showChat, setShowChat] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getLoadingSteps = useCallback(() => {
    return mode === 'crawl' 
      ? [
          { text: 'Crawling your portfolio...', icon: '🕷️' },
          { text: 'Collecting pages...', icon: '📚' },
          { text: 'Extracting content...', icon: '📄' },
          { text: 'Analyzing with AI...', icon: '🤖' },
          { text: 'Crafting your resume...', icon: '✨' },
          { text: 'Finalizing PDF...', icon: '📋' },
        ]
      : [
          { text: 'Scanning your portfolio...', icon: '🔍' },
          { text: 'Extracting content...', icon: '📄' },
          { text: 'Analyzing with AI...', icon: '🤖' },
          { text: 'Crafting your resume...', icon: '✨' },
          { text: 'Finalizing PDF...', icon: '📋' },
        ];
  }, [mode]);

  useEffect(() => {
    if (loading) {
      const loadingSteps = getLoadingSteps();
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [loading, getLoadingSteps]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const downloadPDF = (pdfBase64: string, filename: string = 'resume.pdf') => {
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateUrl(url)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, mode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Failed to generate resume';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      downloadPDF(data.pdf, `resume-${Date.now()}.pdf`);

      setResumeData(data.resumeData);
      setMessages([
        {
          role: 'assistant',
          content: 'PDF generated',
          pdfPreview: data.pdf,
          resumeData: data.resumeData,
        },
        {
          role: 'assistant',
          content: 'Your resume is ready! Want to make it even better? I can help you refine the content, adjust the formatting, or add more details. Just tell me what you\'d like to change.',
        },
      ]);
      setShowChat(true);
      setUrl('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while generating the resume';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !resumeData) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/modify-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          modification: userMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to modify resume');
      }

      const data = await response.json();
      
      setResumeData(data.resumeData);
      
      downloadPDF(data.pdf, `resume-modified-${Date.now()}.pdf`);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Resume updated',
        pdfPreview: data.pdf,
        resumeData: data.resumeData,
      }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply modifications';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${errorMessage}`,
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const resetToForm = () => {
    setShowChat(false);
    setResumeData(null);
    setMessages([]);
    setChatInput('');
    setError(null);
  };

  if (showChat) {
    return (
      <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-col w-full max-w-4xl mx-auto px-4 py-8 pb-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-zinc-50">
                Resume Editor
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Ask for modifications to your resume
              </p>
            </div>
            <button
              onClick={resetToForm}
              className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Resume
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.pdfPreview && message.resumeData ? (
                  <div className="max-w-[80%] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {message.content}
                      </p>
                    </div>
                    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 p-3 shadow-sm">
                      <div className="space-y-2">
                        <div className="pb-2">
                          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                            {message.resumeData.name || 'Resume'}
                          </h2>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            {message.resumeData.email && <span>{message.resumeData.email}</span>}
                            {message.resumeData.phone && <span>{message.resumeData.phone}</span>}
                            {message.resumeData.website && <span>{message.resumeData.website}</span>}
                            {message.resumeData.location && <span>{message.resumeData.location}</span>}
                          </div>
                        </div>

                        {message.resumeData.summary && (
                          <div>
                            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 mb-0.5">Summary</h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                              {message.resumeData.summary}
                            </p>
                          </div>
                        )}

                        {message.resumeData.experience.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Experience</h3>
                            <div className="space-y-1">
                              {message.resumeData.experience.slice(0, 1).map((exp: ExperienceItem, idx: number) => (
                                <div key={idx} className="text-xs">
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{exp.title}</p>
                                  <p className="text-zinc-600 dark:text-zinc-400">{exp.company}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {message.resumeData.projects.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Projects</h3>
                            <div className="space-y-1">
                              {message.resumeData.projects.slice(0, 1).map((project: ProjectItem, idx: number) => (
                                <div key={idx} className="text-xs">
                                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{project.name}</p>
                                  {project.description && (
                                    <p className="text-zinc-600 dark:text-zinc-400 line-clamp-1">{project.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {message.resumeData.skills.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Skills</h3>
                            <div className="flex flex-wrap gap-1">
                              {message.resumeData.skills.slice(0, 5).map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                              {message.resumeData.skills.length > 5 && (
                                <span className="text-xs px-1.5 py-0.5 text-zinc-500 dark:text-zinc-500">
                                  +{message.resumeData.skills.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => downloadPDF(message.pdfPreview!, `resume-${Date.now()}.pdf`)}
                      className="mt-3 w-full px-4 py-2 text-sm rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    >
                      Download PDF
                    </button>
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Applying modifications...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 py-4">
          <div className="max-w-4xl mx-auto px-4">
            <form onSubmit={handleChatSubmit} className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="What would you like to change?"
              disabled={chatLoading}
              className="w-full px-4 py-4 pr-14 rounded-full border border-zinc-300/50 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-black dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 ease-in-out hover:scale-[1.02]"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium transition-all duration-200 ease-in-out hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center space-y-8 px-8">
          <div className="relative mx-auto w-24 h-32">
            <div className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 animate-pulse">
              <div className="absolute top-0 right-0 w-6 h-6 bg-zinc-100 dark:bg-zinc-700" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>
            </div>
            <div className="absolute top-8 left-3 right-3 space-y-2">
              <div className="h-2 bg-zinc-200 dark:bg-zinc-600 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-600 rounded animate-pulse w-3/4" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-600 rounded animate-pulse w-5/6" style={{ animationDelay: '300ms' }}></div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-600 rounded animate-pulse w-2/3" style={{ animationDelay: '450ms' }}></div>
            </div>
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
          </div>

          <div className="space-y-3">
            <div className="text-4xl animate-bounce">{getLoadingSteps()[loadingStep].icon}</div>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50 animate-pulse">
              {getLoadingSteps()[loadingStep].text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-zinc-200/50 to-transparent dark:from-zinc-800/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-zinc-200/50 to-transparent dark:from-zinc-800/30 rounded-full blur-3xl"></div>
      </div>

      <main className="relative flex w-full max-w-xl flex-col items-center justify-center px-8 py-16">
        <div className="w-full space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50 max-w-md mx-auto">
              Portfolio to
              <br />
              <span className="bg-gradient-to-r from-zinc-600 to-zinc-900 dark:from-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">Resume</span>
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
              Transform your portfolio into a polished PDF resume in seconds
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setMode('scrape')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'scrape'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                }`}
              >
                Main Page
              </button>
              <button
                type="button"
                onClick={() => setMode('crawl')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'crawl'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                }`}
              >
                Crawl
              </button>
            </div>

            <div className="relative">
              <input
                id="url"
                type="url"
                value={url}
                onChange={handleUrlChange}
                onBlur={() => validateUrl(url)}
                placeholder="Paste your portfolio URL..."
                required
                disabled={loading}
                className={`w-full px-5 py-4 pr-14 rounded-2xl border ${
                  urlError
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500 dark:focus:ring-red-400'
                    : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100'
                } bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-sm transition-all duration-200 hover:shadow-md`}
              />
              {urlError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{urlError}</p>
              )}
              <button
                type="submit"
                disabled={loading || !url || !!urlError}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                    {error.includes('cannot be accessed') && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Try a personal website, GitHub Pages, or a portfolio hosted on platforms like Vercel or Netlify.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
