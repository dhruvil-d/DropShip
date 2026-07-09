import React from 'react';
import { useEditor } from '@craftjs/core';
import { Button as CraftButton } from '../user/Button';
import { Text as CraftText } from '../user/Text';
import { Container as CraftContainer } from '../user/Container';
import { Type, Square, LayoutTemplate } from 'lucide-react';

export const Toolbox = () => {
  const { connectors: { create } } = useEditor();

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 h-full flex flex-col gap-4">
      <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider mb-2">Components</h3>
      
      <button 
        ref={ref => { if (ref) create(ref, <CraftText text="New Text" fontSize={16} />); }}
        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-left transition-all cursor-grab"
      >
        <Type size={18} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Text</span>
      </button>

      <button 
        ref={ref => { if (ref) create(ref, <CraftButton text="Button" variant="primary" />); }}
        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-left transition-all cursor-grab"
      >
        <Square size={18} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Button</span>
      </button>

      <button 
        ref={ref => { if (ref) create(ref, <CraftContainer background="#f3f4f6" padding={20} />); }}
        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-left transition-all cursor-grab"
      >
        <LayoutTemplate size={18} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Container</span>
      </button>
    </div>
  );
};
