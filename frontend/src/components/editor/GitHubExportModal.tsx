import { useState, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  KeyRound,
  FolderGit2,
  FileCode2,
  MessageSquare,
  GitBranch,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Github } from '../icons/GithubIcon';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STORAGE_KEY = 'dropship_github_settings';

interface SavedSettings {
  token: string;
  owner: string;
  repo: string;
  path: string;
  branch: string;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

interface ExportResult {
  commitUrl?: string;
  fileUrl?: string;
  message?: string;
  error?: string;
}

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal = ({ isOpen, onClose }: GitHubExportModalProps) => {
  const { query } = useEditor();

  // Form state
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('src/ExportedApp.jsx');
  const [message, setMessage] = useState('Update UI from DropShip');
  const [branch, setBranch] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Export state
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [result, setResult] = useState<ExportResult>({});

  // Load saved settings on mount
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const settings: SavedSettings = JSON.parse(saved);
          setToken(settings.token || '');
          setOwner(settings.owner || '');
          setRepo(settings.repo || '');
          setPath(settings.path || 'src/ExportedApp.jsx');
          setBranch(settings.branch || '');
        }
      } catch {
        // ignore
      }
      setStatus('idle');
      setResult({});
    }
  }, [isOpen]);

  const saveSettings = () => {
    const settings: SavedSettings = { token, owner, repo, path, branch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  };

  const handleExport = async () => {
    if (!token.trim() || !owner.trim() || !repo.trim()) return;

    setStatus('exporting');
    setResult({});

    try {
      const currentState = query.serialize();
      const craftState = JSON.parse(currentState);

      const response = await fetch(`${API_URL}/api/github/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          owner: owner.trim(),
          repo: repo.trim(),
          path: path.trim() || 'src/ExportedApp.jsx',
          message: message.trim() || 'Update UI from DropShip',
          branch: branch.trim() || undefined,
          craftState,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Export failed (${response.status})`);
      }

      // Save settings on success
      saveSettings();

      setStatus('success');
      setResult({
        commitUrl: data.commitUrl,
        fileUrl: data.fileUrl,
        message: data.message,
      });
    } catch (err: any) {
      setStatus('error');
      setResult({ error: err.message || 'Something went wrong' });
    }
  };

  const isFormValid = token.trim() && owner.trim() && repo.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: 'ghModalSlideIn 0.25s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-md">
              <Github size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Push to GitHub</h2>
              <p className="text-xs text-gray-400 mt-0.5">Export generated code to your repository</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Success State */}
          {status === 'success' && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={18} />
                <span className="font-semibold text-sm">{result.message}</span>
              </div>
              <div className="flex flex-col gap-2">
                {result.commitUrl && (
                  <a
                    href={result.commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-800 underline underline-offset-2 transition-colors"
                  >
                    <ExternalLink size={12} />
                    View Commit
                  </a>
                )}
                {result.fileUrl && (
                  <a
                    href={result.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-800 underline underline-offset-2 transition-colors"
                  >
                    <ExternalLink size={12} />
                    View File
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-start gap-2 text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span className="text-sm">{result.error}</span>
              </div>
            </div>
          )}

          {/* Token */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <KeyRound size={12} />
              GitHub Token <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-3 py-2.5 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-300 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400">
              Needs <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">repo</code> scope.{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=DropShip%20Export"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline underline-offset-2"
              >
                Create one →
              </a>
            </p>
          </div>

          {/* Owner / Repo — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <FolderGit2 size={12} />
                Owner <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="username"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <FolderGit2 size={12} />
                Repository <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="my-app"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* File Path */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <FileCode2 size={12} />
              File Path
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="src/ExportedApp.jsx"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-300 font-mono"
            />
          </div>

          {/* Commit Message + Branch — side by side */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <MessageSquare size={12} />
                Commit Message
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Update UI from DropShip"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-300"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <GitBranch size={12} />
                Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main (default)"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
          >
            {status === 'success' ? 'Close' : 'Cancel'}
          </button>
          <button
            onClick={handleExport}
            disabled={!isFormValid || status === 'exporting'}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl hover:from-gray-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-gray-900/15 hover:shadow-lg hover:shadow-gray-900/25 transition-all duration-200 active:scale-[0.97]"
          >
            {status === 'exporting' ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Pushing…
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 size={15} />
                Push Again
              </>
            ) : (
              <>
                <Github size={15} />
                Push to GitHub
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes ghModalSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
