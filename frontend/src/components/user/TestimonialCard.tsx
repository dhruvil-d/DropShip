import { useNode } from '@craftjs/core';

interface TestimonialCardProps {
  padding: number;
  background: string;
  borderRadius: number;
  children?: React.ReactNode;
}

export const TestimonialCard = ({ padding, background, borderRadius, children }: TestimonialCardProps) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{
        padding: `${padding}px`,
        backgroundColor: background,
        borderRadius: `${borderRadius}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        border: '1px solid #e5e7eb',
      }}
      className="shadow-sm outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all min-h-[100px]"
    >
      {children}
    </div>
  );
};

// ------ Settings Panel ------

const TestimonialCardSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as TestimonialCardProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Padding
            <input type="number" value={props.padding} onChange={(e) => setProp((p: TestimonialCardProps) => { p.padding = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Border Radius
            <input type="number" value={props.borderRadius} onChange={(e) => setProp((p: TestimonialCardProps) => { p.borderRadius = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          Background
          <input type="color" value={props.background} onChange={(e) => setProp((p: TestimonialCardProps) => { p.background = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.background}</span>
        </label>
      </div>
    </div>
  );
};

TestimonialCard.craft = {
  displayName: 'TestimonialCard',
  props: {
    padding: 24,
    background: '#ffffff',
    borderRadius: 12,
  } as TestimonialCardProps,
  related: {
    settings: TestimonialCardSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
