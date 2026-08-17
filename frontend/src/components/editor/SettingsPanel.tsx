// ============================================================
// SettingsPanel — Overhauled 3-tab layout
// Tab 1: Properties (component-specific settings)
// Tab 2: Design (full CSS controls)
// Tab 3: Responsive (breakpoint switcher & dimension metadata)
// ============================================================

import { createElement, useState, useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { Settings2, Palette, MonitorSmartphone, MousePointerClick, Moon, Sun, ArrowDownUp } from 'lucide-react';
import { DesignControls } from './settings/DesignControls';
import { ResponsiveControls } from './settings/ResponsiveControls';
import { useDarkModeStore } from '../../shared/darkModeStore';
import type { DarkModeOverride } from '../../shared/darkModeStore';
import '../../styles/settings-animations.css';

type SettingsTab = 'properties' | 'design' | 'responsive';

const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: 'properties', label: 'Props', icon: <Settings2 className="w-4 h-4" /> },
  { key: 'design', label: 'Design', icon: <Palette className="w-4 h-4" /> },
  { key: 'responsive', label: 'Responsive', icon: <MonitorSmartphone className="w-4 h-4" /> },
];

// ------ Dark Mode Override Widget ------

const overrideOptions: { value: DarkModeOverride; label: string; icon: React.ReactNode }[] = [
  { value: 'inherit', label: 'Inherit', icon: <ArrowDownUp size={12} /> },
  { value: 'light', label: 'Light', icon: <Sun size={12} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={12} /> },
];

function DarkModeOverrideWidget({ nodeId }: { nodeId: string }) {
  const override = useDarkModeStore((s) => s.componentOverrides[nodeId] || 'inherit');
  const setOverride = useDarkModeStore((s) => s.setComponentOverride);
  const globalDarkMode = useDarkModeStore((s) => s.globalDarkMode);

  const resolvedLabel = override === 'inherit'
    ? (globalDarkMode ? 'Dark (global)' : 'Light (global)')
    : override === 'dark' ? 'Dark' : 'Light';

  return (
    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded flex items-center justify-center ${
          (override === 'dark' || (override === 'inherit' && globalDarkMode))
            ? 'bg-indigo-100 text-indigo-600'
            : 'bg-amber-100 text-amber-600'
        }`}>
          {(override === 'dark' || (override === 'inherit' && globalDarkMode))
            ? <Moon size={12} />
            : <Sun size={12} />
          }
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider leading-none">Theme</div>
          <div className="text-xs font-medium text-gray-700 leading-tight mt-0.5">{resolvedLabel}</div>
        </div>
      </div>
      <div className="flex bg-white rounded-md border border-gray-200 overflow-hidden shrink-0">
        {overrideOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setOverride(nodeId, opt.value)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all ${
              override === opt.value
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            title={opt.label}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const SettingsPanel = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId = Array.from(state.events.selected)[0];
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable()
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled
    };
  });

  const [activeTab, setActiveTab] = useState<SettingsTab>('properties');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update indicator position when tab changes
  useEffect(() => {
    const idx = tabs.findIndex((t) => t.key === activeTab);
    const btn = tabRefs.current[idx];
    const container = tabsRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setIndicatorStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [activeTab]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col" style={{ minWidth: 320 }}>
      {/* ===== Header ===== */}
      <div className="px-4 pt-3 pb-0 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">
            Properties
          </h3>
          {selected && (
            <span className="text-[10px] text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
              {selected.id === 'ROOT' ? 'root' : selected.id}
            </span>
          )}
        </div>

        {/* Component name */}
        {selected && (
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-800">{selected.name}</span>
          </div>
        )}

        {/* ===== Tabs ===== */}
        <div className="settings-tabs w-full" ref={tabsRef}>
          <div className="flex w-full">
            {tabs.map((tab, i) => (
              <button
                key={tab.key}
                ref={(el) => { tabRefs.current[i] = el; }}
                className={`settings-tab-btn flex-1 text-center ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div
            className="settings-tab-indicator"
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </div>
      </div>

      {/* ===== Tab Content ===== */}
      <div className="flex-1 overflow-y-auto">
        <div className="settings-tab-content p-4" key={activeTab}>
          {activeTab === 'properties' && (
            <>
              {selected ? (
                <div className="flex flex-col gap-4">
                  {/* Dark Mode Override */}
                  <DarkModeOverrideWidget nodeId={selected.id} />

                  <div data-cy="settings-panel">
                    {selected.settings ? createElement(selected.settings) : (
                      <div className="text-sm text-gray-500 italic">No settings available for this component.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <MousePointerClick className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm">Select a component to edit</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'design' && <DesignControls />}

          {activeTab === 'responsive' && <ResponsiveControls />}
        </div>
      </div>

      {/* ===== Delete Button (always at bottom) ===== */}
      {selected?.isDeletable && (
        <div className="p-4 border-t border-gray-100">
          <button
            className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors text-sm font-medium"
            onClick={() => {
              actions.delete(selected.id);
            }}
          >
            Delete Component
          </button>
        </div>
      )}
    </div>
  );
};
