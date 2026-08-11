import { useRef } from 'react';
import { Element, useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { Text } from './Text';

interface TextareaComponentProps {
  placeholder: string;
  rows: number;
  required: boolean;
}

export const TextareaComponent = ({ placeholder, rows, required }: TextareaComponentProps) => {
  const { connectRef, isSelected, isDark, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      className="flex flex-col gap-1 outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move"
      style={{ position: 'relative', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', ...responsiveStyles }}
    >
      <label className={`text-sm font-medium flex items-center ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
        <Element id="textarea-label" is={Text} text="Message" fontSize={14} fontWeight="500" color="inherit" textAlign="left" lineHeight={1.5} />
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full px-3 py-2 border rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          isDark 
            ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
        }`}
        readOnly
      />
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

// ------ Settings Panel ------

const TextareaSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as TextareaComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <label className="text-xs text-gray-600 mt-2 block">
          Placeholder
          <input type="text" value={props.placeholder} onChange={(e) => setProp((p: TextareaComponentProps) => { p.placeholder = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <label className="text-xs text-gray-600">
          Rows
          <input type="number" value={props.rows} min={1} max={20} onChange={(e) => setProp((p: TextareaComponentProps) => { p.rows = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Validation</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          <input type="checkbox" checked={props.required} onChange={(e) => setProp((p: TextareaComponentProps) => { p.required = e.target.checked; })}
            className="rounded border-gray-300" />
          Required
        </label>
      </div>
    </div>
  );
};

TextareaComponent.craft = {
  displayName: 'TextareaComponent',
  props: {
    placeholder: 'Enter message...',
    rows: 4,
    required: false,
  } as TextareaComponentProps,
  related: {
    settings: TextareaSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
