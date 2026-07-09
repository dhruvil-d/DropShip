import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Play, Code, Save, Undo, Redo, Loader2 } from 'lucide-react';
import { PreviewModal } from './PreviewModal';

export const Topbar = () => {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [compiledCode, setCompiledCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompileAndPreview = async () => {
    setIsCompiling(true);
    try {
      const astJson = query.serialize();
      
      const response = await fetch('http://localhost:3001/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: astJson,
      });
      
      const data = await response.json();
      
      if (data.code) {
        setCompiledCode(data.code);
        setIsPreviewOpen(true);
      } else {
        alert("Compilation failed: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to compiler API. Is the backend running?");
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <>
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="font-bold text-lg flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded"></div>
          AppBuilder
        </div>

        <div className="flex items-center gap-2">
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

          <div className="w-px h-6 bg-gray-200 mx-2"></div>

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
