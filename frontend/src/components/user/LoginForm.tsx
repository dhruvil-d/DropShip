import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { deriveDarkColor } from '../../shared/colorTransform';
import { ColorPickerControl } from '../editor/ColorPickerControl';


interface LoginFormProps {
  padding: number;
  gap: number;
  background: string;
  backgroundDark?: string;
  borderRadius: number;
  children?: React.ReactNode;
}

export const LoginForm = ({ padding, gap, background, backgroundDark, borderRadius, children }: LoginFormProps) => {
  const { connectRef, isSelected, isDark, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLDivElement>(null);

  const activeBg = isDark
    ? (backgroundDark || deriveDarkColor(background, 'background'))
    : background;
  const activeBorder = isDark
    ? deriveDarkColor('#e5e7eb', 'border')
    : '#e5e7eb';

  return (
    <div
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      style={{
        padding: `${padding}px`,
        gap: `${gap}px`,
        backgroundColor: activeBg,
        borderRadius: `${borderRadius}px`,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${activeBorder}`,
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
      className="shadow-md outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all min-h-[100px]"
    >
      {children}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

const LoginFormSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as LoginFormProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Padding
            <input type="number" value={props.padding} onChange={(e) => setProp((p: LoginFormProps) => { p.padding = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Gap
            <input type="number" value={props.gap} onChange={(e) => setProp((p: LoginFormProps) => { p.gap = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
        </div>
        <label className="text-xs text-gray-600 mt-2 block">
          Border Radius
          <input type="number" value={props.borderRadius} onChange={(e) => setProp((p: LoginFormProps) => { p.borderRadius = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
        <ColorPickerControl
          label="Background"
          role="background"
          lightColor={props.background}
          darkColorOverride={props.backgroundDark}
          onLightChange={(color) => setProp((p: LoginFormProps) => { p.background = color; })}
          onDarkChange={(color) => setProp((p: LoginFormProps) => { p.backgroundDark = color; })}
          onDarkReset={() => setProp((p: LoginFormProps) => { p.backgroundDark = undefined; })}
        />
      </div>
    </div>
  );
};

LoginForm.craft = {
  displayName: 'LoginForm',
  props: { padding: 32, gap: 16, background: '#ffffff', borderRadius: 8 } as LoginFormProps,
  related: { settings: LoginFormSettings },
  rules: { canDrag: () => true },
};
