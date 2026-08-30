import { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Play, Undo, Redo, Loader2, Save, Download, Moon, Sun, Rocket } from 'lucide-react';
import { Github } from '../icons/GithubIcon';
import { PreviewModal } from './PreviewModal';
import { GitHubExportModal } from './GitHubExportModal';
import { useDarkModeStore } from '../../shared/darkModeStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Topbar = () => {
  const { actions, query, canUndo, canRedo } = useEditor((_state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [compiledCode, setCompiledCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const globalDarkMode = useDarkModeStore((s) => s.globalDarkMode);
  const toggleGlobalDarkMode = useDarkModeStore((s) => s.toggleGlobalDarkMode);

  const handleCompileAndPreview = async () => {
    setIsCompiling(true);
    try {
      const astJson = query.serialize();
      
      const response = await fetch(`${API_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: astJson,
      });
      
      const data = await response.json();
      
      if (data.code) {
        setCompiledCode(data.code);
        setIsPreviewOpen(true);
      } else {
        alert("Compilation failed: " + data.error);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to compile: ${msg}\nIs the backend running on ${API_URL}?`);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSave = () => {
    const json = query.serialize();
    localStorage.setItem('dropship_project', json);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('dropship_project');
    if (saved) {
      actions.deserialize(saved);
    } else {
      alert('No saved project found.');
    }
  };

  return (
    <>
      <div className="h-14 bg-white border-b border-gray-200/80 flex items-center justify-between px-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Logo */}
        <div className="font-bold text-base flex items-center gap-2.5 select-none">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
            <Rocket size={14} className="text-white -rotate-45" />
          </div>
          <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-extrabold tracking-tight">
            DropShip
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Save / Load */}
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Save to browser"
          >
            <Save size={15} />
            {saveStatus === 'saved' ? (
              <span className="text-emerald-600 text-xs font-semibold animate-[msgSlideIn_0.3s_ease]">Saved!</span>
            ) : null}
          </button>
          <button 
            onClick={handleLoad}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Load saved project"
          >
            <Download size={15} />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1.5" />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleGlobalDarkMode}
            className={`relative p-2 rounded-lg transition-all duration-300 ${
              globalDarkMode
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-sm shadow-blue-500/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={globalDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="relative w-[16px] h-[16px]">
              <Sun
                size={16}
                className={`absolute inset-0 transition-all duration-300 ${
                  globalDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <Moon
                size={16}
                className={`absolute inset-0 transition-all duration-300 ${
                  globalDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                }`}
              />
            </div>
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1.5" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
            <button 
              onClick={() => actions.history.undo()}
              disabled={!canUndo}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-md disabled:opacity-35 disabled:hover:bg-transparent transition-all duration-200"
              title="Undo"
            >
              <Undo size={15} />
            </button>
            <button 
              onClick={() => actions.history.redo()}
              disabled={!canRedo}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-md disabled:opacity-35 disabled:hover:bg-transparent transition-all duration-200"
              title="Redo"
            >
              <Redo size={15} />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-200 mx-1.5" />

          {/* Push to GitHub */}
          <button
            onClick={() => setIsGitHubOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 hover:border-gray-300 transition-all duration-200 active:scale-[0.97]"
            title="Push to GitHub"
          >
            <Github size={15} />
            Push to GitHub
          </button>

          {/* Preview */}
          <button 
            onClick={handleCompileAndPreview}
            disabled={isCompiling}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-75 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 active:scale-[0.97]"
          >
            {isCompiling ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
            {isCompiling ? 'Compiling...' : 'Preview'}
          </button>
        </div>
      </div>
      
      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        code={compiledCode} 
      />
      <GitHubExportModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />
    </>
  );
};
