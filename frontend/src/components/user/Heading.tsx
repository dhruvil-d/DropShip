import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';


interface HeadingProps {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export const Heading = ({ text, level, fontSize, color, textAlign }: HeadingProps) => {
  const { connectRef, isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const { actions: { setProp } } = useNode();
  const elementRef = useRef<HTMLHeadingElement>(null);
  const startFontSizeRef = useRef(fontSize);
  const Tag = level;

  return (
    <Tag
      ref={(ref: HTMLHeadingElement | null) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      style={{
        fontSize: `${fontSize}px`,
        color,
        textAlign,
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
      className="m-0 font-bold outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move"
    >
      {text}
      {isSelected && <ResizeHandles 
        nodeId={nodeId} 
        targetRef={elementRef} 
        onResizeStart={() => {
          startFontSizeRef.current = fontSize;
        }}
        onResize={(w, _h, startW) => {
          if (startW > 0 && w !== startW) {
            const scale = w / startW;
            setProp((p: HeadingProps) => {
              p.fontSize = Math.max(8, Math.round(startFontSizeRef.current * scale));
            });
          }
        }}
      />}
    </Tag>
  );
};

// ------ Settings Panel ------

const HeadingSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as HeadingProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <label className="text-xs text-gray-600">
          Text
          <input type="text" value={props.text} onChange={(e) => setProp((p: HeadingProps) => { p.text = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Level
          <select value={props.level} onChange={(e) => setProp((p: HeadingProps) => { p.level = e.target.value as HeadingProps['level']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="h4">H4</option>
            <option value="h5">H5</option>
            <option value="h6">H6</option>
          </select>
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Typography</h4>
        <label className="text-xs text-gray-600">
          Font Size
          <input type="number" value={props.fontSize} onChange={(e) => setProp((p: HeadingProps) => { p.fontSize = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Align
          <select value={props.textAlign} onChange={(e) => setProp((p: HeadingProps) => { p.textAlign = e.target.value as HeadingProps['textAlign']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label className="text-xs text-gray-600 mt-2 flex items-center gap-2">
          Color
          <input type="color" value={props.color} onChange={(e) => setProp((p: HeadingProps) => { p.color = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.color}</span>
        </label>
      </div>
    </div>
  );
};

Heading.craft = {
  displayName: 'Heading',
  props: {
    text: 'Heading',
    level: 'h2',
    fontSize: 28,
    color: '#111827',
    textAlign: 'left',
  } as HeadingProps,
  related: {
    settings: HeadingSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
