import { useRef, useCallback, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { RichTextToolbar } from '../editor/RichTextToolbar';


interface TextProps {
  /** HTML content string — may contain inline formatting spans */
  text: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
}

export const Text = ({ text, fontSize, fontWeight, color, textAlign, lineHeight }: TextProps) => {
  const { isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const { actions: { setProp }, connectors: { connect } } = useNode();
  const elementRef = useRef<HTMLParagraphElement>(null);
  const startFontSizeRef = useRef(fontSize);

  // Track whether the content was changed internally (by user typing) to avoid
  // the sync effect from overwriting the user's edits
  const internalChangeRef = useRef(false);
  // Keep a ref to the latest text value so the ref callback can read it without re-running
  const latestTextRef = useRef(text);
  latestTextRef.current = text;

  // Sync the text prop to the element when it changes EXTERNALLY (e.g. from settings panel).
  // When the user is typing (internalChangeRef is true), skip the sync.
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
        setProp((p: TextProps) => {
          p.text = elementRef.current!.innerHTML;
        });
      }
    }
  }, [isSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Save innerHTML to the text prop on every input */
  const handleInput = useCallback(() => {
    if (elementRef.current) {
      internalChangeRef.current = true;
      const html = elementRef.current.innerHTML;
      setProp((p: TextProps) => {
        p.text = html;
      }, 500); // 500ms throttle
    }
  }, [setProp]);

  /** Prevent Craft.js from stealing mouse events while editing — allows normal text selection */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Always stop propagation so parent containers don't initiate a drag
    e.stopPropagation();
  }, []);

  /** Handle blur — save content */
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't save/exit if focus moved to the toolbar (portal)
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget?.closest('.rich-text-toolbar')) {
      return;
    }
    if (elementRef.current) {
      internalChangeRef.current = true;
      setProp((p: TextProps) => {
        p.text = elementRef.current!.innerHTML;
      });
    }
  }, [setProp]);

  /** Handle key events */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      elementRef.current?.blur();
    }
    // Always prevent Craft.js from interpreting keypresses as shortcuts while typing
    e.stopPropagation();
  }, []);

  // Ref callback: connect to Craft.js for selection (NO drag), and set initial HTML content
  const refCallback = useCallback(
    (ref: HTMLParagraphElement | null) => {
      elementRef.current = ref;
      if (ref) {
        connect(ref);
        // Set initial content from prop (never use dangerouslySetInnerHTML)
        if (ref.innerHTML !== latestTextRef.current) {
          ref.innerHTML = latestTextRef.current;
        }
      }
    },
    [connect]
  );

  return (
    <>
      <p
        ref={refCallback}
        contentEditable={true}
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseDown={handleMouseDown}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight,
          color,
          textAlign,
          lineHeight,
          position: 'relative',
          transition: isSelected ? 'none' : 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          ...responsiveStyles,
        }}
        className={`m-0 p-1 transition-all outline-transparent rich-text-editable ${
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
            setProp((p: TextProps) => {
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

const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as TextProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Content */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <p className="text-[11px] text-gray-400 mb-2 italic">
          Click the text on the canvas to edit. Select words to format them with the floating toolbar.
        </p>
        <textarea
          value={props.text}
          onChange={(e) => setProp((p: TextProps) => { p.text = e.target.value; })}
          rows={3}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm resize-y font-mono"
          placeholder="HTML content…"
        />
      </div>

      {/* Block-level Typography (defaults) */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Block Defaults</h4>
        <p className="text-[11px] text-gray-400 mb-2">
          These apply to the entire text block. Use the floating toolbar for per-word formatting.
        </p>
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
    canDrag: () => false,
  },
};
