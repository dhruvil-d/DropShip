// ============================================================
// RichTextToolbar — Floating inline formatting toolbar
// ============================================================
// Appears when text is selected inside a contentEditable element.
// Uses document.execCommand for basic formatting and manual
// span-wrapping for font-size/color changes on selection.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/rich-text-toolbar.css';

interface RichTextToolbarProps {
  /** The contentEditable element this toolbar controls */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Whether the text component is in edit mode */
  isEditing: boolean;
}

interface ToolbarPosition {
  top: number;
  left: number;
}

/** Check whether the current command state is active */
function queryCommandState(cmd: string): boolean {
  try {
    return document.queryCommandState(cmd);
  } catch {
    return false;
  }
}

/** Get the computed font size of the current selection */
function getSelectionFontSize(): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '';

  const range = sel.getRangeAt(0);
  let node: Node | null = range.startContainer;

  // Walk up to find an element node
  while (node && node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode;
  }

  if (node && node instanceof HTMLElement) {
    const computed = window.getComputedStyle(node);
    return Math.round(parseFloat(computed.fontSize)).toString();
  }
  return '';
}

/** Get the computed color of the current selection */
function getSelectionColor(): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '#000000';

  const range = sel.getRangeAt(0);
  let node: Node | null = range.startContainer;

  while (node && node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode;
  }

  if (node && node instanceof HTMLElement) {
    const computed = window.getComputedStyle(node);
    return rgbToHex(computed.color);
  }
  return '#000000';
}

/** Convert rgb(r,g,b) string to hex */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  const r = parseInt(match[0]).toString(16).padStart(2, '0');
  const g = parseInt(match[1]).toString(16).padStart(2, '0');
  const b = parseInt(match[2]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Apply a font-size to the current selection by wrapping it in a span.
 * document.execCommand('fontSize') uses the legacy <font> tag, so we
 * use a manual approach with spans instead.
 */
function applyFontSizeToSelection(size: number): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

  // Use fontSize command with a marker value, then replace the <font> tag
  document.execCommand('fontSize', false, '7');

  // Find all <font size="7"> elements and replace with styled spans
  const fonts = document.querySelectorAll('font[size="7"]');
  fonts.forEach((font) => {
    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    span.innerHTML = font.innerHTML;
    font.parentNode?.replaceChild(span, font);
  });
}

export const RichTextToolbar = ({ targetRef, isEditing }: RichTextToolbarProps) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<ToolbarPosition>({ top: 0, left: 0 });
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [fontSize, setFontSize] = useState('');
  const [color, setColor] = useState('#000000');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  /** Save the current selection so we can restore it after toolbar interaction */
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  /** Restore the saved selection */
  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  }, []);

  /** Update toolbar position and state based on current selection */
  const updateToolbar = useCallback(() => {
    if (!isEditing || !targetRef.current) {
      setVisible(false);
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setVisible(false);
      return;
    }

    // Make sure the selection is inside our target element
    const range = sel.getRangeAt(0);
    if (!targetRef.current.contains(range.commonAncestorContainer)) {
      setVisible(false);
      return;
    }

    // Position toolbar above the selection
    const rect = range.getBoundingClientRect();
    if (rect.width === 0) {
      setVisible(false);
      return;
    }

    const toolbarWidth = toolbarRef.current?.offsetWidth || 320;
    const toolbarHeight = toolbarRef.current?.offsetHeight || 36;

    let top = rect.top - toolbarHeight - 8;
    let left = rect.left + rect.width / 2 - toolbarWidth / 2;

    // Clamp to viewport
    if (top < 8) top = rect.bottom + 8;
    if (left < 8) left = 8;
    if (left + toolbarWidth > window.innerWidth - 8) {
      left = window.innerWidth - toolbarWidth - 8;
    }

    setPosition({ top, left });

    // Query formatting state
    setIsBold(queryCommandState('bold'));
    setIsItalic(queryCommandState('italic'));
    setIsUnderline(queryCommandState('underline'));
    setIsStrike(queryCommandState('strikeThrough'));
    setFontSize(getSelectionFontSize());
    setColor(getSelectionColor());

    setVisible(true);
    saveSelection();
  }, [isEditing, targetRef, saveSelection]);

  // Listen for selection changes
  useEffect(() => {
    if (!isEditing) {
      setVisible(false);
      return;
    }

    const handleSelectionChange = () => {
      // Small delay to let the selection settle
      requestAnimationFrame(updateToolbar);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isEditing, updateToolbar]);

  // Hide toolbar when editing mode is exited
  useEffect(() => {
    if (!isEditing) setVisible(false);
  }, [isEditing]);

  /** Execute a formatting command */
  const execFormat = useCallback((cmd: string, value?: string) => {
    restoreSelection();
    targetRef.current?.focus();
    document.execCommand(cmd, false, value);
    // Re-query state after command
    requestAnimationFrame(updateToolbar);
  }, [restoreSelection, targetRef, updateToolbar]);

  /** Handle font-size change */
  const handleFontSizeChange = useCallback((newSize: string) => {
    setFontSize(newSize);
    const sizeNum = parseInt(newSize);
    if (isNaN(sizeNum) || sizeNum < 1) return;

    restoreSelection();
    targetRef.current?.focus();
    applyFontSizeToSelection(sizeNum);
    requestAnimationFrame(updateToolbar);
  }, [restoreSelection, targetRef, updateToolbar]);

  /** Handle color change */
  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    restoreSelection();
    targetRef.current?.focus();
    document.execCommand('foreColor', false, newColor);
    requestAnimationFrame(updateToolbar);
  }, [restoreSelection, targetRef, updateToolbar]);

  if (!visible) return null;

  return createPortal(
    <div
      ref={toolbarRef}
      className="rich-text-toolbar"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => {
        // Prevent toolbar clicks from stealing focus/selection
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Bold */}
      <button
        className={`rt-btn ${isBold ? 'active' : ''}`}
        onClick={() => execFormat('bold')}
        title="Bold"
      >
        B
      </button>

      {/* Italic */}
      <button
        className={`rt-btn ${isItalic ? 'active' : ''}`}
        onClick={() => execFormat('italic')}
        title="Italic"
        style={{ fontStyle: 'italic' }}
      >
        I
      </button>

      {/* Underline */}
      <button
        className={`rt-btn ${isUnderline ? 'active' : ''}`}
        onClick={() => execFormat('underline')}
        title="Underline"
        style={{ textDecoration: 'underline' }}
      >
        U
      </button>

      {/* Strikethrough */}
      <button
        className={`rt-btn ${isStrike ? 'active' : ''}`}
        onClick={() => execFormat('strikeThrough')}
        title="Strikethrough"
        style={{ textDecoration: 'line-through' }}
      >
        S
      </button>

      <div className="rt-divider" />

      {/* Font Size */}
      <div className="rt-input-group">
        <input
          type="number"
          className="rt-size-input"
          value={fontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleFontSizeChange((e.target as HTMLInputElement).value);
            }
          }}
          title="Font Size (px)"
          min={1}
          max={200}
        />
        <label>px</label>
      </div>

      <div className="rt-divider" />

      {/* Text Color */}
      <div className="rt-input-group">
        <label>A</label>
        <div className="rt-color-swatch" style={{ backgroundColor: color }}>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            title="Text Color"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};
