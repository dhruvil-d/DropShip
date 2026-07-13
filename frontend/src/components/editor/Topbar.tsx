import { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Play, Undo, Redo, Loader2, Save, Download } from 'lucide-react';
import { PreviewModal } from './PreviewModal';

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
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="font-bold text-lg flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded"></div>
          DropShip
        </div>

        <div className="flex items-center gap-2">
          {/* Save / Load */}
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Save to browser"
          >
            <Save size={16} />
            {saveStatus === 'saved' ? <span className="text-green-600 text-xs">Saved!</span> : null}
          </button>
          <button 
            onClick={handleLoad}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
            title="Load saved project"
          >
            <Download size={16} />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Undo / Redo */}
          <button 
            onClick={() => actions.history.undo()}
            disabled={!canUndo}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <Undo size={18} />
          </button>
          <button 
            onClick={() => actions.history.redo()}
            disabled={!canRedo}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <Redo size={18} />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Preview */}
          <button 
            onClick={handleCompileAndPreview}
            disabled={isCompiling}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-75"
          >
            {isCompiling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {isCompiling ? 'Compiling...' : 'Preview Code'}
          </button>
        </div>
      </div>
      
      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        code={compiledCode} 
      />
    </>
  );
};
