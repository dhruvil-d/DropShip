import { useState } from 'react';
import { SettingsPanel } from './SettingsPanel';
import { ChatPanel } from './ChatPanel';
import { Settings, Sparkles } from 'lucide-react';

export const RightSidebar = () => {
  const [activeTab, setActiveTab] = useState<'properties' | 'chat'>('properties');

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-white z-20">
      {/* Sidebar Tabs */}
      <div className="flex flex-shrink-0 bg-white">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-3.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold tracking-wide uppercase transition-all duration-300 border-b-2 ${
            activeTab === 'properties'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings size={14} />
          Properties
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold tracking-wide uppercase transition-all duration-300 border-b-2 ${
            activeTab === 'chat'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Sparkles size={14} />
          AI Chat
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden flex w-80 relative">
        <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'properties' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 pointer-events-none -translate-x-2'}`}>
          <SettingsPanel />
        </div>
        <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'chat' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 pointer-events-none translate-x-2'}`}>
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};
