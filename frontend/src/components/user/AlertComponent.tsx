import { useRef } from 'react';
import { Element, useNode } from '@craftjs/core';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { Text } from './Text';
import { deriveDarkColor } from '../../shared/colorTransform';
import { ColorPickerControl } from '../editor/ColorPickerControl';

interface AlertComponentProps {
  variant: 'info' | 'success' | 'warning' | 'error' | 'custom';
  dismissible: boolean;
  backgroundColor: string;
  backgroundColorDark?: string;
  textColor: string;
  textColorDark?: string;
  borderColor: string;
  borderColorDark?: string;
}

const variantConfig: Record<string, { bg: string; border: string; text: string; icon: typeof AlertCircle }> = {
  info:    { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-800',   icon: AlertCircle },
  success: { bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-800',  icon: CheckCircle },
  warning: { bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-800', icon: AlertTriangle },
  error:   { bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-800',    icon: XCircle },
};

const darkVariantConfig: Record<string, { bg: string; border: string; text: string; icon: typeof AlertCircle }> = {
  info:    { bg: 'bg-blue-950/40',    border: 'border-blue-800/60',   text: 'text-blue-300',   icon: AlertCircle },
  success: { bg: 'bg-green-950/40',   border: 'border-green-800/60',  text: 'text-green-300',  icon: CheckCircle },
  warning: { bg: 'bg-yellow-950/40',  border: 'border-yellow-800/60', text: 'text-yellow-300', icon: AlertTriangle },
  error:   { bg: 'bg-red-950/40',     border: 'border-red-800/60',    text: 'text-red-300',    icon: XCircle },
};

export const AlertComponent = ({ variant, backgroundColor, backgroundColorDark, textColor, textColorDark, borderColor, borderColorDark }: AlertComponentProps) => {
  const { connectRef, isSelected, isDark, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLDivElement>(null);

  const isCustom = variant === 'custom';

  // For preset variants, use Tailwind classes
  const config = !isCustom
    ? (isDark
      ? (darkVariantConfig[variant] || darkVariantConfig.info)
      : (variantConfig[variant] || variantConfig.info))
    : null;

  // For custom variant, use inline styles
  const activeBg = isCustom
    ? (isDark ? (backgroundColorDark || deriveDarkColor(backgroundColor, 'background')) : backgroundColor)
    : undefined;
  const activeText = isCustom
    ? (isDark ? (textColorDark || deriveDarkColor(textColor, 'text')) : textColor)
    : undefined;
  const activeBorder = isCustom
    ? (isDark ? (borderColorDark || deriveDarkColor(borderColor, 'border')) : borderColor)
    : undefined;

  const Icon = config?.icon || AlertCircle;

  return (
    <div
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      className={`flex items-start gap-3 p-4 rounded-lg border ${isCustom ? '' : `${config!.bg} ${config!.border} ${config!.text}`} outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move`}
      style={{
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...(isCustom ? {
          backgroundColor: activeBg,
          color: activeText,
          borderColor: activeBorder,
        } : {}),
        ...responsiveStyles,
      }}
    >
      <Icon size={20} className="mt-0.5 flex-shrink-0" />
      <div>
        <Element id="alert-title" is={Text} text="Heads up!" fontSize={16} fontWeight="600" color="inherit" textAlign="left" lineHeight={1.5} />
        <div className="mt-1">
          <Element id="alert-desc" is={Text} text="This is an informational alert message." fontSize={14} fontWeight="400" color="inherit" textAlign="left" lineHeight={1.5} />
        </div>
      </div>
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

// ------ Settings Panel ------

const AlertSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as AlertComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Style</h4>
        <label className="text-xs text-gray-600">
          Variant
          <select value={props.variant} onChange={(e) => setProp((p: AlertComponentProps) => { p.variant = e.target.value as AlertComponentProps['variant']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
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
            onLightChange={(color) => setProp((p: AlertComponentProps) => { p.backgroundColor = color; })}
            onDarkChange={(color) => setProp((p: AlertComponentProps) => { p.backgroundColorDark = color; })}
            onDarkReset={() => setProp((p: AlertComponentProps) => { p.backgroundColorDark = undefined; })}
          />
          <ColorPickerControl
            label="Text Color"
            role="text"
            lightColor={props.textColor}
            darkColorOverride={props.textColorDark}
            onLightChange={(color) => setProp((p: AlertComponentProps) => { p.textColor = color; })}
            onDarkChange={(color) => setProp((p: AlertComponentProps) => { p.textColorDark = color; })}
            onDarkReset={() => setProp((p: AlertComponentProps) => { p.textColorDark = undefined; })}
          />
          <ColorPickerControl
            label="Border Color"
            role="border"
            lightColor={props.borderColor}
            darkColorOverride={props.borderColorDark}
            onLightChange={(color) => setProp((p: AlertComponentProps) => { p.borderColor = color; })}
            onDarkChange={(color) => setProp((p: AlertComponentProps) => { p.borderColorDark = color; })}
            onDarkReset={() => setProp((p: AlertComponentProps) => { p.borderColorDark = undefined; })}
          />
        </div>
      )}
    </div>
  );
};

AlertComponent.craft = {
  displayName: 'AlertComponent',
  props: {
    variant: 'info',
    dismissible: false,
    backgroundColor: '#eff6ff',
    textColor: '#1e40af',
    borderColor: '#bfdbfe',
  } as AlertComponentProps,
  related: {
    settings: AlertSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
