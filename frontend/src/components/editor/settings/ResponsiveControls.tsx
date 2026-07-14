// ============================================================
// ResponsiveControls — Breakpoint switcher & per-component
// responsive dimension metadata editor
// ============================================================

import { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { useResponsiveStore } from '../../../shared/responsiveStore';
import type { Breakpoint, DimensionsMeta } from '../../../shared/responsiveStore';

// ------ Dimension Field ------

function DimensionField({
  label,
  value,
  onChange,
  hasDiff,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hasDiff?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <span className="settings-section-label" style={{ marginBottom: 2 }}>
          {label}
        </span>
        {hasDiff && <span className="meta-diff-dot" title="Differs across breakpoints" />}
      </div>
      <input
        className="settings-input settings-input-sm"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="auto"
      />
    </div>
  );
}

// ------ Main Component ------

export const ResponsiveControls = () => {
  const activeBreakpoint = useResponsiveStore((s) => s.activeBreakpoint);
  const breakpoints = useResponsiveStore((s) => s.breakpoints);
  const setBreakpoint = useResponsiveStore((s) => s.setBreakpoint);
  const updateBreakpointWidth = useResponsiveStore((s) => s.updateBreakpointWidth);
  const componentMeta = useResponsiveStore((s) => s.componentMeta);
  const updateComponentMeta = useResponsiveStore((s) => s.updateComponentMeta);

  const [editingWidth, setEditingWidth] = useState<Breakpoint | null>(null);
  const [editWidthValue, setEditWidthValue] = useState<string>('');

  // Get selected node
  const { selected } = useEditor((state) => {
    const nodeId = Array.from(state.events.selected)[0];
    return { selected: nodeId || null };
  });

  const bpOrder: Breakpoint[] = ['mobile', 'tablet', 'desktop'];

  // Get current component's meta for all breakpoints
  const currentMeta = selected ? componentMeta[selected] : null;
  const activeMeta: DimensionsMeta = currentMeta
    ? currentMeta[activeBreakpoint]
    : { width: 'auto', height: 'auto' };

  // Check if a dimension differs across breakpoints
  const hasDiff = (field: keyof DimensionsMeta): boolean => {
    if (!currentMeta) return false;
    const values = bpOrder.map((bp) => currentMeta[bp]?.[field] || 'auto');
    return new Set(values).size > 1;
  };

  const handleDimensionChange = (field: keyof DimensionsMeta, value: string) => {
    if (!selected) return;
    updateComponentMeta(selected, activeBreakpoint, { [field]: value });
  };

  const handleWidthEdit = (bp: Breakpoint) => {
    setEditingWidth(bp);
    setEditWidthValue(String(breakpoints[bp].width));
  };

  const handleWidthSave = () => {
    if (editingWidth) {
      const num = parseInt(editWidthValue, 10);
      if (!isNaN(num) && num > 0) {
        updateBreakpointWidth(editingWidth, num);
      }
      setEditingWidth(null);
    }
  };

  // Calculate width bar proportional width
  const maxBpWidth = Math.max(...bpOrder.map((bp) => breakpoints[bp].width));

  return (
    <div className="flex flex-col gap-5">
      {/* ===== Breakpoint Switcher ===== */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Viewport
        </h4>

        <div className="flex gap-2 justify-center">
          {bpOrder.map((bp) => (
            <button
              key={bp}
              className={`breakpoint-btn ${activeBreakpoint === bp ? 'active' : ''}`}
              onClick={() => setBreakpoint(bp)}
            >
              <span className="bp-label">{breakpoints[bp].label}</span>
              {editingWidth === bp ? (
                <input
                  className="settings-input settings-input-sm"
                  style={{ width: 48, textAlign: 'center', fontSize: 10 }}
                  value={editWidthValue}
                  onChange={(e) => setEditWidthValue(e.target.value)}
                  onBlur={handleWidthSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleWidthSave()}
                  autoFocus
                />
              ) : (
                <span
                  className="bp-width cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWidthEdit(bp);
                  }}
                >
                  {breakpoints[bp].width}px
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Width indicator bar */}
        <div className="mt-3 bg-gray-100 rounded-full overflow-hidden h-1">
          <div
            className="breakpoint-width-bar"
            style={{ width: `${(breakpoints[activeBreakpoint].width / maxBpWidth) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">0px</span>
          <span className="text-[10px] text-blue-500 font-semibold font-mono">
            {breakpoints[activeBreakpoint].width}px
          </span>
          <span className="text-[10px] text-gray-400">{maxBpWidth}px</span>
        </div>
      </div>

      {/* ===== Component Dimension Metadata ===== */}
      {selected ? (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Component Dimensions
            <span className="ml-2 text-[10px] font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
              {breakpoints[activeBreakpoint].label}
            </span>
          </h4>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <DimensionField
              label="Width"
              value={activeMeta.width}
              onChange={(v) => handleDimensionChange('width', v)}
              hasDiff={hasDiff('width')}
            />
            <DimensionField
              label="Height"
              value={activeMeta.height}
              onChange={(v) => handleDimensionChange('height', v)}
              hasDiff={hasDiff('height')}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <DimensionField
              label="Min Width"
              value={activeMeta.minWidth || ''}
              onChange={(v) => handleDimensionChange('minWidth', v)}
              hasDiff={hasDiff('minWidth')}
            />
            <DimensionField
              label="Max Width"
              value={activeMeta.maxWidth || ''}
              onChange={(v) => handleDimensionChange('maxWidth', v)}
              hasDiff={hasDiff('maxWidth')}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DimensionField
              label="Min Height"
              value={activeMeta.minHeight || ''}
              onChange={(v) => handleDimensionChange('minHeight', v)}
              hasDiff={hasDiff('minHeight')}
            />
            <DimensionField
              label="Max Height"
              value={activeMeta.maxHeight || ''}
              onChange={(v) => handleDimensionChange('maxHeight', v)}
              hasDiff={hasDiff('maxHeight')}
            />
          </div>

          {/* Breakpoint comparison mini-table */}
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              All Breakpoints
            </h4>
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1.5 text-left text-gray-500 font-medium">BP</th>
                    <th className="px-2 py-1.5 text-left text-gray-500 font-medium">W</th>
                    <th className="px-2 py-1.5 text-left text-gray-500 font-medium">H</th>
                  </tr>
                </thead>
                <tbody>
                  {bpOrder.map((bp) => {
                    const m = currentMeta?.[bp];
                    const isActive = bp === activeBreakpoint;
                    return (
                      <tr
                        key={bp}
                        className={`border-t border-gray-50 ${isActive ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="px-2 py-1.5">
                          <span className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                            {breakpoints[bp].label}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 font-mono text-gray-500">
                          {m?.width || 'auto'}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-gray-500">
                          {m?.height || 'auto'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-gray-400 py-4">
          Select a component to view its responsive dimensions
        </div>
      )}

      {/* ===== Viewport Info ===== */}
      <div className="border-t border-gray-100 pt-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Canvas Info
        </h4>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-[10px] text-gray-500">
            <span className="font-medium">Width:</span>
            <span className="font-mono text-gray-700">{breakpoints[activeBreakpoint].width}px</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-[10px] text-gray-500">
            <span className="font-medium">Mode:</span>
            <span className="font-mono text-gray-700">{breakpoints[activeBreakpoint].label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
