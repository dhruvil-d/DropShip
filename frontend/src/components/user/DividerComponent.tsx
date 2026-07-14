import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';


interface DividerComponentProps {
  color: string;
  marginY: number;
}

export const DividerComponent = ({ color, marginY }: DividerComponentProps) => {
  const { connectRef, isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLHRElement>(null);

  return (
    <div style={{ position: 'relative', ...responsiveStyles, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <hr
        ref={(ref: HTMLHRElement | null) => {
          elementRef.current = ref;
          connectRef(ref);
        }}
        style={{
          borderColor: color,
          marginBlock: `${marginY}px`,
        }}
        className="border-0 border-t outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move"
      />
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

// ------ Settings Panel ------

const DividerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as DividerComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Style</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          Color
          <input type="color" value={props.color} onChange={(e) => setProp((p: DividerComponentProps) => { p.color = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.color}</span>
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <label className="text-xs text-gray-600">
          Vertical Margin
          <input type="number" value={props.marginY} onChange={(e) => setProp((p: DividerComponentProps) => { p.marginY = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>
    </div>
  );
};

DividerComponent.craft = {
  displayName: 'DividerComponent',
  props: {
    color: '#e5e7eb',
    marginY: 16,
  } as DividerComponentProps,
  related: {
    settings: DividerSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
