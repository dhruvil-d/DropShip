import { useRef, useCallback, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { RichTextToolbar } from '../editor/RichTextToolbar';


interface HeadingProps {
  /** HTML content string — may contain inline formatting spans */
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export const Heading = ({ text, level, fontSize, color, textAlign }: HeadingProps) => {
  const { isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const { actions: { setProp }, connectors: { connect } } = useNode();
  const elementRef = useRef<HTMLHeadingElement>(null);
  const startFontSizeRef = useRef(fontSize);
  const Tag = level;

  const internalChangeRef = useRef(false);
  const latestTextRef = useRef(text);
  latestTextRef.current = text;

  // Sync text prop to element when changed externally
  useEffect(() => {
    if (internalChangeRef.current) {
      internalChangeRef.current = false;
      return;
    }
    if (elementRef.current && elementRef.current.innerHTML !== text) {
      elementRef.current.innerHTML = text;
    }
  }, [text]);

  // Auto-focus when selected (optional, but nice for UX)
  useEffect(() => {
    if (isSelected && elementRef.current && document.activeElement !== elementRef.current) {
      // We don't forcefully focus here because it might reset the caret position 
      // if the user clicked a specific character. The browser handles focus on mousedown.
    } else if (!isSelected) {
      // Save content before exiting
      if (elementRef.current) {
        internalChangeRef.current = true;
        setProp((p: HeadingProps) => {
          p.text = elementRef.current!.innerHTML;
        });
      }
    }
  }, [isSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback(() => {
    if (elementRef.current) {
      internalChangeRef.current = true;
      const html = elementRef.current.innerHTML;
      setProp((p: HeadingProps) => {
        p.text = html;
      }, 500);
    }
  }, [setProp]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Always stop propagation so parent containers don't initiate a drag
    e.stopPropagation();
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget?.closest('.rich-text-toolbar')) {
      return;
    }
    if (elementRef.current) {
      internalChangeRef.current = true;
      setProp((p: HeadingProps) => {
        p.text = elementRef.current!.innerHTML;
      });
    }
  }, [setProp]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      elementRef.current?.blur();
    }
    // Always prevent Craft.js from interpreting keypresses as shortcuts while typing
    e.stopPropagation();
  }, []);

  // Ref callback: connect for selection (NO drag), set initial HTML content
  const refCallback = useCallback(
    (ref: HTMLHeadingElement | null) => {
      elementRef.current = ref;
      if (ref) {
        connect(ref);
        if (ref.innerHTML !== latestTextRef.current) {
          ref.innerHTML = latestTextRef.current;
        }
      }
    },
    [connect]
  );

  return (
    <>
      <Tag
        ref={refCallback}
        contentEditable={true}
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseDown={handleMouseDown}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: `${fontSize}px`,
          color,
          textAlign,
          position: 'relative',
          transition: isSelected ? 'none' : 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          ...responsiveStyles,
        }}
        className={`m-0 font-bold transition-all outline-transparent rich-text-editable ${
          isSelected
            ? 'rich-text-editing-ring cursor-text'
            : 'hover:outline-blue-400 hover:outline-dashed hover:outline-2 cursor-text'
        }`}
      />
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
      <RichTextToolbar targetRef={elementRef} isEditing={isSelected} />
    </>
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
        <p className="text-[11px] text-gray-400 mb-2 italic">
          Click the heading on the canvas to edit. Select words to format them with the floating toolbar.
        </p>
        <label className="text-xs text-gray-600">
          Text
          <input type="text" value={props.text} onChange={(e) => setProp((p: HeadingProps) => { p.text = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm font-mono" />
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
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Block Defaults</h4>
        <p className="text-[11px] text-gray-400 mb-2">
          These apply to the entire heading. Use the floating toolbar for per-word formatting.
        </p>
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
    canDrag: () => false,
  },
};
