import { useState, useEffect, useRef } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { X, Code2, Play, Monitor } from 'lucide-react';

interface PreviewModalProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal = ({ code, isOpen, onClose }: PreviewModalProps) => {
  const [viewMode, setViewMode] = useState<'live' | 'sandpack' | 'code'>('live');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build and inject the local iframe preview whenever code or mode changes
  useEffect(() => {
    if (viewMode === 'live' && isOpen && iframeRef.current) {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    <style>
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
      #root { min-height: 100vh; }
      .preview-error { color: #dc2626; padding: 24px; font-family: monospace; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 16px; }
    </style>
  </head>
  <body>
    <div id="root">
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#9ca3af;">Loading preview...</div>
    </div>
    <script type="text/babel" data-type="module">
      try {
        ${code.replace(/import .*? from ['"].*?['"];?\n?/g, '').replace(/export default .*?;?\n?$/gm, '').replace(/<\/script>/g, '<\\/script>')}

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(ExportedApp));
      } catch (err) {
        document.getElementById('root').innerHTML = '<div class="preview-error"><strong>Preview Error:</strong><br/>' + err.message + '</div>';
      }
    <\/script>
  </body>
</html>`;
      iframeRef.current.srcdoc = htmlContent;
    }
  }, [code, viewMode, isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { key: 'live' as const, label: 'Live Preview', icon: Monitor },
    { key: 'sandpack' as const, label: 'Code Editor', icon: Play },
    { key: 'code' as const, label: 'Raw Code', icon: Code2 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Preview & Code</h2>
            <p className="text-sm text-gray-500">
              {viewMode === 'live' ? 'Local browser render' : viewMode === 'sandpack' ? 'Powered by Sandpack (requires internet)' : 'Generated React JSX'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Tab switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setViewMode(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === tab.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            
            <div className="w-px h-6 bg-gray-300"></div>
            
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          {viewMode === 'live' && (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none bg-white"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          )}

          {viewMode === 'sandpack' && (
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
                bundlerTimeoutMs: 30000,
              }}
              customSetup={{
                dependencies: {
                  "lucide-react": "latest"
                }
              }}
            />
          )}

          {viewMode === 'code' && (
            <div className="h-full w-full overflow-auto p-6">
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(code); }}
                  className="text-xs bg-gray-800 text-gray-300 hover:text-white px-3 py-1.5 rounded-md transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl font-mono text-sm shadow-inner whitespace-pre-wrap leading-relaxed">
                {code}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
