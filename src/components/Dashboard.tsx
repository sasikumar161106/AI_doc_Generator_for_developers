import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Github, Code2, RefreshCw, Activity, ExternalLink, Send, ArrowRight, Loader2, CheckCircle2, Book } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pushSuccessUrl, setPushSuccessUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    setSelectedRepo(null);
    setGeneratedDoc(null);
    setPushSuccessUrl(null);
    try {
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch repos');
      setRepos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepo = (repo: any) => {
    setSelectedRepo(repo);
    setGeneratedDoc(null);
    setPushSuccessUrl(null);
  };

  const handleGenerate = async () => {
    if (!selectedRepo) return;
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/docs/generate-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoFullName: selectedRepo.full_name }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate documentation');
      
      setGeneratedDoc(data.document);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePush = async () => {
    if (!selectedRepo || !generatedDoc) return;
    setPushing(true);
    setError(null);
    try {
      const response = await fetch('/api/github/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          repo: selectedRepo.full_name,
          path: 'DOCSYNC.md',
          content: generatedDoc,
          message: `Add auto-generated repository documentation`
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to push documentation');
      
      setPushSuccessUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-medium text-slate-800">Your Repositories</h2>
          <p className="text-slate-500 mt-1">Select a repository to analyze its structure and generate comprehensive documentation.</p>
        </div>
        <button 
          onClick={fetchRepos}
          disabled={loading}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && error.includes('GITHUB_TOKEN') ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex items-start gap-4">
          <div className="text-amber-800 flex-1">
            <h3 className="font-semibold text-lg mb-2">GitHub Token is missing</h3>
            <p className="text-sm">Please configure the <code className="bg-amber-100 px-1 rounded">GITHUB_TOKEN</code> environment variable in your <code>.env</code> file. Without this, DocSync cannot fetch your repositories.</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-500 font-medium">Fetching your repositories...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-800">
          <p><strong>Error:</strong> {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Repositories List Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[650px] overflow-hidden lg:col-span-1">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
              <h3 className="font-medium text-slate-800 text-sm">Select Repository</h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{repos?.length || 0}</span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {!repos || repos.length === 0 ? (
                 <div className="p-4 text-sm text-slate-500 text-center">No repositories found.</div>
              ) : (
                <div className="space-y-1">
                  {repos.map(repo => (
                    <button
                      key={repo.id}
                      onClick={() => handleSelectRepo(repo)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center gap-3 ${selectedRepo?.id === repo.id ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'hover:bg-slate-50 border border-transparent text-slate-700'}`}
                    >
                      <Book className={`w-4 h-4 shrink-0 ${selectedRepo?.id === repo.id ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <span className="font-medium block truncate">{repo.name}</span>
                        <span className="text-xs opacity-70 block truncate mt-0.5">{repo.full_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Repo Details / Documentation Preview Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[650px] overflow-hidden lg:col-span-2">
            {!selectedRepo ? (
               <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                  <Github className="w-12 h-12 mb-4 opacity-30" />
                  <p className="text-center font-medium">Select a repository from the list</p>
                  <p className="text-center text-sm mt-2 max-w-sm">DocSync will analyze the top codebase files and generate a comprehensive documentation summary.</p>
               </div>
            ) : generatedDoc ? (
               <>
                 <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-slate-800">Generated Documentation</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedRepo.full_name} • Saving as DOCSYNC.md</p>
                    </div>
                    <button 
                      onClick={() => handleSelectRepo(selectedRepo)}
                      className="text-sm text-slate-500 hover:text-slate-800"
                    >
                      Reset
                    </button>
                 </div>
                 <div className="flex-1 overflow-auto p-6 prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{generatedDoc}</ReactMarkdown>
                 </div>
                 <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                    {pushSuccessUrl ? (
                      <a href={pushSuccessUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-600 font-medium text-sm hover:underline">
                        <CheckCircle2 className="w-4 h-4" /> Successfully pushed DOCSYNC.md
                      </a>
                    ) : (<div></div>)}
                    <button 
                      onClick={handlePush}
                      disabled={pushing || !!pushSuccessUrl}
                      className="bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {pushSuccessUrl ? 'Added to Repo' : 'Commit Documentation'}
                    </button>
                 </div>
               </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/30">
                  <Book className="w-16 h-16 mb-4 text-blue-100" />
                  <h3 className="text-xl font-medium text-slate-800 mb-2">{selectedRepo.name}</h3>
                  <p className="text-center text-slate-500 max-w-md text-sm mb-8">
                    We will analyze the repository structure, review core code files, and build an overarching documentation document.
                  </p>
                  
                  <button 
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Repository...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        Analyze & Generate Documentation
                      </>
                    )}
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
