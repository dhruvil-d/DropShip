import React from 'react';
import { useEditor } from '@craftjs/core';

export const SettingsPanel = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').first();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable()
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled
    };
  });

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-4 h-full flex flex-col">
      <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider mb-4">Properties</h3>
      
      {selected ? (
        <div className="flex flex-col gap-4">
          <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-medium text-gray-800">{selected.name}</span>
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {selected.id === 'ROOT' ? 'root' : selected.id}
            </span>
          </div>
          
          <div data-cy="settings-panel">
            {selected.settings ? React.createElement(selected.settings) : (
              <div className="text-sm text-gray-500 italic">No settings available for this component.</div>
            )}
          </div>
          
          {selected.isDeletable ? (
            <button
              className="mt-auto px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200 transition-colors text-sm font-medium"
              onClick={() => {
                actions.delete(selected.id);
              }}
            >
              Delete Component
            </button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-xl">🖱️</span>
          </div>
          Select a component on the canvas to view its properties
        </div>
      )}
    </div>
  );
};
