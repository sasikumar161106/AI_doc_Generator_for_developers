import React from 'react';
import { Github, KeyRound, Download, Code } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  return (
    <div className="max-w-4xl max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pb-12 pr-4 mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Setup & Integration</h2>
        <p className="text-slate-400 text-sm max-w-2xl">
          DocSync AI runs directly on your machine. To enable it to fetch your repositories and automatically push documentation updates, 
          you need to provide a GitHub Personal Access Token.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel border-white/5 p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono text-lg shrink-0 mt-0.5 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Github className="w-5 h-5 text-indigo-400" /> 
                Generate a GitHub Token
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                You need a classic Personal Access Token with <strong className="text-indigo-300 font-semibold px-1 py-0.5 bg-indigo-500/10 rounded">repo</strong> permissions.
              </p>
              <ol className="list-decimal list-outside ml-4 text-sm text-slate-300 space-y-3 mb-4 marker:text-indigo-500/50 font-medium">
                <li>Go to GitHub Settings <span className="text-slate-500 mx-1">{'->'}</span> Developer Settings <span className="text-slate-500 mx-1">{'->'}</span> Personal Access Tokens <span className="text-slate-500 mx-1">{'->'}</span> Tokens (classic).</li>
                <li>Click <strong className="text-white">Generate new token (classic)</strong>.</li>
                <li>Give it a name like <span className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded">DocSync Local</span>.</li>
                <li>Check the <strong className="text-emerald-400">repo</strong> scope box (Full control of private repositories).</li>
                <li>Generate and copy the token.</li>
              </ol>
            </div>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel border-white/5 p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-lg shrink-0 mt-0.5 border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                Configure Environment Variables
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                In your downloaded DocSync project folder, edit the <code className="text-slate-300 bg-white/10 px-1 py-0.5 rounded border border-white/10">.env</code> file and add your token:
              </p>
              
              <div className="bg-black/40 rounded-xl p-5 border border-white/10 shadow-inner mb-4 relative group">
                <div className="absolute top-3 right-4 text-xs font-mono text-slate-500 uppercase tracking-wider">.env</div>
                <pre className="text-slate-300 text-sm font-mono leading-relaxed overflow-x-auto custom-scrollbar pb-2">
{`# .env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GITHUB_TOKEN="ghp_your_copied_token_here"`}
                </pre>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel border-white/5 p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-3xl rounded-full"></div>
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold font-mono text-lg shrink-0 mt-0.5 border border-violet-500/30 shadow-[0_0_15px_rgba(167,139,250,0.2)]">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Code className="w-5 h-5 text-violet-400" />
                Restart the Server
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                For the environment variables to take effect, you must restart the local Vite development server.
              </p>
              <div className="bg-black/40 rounded-xl p-5 border border-white/10 shadow-inner mb-4">
                <pre className="text-violet-300 text-sm font-mono leading-relaxed">
{`npm run dev`}
                </pre>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
