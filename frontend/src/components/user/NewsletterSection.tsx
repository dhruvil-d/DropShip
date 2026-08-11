import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { deriveDarkColor } from '../../shared/colorTransform';
import { ColorPickerControl } from '../editor/ColorPickerControl';

interface NewsletterSectionProps {
  padding: number;
  background: string;
  backgroundDark?: string;
  textAlign: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

export const NewsletterSection = ({ padding, background, backgroundDark, textAlign, children }: NewsletterSectionProps) => {
  const { connectRef, isSelected, isDark, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLDivElement>(null);

  const activeBg = isDark
    ? (backgroundDark || deriveDarkColor(background, 'background'))
    : background;

  return (
    <div
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      style={{
        padding: `${padding}px`,
        backgroundColor: activeBg,
        textAlign,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
      className="outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all min-h-[100px] rounded-lg"
    >
      {children}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

const NewsletterSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as NewsletterSectionProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <label className="text-xs text-gray-600">
          Padding
          <input type="number" value={props.padding} onChange={(e) => setProp((p: NewsletterSectionProps) => { p.padding = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Text Align
          <select value={props.textAlign} onChange={(e) => setProp((p: NewsletterSectionProps) => { p.textAlign = e.target.value as NewsletterSectionProps['textAlign']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
        <ColorPickerControl
          label="Background"
          role="background"
          lightColor={props.background}
          darkColorOverride={props.backgroundDark}
          onLightChange={(color) => setProp((p: NewsletterSectionProps) => { p.background = color; })}
          onDarkChange={(color) => setProp((p: NewsletterSectionProps) => { p.backgroundDark = color; })}
          onDarkReset={() => setProp((p: NewsletterSectionProps) => { p.backgroundDark = undefined; })}
        />
      </div>
    </div>
  );
};

NewsletterSection.craft = {
  displayName: 'NewsletterSection',
  props: { padding: 48, background: '#f0f9ff', textAlign: 'center' } as NewsletterSectionProps,
  related: { settings: NewsletterSettings },
  rules: { canDrag: () => true },
};
