import React from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { X } from 'lucide-react';

interface PreviewModalProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal = ({ code, isOpen, onClose }: PreviewModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Live Preview & Code</h2>
            <p className="text-sm text-gray-500">Powered by Sandpack & AST Compiler</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <Sandpack
            template="react-ts"
            theme="light"
            files={{
              "/App.tsx": code,
              "/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
            }}
            options={{
              showNavigator: true,
              showTabs: true,
              editorHeight: "100%",
              wrapContent: true,
            }}
            customSetup={{
              dependencies: {
                "lucide-react": "latest"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
