import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';


interface HeroSectionProps {
  padding: number;
  background: string;
  textAlign: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

export const HeroSection = ({ padding, background, textAlign, children }: HeroSectionProps) => {
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
        textAlign,
        display: 'flex',
        flexDirection: 'column',
        alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
        gap: '16px',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
      className="min-h-[200px] outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all"
    >
      {children}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

const HeroSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as HeroSectionProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <label className="text-xs text-gray-600">
          Padding
          <input type="number" value={props.padding} onChange={(e) => setProp((p: HeroSectionProps) => { p.padding = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Text Align
          <select value={props.textAlign} onChange={(e) => setProp((p: HeroSectionProps) => { p.textAlign = e.target.value as HeroSectionProps['textAlign']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          Background
          <input type="color" value={props.background} onChange={(e) => setProp((p: HeroSectionProps) => { p.background = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.background}</span>
        </label>
      </div>
    </div>
  );
};

HeroSection.craft = {
  displayName: 'HeroSection',
  props: { padding: 64, background: '#f9fafb', textAlign: 'center' } as HeroSectionProps,
  related: { settings: HeroSectionSettings },
  rules: { canDrag: () => true },
};
