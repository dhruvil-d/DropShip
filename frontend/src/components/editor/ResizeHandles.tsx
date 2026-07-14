// ============================================================
// ResizeHandles — 8-point drag-to-resize overlay for components
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useResponsiveStore } from '../../shared/responsiveStore';

interface ResizeHandlesProps {
  nodeId: string;
  /** Ref to the actual component DOM element we are resizing */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Callback when resize dragging starts */
  onResizeStart?: () => void;
  /** Callback to update Craft.js node props after resize */
  onResize?: (width: number, height: number, startWidth: number, startHeight: number) => void;
}

type HandleDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

interface DragState {
  active: boolean;
  direction: HandleDirection;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
  currentWidth: number;
  currentHeight: number;
}

const SNAP_SIZE = 8;

function snapToGrid(value: number): number {
  return Math.round(value / SNAP_SIZE) * SNAP_SIZE;
}

export const ResizeHandles = ({ nodeId, targetRef, onResizeStart, onResize }: ResizeHandlesProps) => {
  const syncMeta = useResponsiveStore((s) => s.syncMetaFromResize);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);

  const handleMouseDown = useCallback(
    (direction: HandleDirection) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = targetRef.current;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      
      onResizeStart?.();

      setDragState({
        active: true,
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        startLeft: rect.left,
        startTop: rect.top,
        currentWidth: rect.width,
        currentHeight: rect.height,
      });
    },
    [targetRef, onResizeStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState?.active || !targetRef.current) return;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        const dir = dragState.direction;

        let newWidth = dragState.startWidth;
        let newHeight = dragState.startHeight;

        // Horizontal resize
        if (dir.includes('e')) newWidth = snapToGrid(dragState.startWidth + dx);
        if (dir.includes('w')) newWidth = snapToGrid(dragState.startWidth - dx);

        // Vertical resize
        if (dir.includes('s')) newHeight = snapToGrid(dragState.startHeight + dy);
        if (dir.includes('n')) newHeight = snapToGrid(dragState.startHeight - dy);

        // Minimum dimensions
        newWidth = Math.max(24, newWidth);
        newHeight = Math.max(16, newHeight);

        // Apply directly to DOM for smooth 60fps
        const target = targetRef.current;
        if (target) {
          target.style.width = `${newWidth}px`;
          target.style.height = `${newHeight}px`;
          target.style.transition = 'none';
        }

        // Call onResize in real-time
        if (onResize && dragState) {
          onResize(newWidth, newHeight, dragState.startWidth, dragState.startHeight);
        }

        setDragState((prev) =>
          prev ? { ...prev, currentWidth: newWidth, currentHeight: newHeight } : null
        );
        setTooltipPos({ x: e.clientX + 14, y: e.clientY + 14 });
      });
    },
    [dragState, targetRef, onResize]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragState?.active) return;

    cancelAnimationFrame(rafRef.current);

    // Restore transitions
    const target = targetRef.current;
    if (target) {
      target.style.transition = '';
    }

    // Sync to responsive store
    syncMeta(nodeId, dragState.currentWidth, dragState.currentHeight);
    onResize?.(dragState.currentWidth, dragState.currentHeight, dragState.startWidth, dragState.startHeight);

    setDragState(null);
    setTooltipPos(null);
  }, [dragState, nodeId, syncMeta, onResize, targetRef]);

  // Attach global listeners during drag
  useEffect(() => {
    if (dragState?.active) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = getCursor(dragState.direction);
      document.body.style.userSelect = 'none';

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [dragState?.active, handleMouseMove, handleMouseUp, dragState?.direction]);

  const isResizing = dragState?.active ?? false;

  return (
    <>
      <div className={`resize-handle-wrapper ${isResizing ? 'resizing' : ''}`}>
        {/* Edge handles */}
        <div
          className="resize-handle resize-handle-edge resize-handle-n"
          onMouseDown={handleMouseDown('n')}
        />
        <div
          className="resize-handle resize-handle-edge resize-handle-s"
          onMouseDown={handleMouseDown('s')}
        />
        <div
          className="resize-handle resize-handle-edge resize-handle-e"
          onMouseDown={handleMouseDown('e')}
        />
        <div
          className="resize-handle resize-handle-edge resize-handle-w"
          onMouseDown={handleMouseDown('w')}
        />

        {/* Corner handles */}
        <div
          className="resize-handle resize-handle-corner resize-handle-nw"
          onMouseDown={handleMouseDown('nw')}
        />
        <div
          className="resize-handle resize-handle-corner resize-handle-ne"
          onMouseDown={handleMouseDown('ne')}
        />
        <div
          className="resize-handle resize-handle-corner resize-handle-sw"
          onMouseDown={handleMouseDown('sw')}
        />
        <div
          className="resize-handle resize-handle-corner resize-handle-se"
          onMouseDown={handleMouseDown('se')}
        />
      </div>

      {/* Dimension tooltip */}
      {isResizing && tooltipPos && dragState && (
        <div
          className="resize-dimension-tooltip"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          {Math.round(dragState.currentWidth)} × {Math.round(dragState.currentHeight)}
        </div>
      )}
    </>
  );
};

function getCursor(dir: HandleDirection): string {
  const map: Record<HandleDirection, string> = {
    n: 'n-resize',
    s: 's-resize',
    e: 'e-resize',
    w: 'w-resize',
    nw: 'nw-resize',
    ne: 'ne-resize',
    sw: 'sw-resize',
    se: 'se-resize',
  };
  return map[dir] || 'default';
}
