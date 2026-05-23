import React from 'react';
import { Github, KeyRound, Download, Code } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl max-h-[calc(100vh-6rem)] overflow-y-auto pb-12">
      <h2 className="text-2xl font-medium text-slate-800 mb-6">Local Setup Guide</h2>
      
      <p className="text-slate-600 mb-8">
        DocSync AI runs directly on your machine. To enable it to fetch your repositories and automatically push documentation updates, 
        you need to provide a GitHub Personal Access Token.
      </p>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold font-mono text-sm shrink-0 mt-1">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-800 mb-2 flex items-center gap-2">
                <Github className="w-5 h-5" /> 
                Generate a GitHub Token
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                You need a classic Personal Access Token with <strong>repo</strong> permissions.
              </p>
              <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2 mb-4">
                <li>Go to GitHub Settings {'->'} Developer Settings {'->'} Personal Access Tokens {'->'} Tokens (classic).</li>
                <li>Click <strong>Generate new token (classic)</strong>.</li>
                <li>Give it a name like "DocSync Local".</li>
                <li>Check the <strong>repo</strong> scope box (Full control of private repositories).</li>
                <li>Generate and copy the token.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold font-mono text-sm shrink-0 mt-1">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-800 mb-2 flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                Configure Environment Variables
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                In your downloaded DocSync project folder, create or edit the <code>.env</code> file and add your token:
              </p>
              
              <div className="bg-slate-900 rounded-md p-4 overflow-x-auto mb-4">
                <pre className="text-slate-200 text-sm font-mono leading-relaxed">
{`# .env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GITHUB_TOKEN="ghp_your_copied_token_here"`}
                </pre>
              </div>

              <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800 text-sm flex gap-3">
                <div className="shrink-0 mt-0.5">⚠️</div>
                <p>
                  <strong>Restart Required:</strong> After saving the <code>.env</code> file, you'll need to restart your development server (<code>npm run dev</code>) 
                  for the changes to take effect.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold font-mono text-sm shrink-0 mt-1">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-800 mb-2 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Generate Documentation
              </h3>
              <p className="text-slate-600 text-sm">
                Head over to the <strong>Dashboard</strong>. If your token is configured correctly, DocSync will automatically 
                find the most recently modified file in your GitHub account. Click "Generate Documentation" to let the 
                AI rewrite your docs, then push it straight back to your repository!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
