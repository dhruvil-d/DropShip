import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';


interface CardComponentProps {
  padding: number;
  background: string;
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  borderWidth: number;
  borderColor: string;
  children?: React.ReactNode;
}

const shadowClasses: Record<string, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export const CardComponent = ({
  padding, background, borderRadius, shadow, borderWidth, borderColor, children,
}: CardComponentProps) => {
  const { connectRef, isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      style={{
        padding: `${padding}px`,
        backgroundColor: background,
        borderRadius: `${borderRadius}px`,
        borderWidth: `${borderWidth}px`,
        borderColor,
        borderStyle: 'solid',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
      className={`min-h-[40px] outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all ${shadowClasses[shadow] || ''}`}
    >
      {children}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

// ------ Settings Panel ------

const CardSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as CardComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <label className="text-xs text-gray-600">
          Padding
          <input type="number" value={props.padding} onChange={(e) => setProp((p: CardComponentProps) => { p.padding = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          Background
          <input type="color" value={props.background} onChange={(e) => setProp((p: CardComponentProps) => { p.background = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.background}</span>
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Borders</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Radius
            <input type="number" value={props.borderRadius} onChange={(e) => setProp((p: CardComponentProps) => { p.borderRadius = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Width
            <input type="number" value={props.borderWidth} onChange={(e) => setProp((p: CardComponentProps) => { p.borderWidth = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
        </div>
        <label className="text-xs text-gray-600 mt-2 flex items-center gap-2">
          Border Color
          <input type="color" value={props.borderColor} onChange={(e) => setProp((p: CardComponentProps) => { p.borderColor = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.borderColor}</span>
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Effects</h4>
        <label className="text-xs text-gray-600">
          Shadow
          <select value={props.shadow} onChange={(e) => setProp((p: CardComponentProps) => { p.shadow = e.target.value as CardComponentProps['shadow']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
      </div>
    </div>
  );
};

CardComponent.craft = {
  displayName: 'CardComponent',
  props: {
    padding: 24,
    background: '#ffffff',
    borderRadius: 8,
    shadow: 'md',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  } as CardComponentProps,
  related: {
    settings: CardSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
