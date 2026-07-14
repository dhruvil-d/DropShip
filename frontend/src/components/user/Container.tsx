import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';


interface ContainerProps {
  padding: number;
  margin: number;
  gap: number;
  flexDirection: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  background: string;
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  minHeight: number | string;
  children?: React.ReactNode;
}

const shadowClasses: Record<string, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

export const Container = ({
  padding, margin, gap, flexDirection, background,
  borderRadius, shadow, minHeight, children,
}: ContainerProps) => {
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
        margin: `${margin}px`,
        gap: `${gap}px`,
        flexDirection,
        backgroundColor: background,
        borderRadius: `${borderRadius}px`,
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        display: 'flex',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
      className={`outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all ${shadowClasses[shadow] || ''}`}
    >
      {children}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

// ------ Settings Panel ------

const ContainerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as ContainerProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Layout */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Padding
            <input type="number" value={props.padding} onChange={(e) => setProp((p: ContainerProps) => { p.padding = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Margin
            <input type="number" value={props.margin} onChange={(e) => setProp((p: ContainerProps) => { p.margin = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Gap
            <input type="number" value={props.gap} onChange={(e) => setProp((p: ContainerProps) => { p.gap = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Min Height
            <input type="number" value={props.minHeight} onChange={(e) => setProp((p: ContainerProps) => { p.minHeight = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
        </div>
        <label className="text-xs text-gray-600 mt-2 block">
          Direction
          <select value={props.flexDirection} onChange={(e) => setProp((p: ContainerProps) => { p.flexDirection = e.target.value as ContainerProps['flexDirection']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="column">Column</option>
            <option value="row">Row</option>
            <option value="column-reverse">Column Reverse</option>
            <option value="row-reverse">Row Reverse</option>
          </select>
        </label>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          Background
          <input type="color" value={props.background} onChange={(e) => setProp((p: ContainerProps) => { p.background = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.background}</span>
        </label>
      </div>

      {/* Borders */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Borders</h4>
        <label className="text-xs text-gray-600">
          Border Radius
          <input type="number" value={props.borderRadius} onChange={(e) => setProp((p: ContainerProps) => { p.borderRadius = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>

      {/* Effects */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Effects</h4>
        <label className="text-xs text-gray-600">
          Shadow
          <select value={props.shadow} onChange={(e) => setProp((p: ContainerProps) => { p.shadow = e.target.value as ContainerProps['shadow']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </label>
      </div>
    </div>
  );
};

Container.craft = {
  displayName: 'Container',
  props: {
    padding: 20,
    margin: 0,
    gap: 0,
    flexDirection: 'column',
    background: '#ffffff',
    borderRadius: 0,
    shadow: 'none',
    minHeight: 50,
  } as ContainerProps,
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
