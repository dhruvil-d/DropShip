import { useNode } from '@craftjs/core';

interface NewsletterSectionProps {
  padding: number;
  background: string;
  textAlign: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

export const NewsletterSection = ({ padding, background, textAlign, children }: NewsletterSectionProps) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{
        padding: `${padding}px`,
        backgroundColor: background,
        textAlign,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
      }}
      className="outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all min-h-[100px] rounded-lg"
    >
      {children}
    </div>
  );
};

// ------ Settings Panel ------

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
        <label className="text-xs text-gray-600 flex items-center gap-2">
          Background
          <input type="color" value={props.background} onChange={(e) => setProp((p: NewsletterSectionProps) => { p.background = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.background}</span>
        </label>
      </div>
    </div>
  );
};

NewsletterSection.craft = {
  displayName: 'NewsletterSection',
  props: {
    padding: 48,
    background: '#f0f9ff',
    textAlign: 'center',
  } as NewsletterSectionProps,
  related: {
    settings: NewsletterSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
