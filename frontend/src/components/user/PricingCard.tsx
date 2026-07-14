import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';

interface PricingCardProps {
  padding: number;
  background: string;
  borderRadius: number;
  highlighted: boolean;
  children?: React.ReactNode;
}

export const PricingCard = ({ padding, background, borderRadius, highlighted, children }: PricingCardProps) => {
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
        borderRadius: `${borderRadius}px`,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e5e7eb',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
      className={`shadow-md outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all min-h-[100px] ${highlighted ? 'ring-2 ring-blue-500' : ''}`}
    >
      {children}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

const PricingCardSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as PricingCardProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Padding
            <input type="number" value={props.padding} onChange={(e) => setProp((p: PricingCardProps) => { p.padding = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Border Radius
            <input type="number" value={props.borderRadius} onChange={(e) => setProp((p: PricingCardProps) => { p.borderRadius = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          Background
          <input type="color" value={props.background} onChange={(e) => setProp((p: PricingCardProps) => { p.background = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.background}</span>
        </label>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Highlight</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          <input type="checkbox" checked={props.highlighted} onChange={(e) => setProp((p: PricingCardProps) => { p.highlighted = e.target.checked; })}
            className="rounded border-gray-300" />
          Highlighted (Popular)
        </label>
      </div>
    </div>
  );
};

PricingCard.craft = {
  displayName: 'PricingCard',
  props: { padding: 32, background: '#ffffff', borderRadius: 12, highlighted: false } as PricingCardProps,
  related: { settings: PricingCardSettings },
  rules: { canDrag: () => true },
};
