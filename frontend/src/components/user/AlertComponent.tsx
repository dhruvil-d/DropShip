import { useRef } from 'react';
import { Element, useNode } from '@craftjs/core';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { Text } from './Text';

interface AlertComponentProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  dismissible: boolean;
}

const variantConfig: Record<string, { bg: string; border: string; text: string; icon: typeof AlertCircle }> = {
  info:    { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-800',   icon: AlertCircle },
  success: { bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-800',  icon: CheckCircle },
  warning: { bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-800', icon: AlertTriangle },
  error:   { bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-800',    icon: XCircle },
};

export const AlertComponent = ({ variant }: AlertComponentProps) => {
  const { connectRef, isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLDivElement>(null);
  const config = variantConfig[variant] || variantConfig.info;
  const Icon = config.icon;

  return (
    <div
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.bg} ${config.border} ${config.text} outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move`}
      style={{ position: 'relative', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', ...responsiveStyles }}
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
          </select>
        </label>
      </div>
    </div>
  );
};

AlertComponent.craft = {
  displayName: 'AlertComponent',
  props: {
    variant: 'info',
    dismissible: false,
  } as AlertComponentProps,
  related: {
    settings: AlertSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
