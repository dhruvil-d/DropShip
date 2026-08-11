import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { deriveDarkColor } from '../../shared/colorTransform';
import { ColorPickerControl } from '../editor/ColorPickerControl';

interface ContactFormProps {
  padding: number;
  gap: number;
  background: string;
  backgroundDark?: string;
  children?: React.ReactNode;
}

export const ContactForm = ({ padding, gap, background, backgroundDark, children }: ContactFormProps) => {
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
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${activeBorder}`,
        borderRadius: '8px',
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

const ContactFormSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as ContactFormProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Padding
            <input type="number" value={props.padding} onChange={(e) => setProp((p: ContactFormProps) => { p.padding = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Gap
            <input type="number" value={props.gap} onChange={(e) => setProp((p: ContactFormProps) => { p.gap = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
        <ColorPickerControl
          label="Background"
          role="background"
          lightColor={props.background}
          darkColorOverride={props.backgroundDark}
          onLightChange={(color) => setProp((p: ContactFormProps) => { p.background = color; })}
          onDarkChange={(color) => setProp((p: ContactFormProps) => { p.backgroundDark = color; })}
          onDarkReset={() => setProp((p: ContactFormProps) => { p.backgroundDark = undefined; })}
        />
      </div>
    </div>
  );
};

ContactForm.craft = {
  displayName: 'ContactForm',
  props: { padding: 32, gap: 16, background: '#ffffff' } as ContactFormProps,
  related: { settings: ContactFormSettings },
  rules: { canDrag: () => true },
};
