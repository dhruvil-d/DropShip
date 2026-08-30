import { useRef } from 'react';
import { Element, useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { Text } from './Text';
import { deriveDarkColor } from '../../shared/colorTransform';
import { ColorPickerControl } from '../editor/ColorPickerControl';

interface BadgeComponentProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'gray' | 'custom';
  backgroundColor: string;
  backgroundColorDark?: string;
  textColor: string;
  textColorDark?: string;
}

const variantClasses: Record<string, string> = {
  default: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
};

const darkVariantClasses: Record<string, string> = {
  default: 'bg-blue-900/40 text-blue-300',
  success: 'bg-green-900/40 text-green-300',
  warning: 'bg-yellow-900/40 text-yellow-300',
  error: 'bg-red-900/40 text-red-300',
  gray: 'bg-slate-700/60 text-slate-300',
};

export const BadgeComponent = ({ variant, backgroundColor, backgroundColorDark, textColor, textColorDark }: BadgeComponentProps) => {
  const { connectRef, isSelected, isDark, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLSpanElement>(null);

  const isCustom = variant === 'custom';

  const activeBg = isCustom
    ? (isDark ? (backgroundColorDark || deriveDarkColor(backgroundColor, 'background')) : backgroundColor)
    : undefined;
  const activeText = isCustom
    ? (isDark ? (textColorDark || deriveDarkColor(textColor, 'text')) : textColor)
    : undefined;

  return (
    <span
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move ${isCustom ? '' : ((isDark ? darkVariantClasses[variant] : variantClasses[variant]) || '')}`}
      style={{
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...(isCustom ? { backgroundColor: activeBg, color: activeText } : {}),
        ...responsiveStyles,
      }}
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
            <option value="custom">Custom Color</option>
          </select>
        </label>
      </div>

      {/* Custom Colors — only show when variant is 'custom' */}
      {props.variant === 'custom' && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
          <ColorPickerControl
            label="Background"
            role="background"
            lightColor={props.backgroundColor}
            darkColorOverride={props.backgroundColorDark}
            onLightChange={(color) => setProp((p: BadgeComponentProps) => { p.backgroundColor = color; })}
            onDarkChange={(color) => setProp((p: BadgeComponentProps) => { p.backgroundColorDark = color; })}
            onDarkReset={() => setProp((p: BadgeComponentProps) => { p.backgroundColorDark = undefined; })}
          />
          <ColorPickerControl
            label="Text Color"
            role="text"
            lightColor={props.textColor}
            darkColorOverride={props.textColorDark}
            onLightChange={(color) => setProp((p: BadgeComponentProps) => { p.textColor = color; })}
            onDarkChange={(color) => setProp((p: BadgeComponentProps) => { p.textColorDark = color; })}
            onDarkReset={() => setProp((p: BadgeComponentProps) => { p.textColorDark = undefined; })}
          />
        </div>
      )}
    </div>
  );
};

BadgeComponent.craft = {
  displayName: 'BadgeComponent',
  props: {
    variant: 'default',
    backgroundColor: '#dbeafe',
    textColor: '#1e40af',
  } as BadgeComponentProps,
  related: {
    settings: BadgeSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
