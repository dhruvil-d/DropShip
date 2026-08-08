import { useRef } from 'react';
import { Element, useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { Text } from './Text';


interface SelectComponentProps {
  options: string; // comma-separated
  required: boolean;
}

export const SelectComponent = ({ options, required }: SelectComponentProps) => {
  const { connectRef, isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLDivElement>(null);
  const optionList = options.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      className="flex flex-col gap-1 outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move"
      style={{ position: 'relative', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', ...responsiveStyles }}
    >
      <label className="text-sm font-medium text-gray-700 flex items-center">
        <Element id="select-label" is={Text} text="Select" fontSize={14} fontWeight="500" color="inherit" textAlign="left" lineHeight={1.5} />
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select...</option>
        {optionList.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

// ------ Settings Panel ------

const SelectSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as SelectComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <label className="text-xs text-gray-600 mt-2 block">
          Options (comma-separated)
          <input type="text" value={props.options} onChange={(e) => setProp((p: SelectComponentProps) => { p.options = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Validation</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          <input type="checkbox" checked={props.required} onChange={(e) => setProp((p: SelectComponentProps) => { p.required = e.target.checked; })}
            className="rounded border-gray-300" />
          Required
        </label>
      </div>
    </div>
  );
};

SelectComponent.craft = {
  displayName: 'SelectComponent',
  props: {
    options: 'Option 1,Option 2,Option 3',
    required: false,
  } as SelectComponentProps,
  related: {
    settings: SelectSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
