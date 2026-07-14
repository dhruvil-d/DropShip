import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';


interface TextProps {
  text: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
}

export const Text = ({ text, fontSize, fontWeight, color, textAlign, lineHeight }: TextProps) => {
  const { connectRef, isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const { actions: { setProp } } = useNode();
  const elementRef = useRef<HTMLParagraphElement>(null);
  const startFontSizeRef = useRef(fontSize);

  return (
    <p
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      style={{
        fontSize: `${fontSize}px`,
        fontWeight,
        color,
        textAlign,
        lineHeight,
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
      className="m-0 p-1 outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move"
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
            setProp((p: TextProps) => {
              p.fontSize = Math.max(8, Math.round(startFontSizeRef.current * scale));
            });
          }
        }}
      />}
    </p>
  );
};

// ------ Settings Panel ------

const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as TextProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Content */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <textarea
          value={props.text}
          onChange={(e) => setProp((p: TextProps) => { p.text = e.target.value; })}
          rows={3}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm resize-y"
        />
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Typography</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Font Size
            <input type="number" value={props.fontSize} onChange={(e) => setProp((p: TextProps) => { p.fontSize = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Line Height
            <input type="number" step="0.1" value={props.lineHeight} onChange={(e) => setProp((p: TextProps) => { p.lineHeight = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
        </div>

        <label className="text-xs text-gray-600 mt-2 block">
          Weight
          <select value={props.fontWeight} onChange={(e) => setProp((p: TextProps) => { p.fontWeight = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="300">Light (300)</option>
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
          </select>
        </label>

        <label className="text-xs text-gray-600 mt-2 block">
          Align
          <select value={props.textAlign} onChange={(e) => setProp((p: TextProps) => { p.textAlign = e.target.value as TextProps['textAlign']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>

        <label className="text-xs text-gray-600 mt-2 flex items-center gap-2">
          Color
          <input type="color" value={props.color} onChange={(e) => setProp((p: TextProps) => { p.color = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <span className="text-xs text-gray-400 font-mono">{props.color}</span>
        </label>
      </div>
    </div>
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Edit me',
    fontSize: 16,
    fontWeight: '400',
    color: '#1f2937',
    textAlign: 'left',
    lineHeight: 1.5,
  } as TextProps,
  related: {
    settings: TextSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
