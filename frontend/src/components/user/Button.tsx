import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';


interface ButtonProps {
  text: string;
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  disabled: boolean;
  fullWidth: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  outline: 'border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = ({ text, variant, size, disabled, fullWidth }: ButtonProps) => {
  const { connectRef, isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLButtonElement>(null);

  const classes = [
    'rounded font-medium cursor-move border-0 outline-transparent',
    'hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all',
    variantClasses[variant] || '',
    sizeClasses[size] || '',
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
  ].join(' ');

  return (
    <button
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      className={classes}
      disabled={disabled}
      style={{
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
    >
      {text}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </button>
  );
};

// ------ Settings Panel ------

const ButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as ButtonProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Content */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <label className="text-xs text-gray-600">
          Label
          <input type="text" value={props.text} onChange={(e) => setProp((p: ButtonProps) => { p.text = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>

      {/* Style */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Style</h4>
        <label className="text-xs text-gray-600">
          Variant
          <select value={props.variant} onChange={(e) => setProp((p: ButtonProps) => { p.variant = e.target.value as ButtonProps['variant']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Size
          <select value={props.size} onChange={(e) => setProp((p: ButtonProps) => { p.size = e.target.value as ButtonProps['size']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
      </div>

      {/* State */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">State</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          <input type="checkbox" checked={props.disabled} onChange={(e) => setProp((p: ButtonProps) => { p.disabled = e.target.checked; })}
            className="rounded border-gray-300" />
          Disabled
        </label>
        <label className="text-xs text-gray-600 flex items-center gap-2 mt-2">
          <input type="checkbox" checked={props.fullWidth} onChange={(e) => setProp((p: ButtonProps) => { p.fullWidth = e.target.checked; })}
            className="rounded border-gray-300" />
          Full Width
        </label>
      </div>
    </div>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    text: 'Click Me',
    variant: 'primary',
    size: 'md',
    disabled: false,
    fullWidth: false,
  } as ButtonProps,
  related: {
    settings: ButtonSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
