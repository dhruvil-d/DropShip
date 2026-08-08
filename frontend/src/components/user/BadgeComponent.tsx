import { useRef } from 'react';
import { Element, useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { Text } from './Text';

interface BadgeComponentProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'gray';
}

const variantClasses: Record<string, string> = {
  default: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
};

export const BadgeComponent = ({ variant }: BadgeComponentProps) => {
  const { connectRef, isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move ${variantClasses[variant] || ''}`}
      style={{ position: 'relative', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', ...responsiveStyles }}
    >
      <Element id="badge-text" is={Text} text="Badge" fontSize={12} fontWeight="500" color="inherit" textAlign="center" lineHeight={1.5} />
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </span>
  );
};

// ------ Settings Panel ------

const BadgeSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as BadgeComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Style</h4>
        <label className="text-xs text-gray-600">
          Variant
          <select value={props.variant} onChange={(e) => setProp((p: BadgeComponentProps) => { p.variant = e.target.value as BadgeComponentProps['variant']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="default">Default (Blue)</option>
            <option value="success">Success (Green)</option>
            <option value="warning">Warning (Yellow)</option>
            <option value="error">Error (Red)</option>
            <option value="gray">Gray</option>
          </select>
        </label>
      </div>
    </div>
  );
};

BadgeComponent.craft = {
  displayName: 'BadgeComponent',
  props: {
    variant: 'default',
  } as BadgeComponentProps,
  related: {
    settings: BadgeSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
