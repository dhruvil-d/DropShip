// ============================================================
// Responsive Store — Zustand-based state for breakpoints
// & per-component responsive dimension metadata
// ============================================================

import { create } from 'zustand';

// ------ Types ------

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointConfig {
  label: string;
  width: number;
}

export interface DimensionsMeta {
  width: string;   // e.g. '100%', '300px', 'auto'
  height: string;  // e.g. 'auto', '200px'
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
}

export interface ComponentResponsiveMeta {
  mobile: DimensionsMeta;
  tablet: DimensionsMeta;
  desktop: DimensionsMeta;
}

interface ResponsiveState {
  activeBreakpoint: Breakpoint;
  isResizing: boolean;
  breakpoints: Record<Breakpoint, BreakpointConfig>;
  componentMeta: Record<string, ComponentResponsiveMeta>;

  // Actions
  setBreakpoint: (bp: Breakpoint) => void;
  setIsResizing: (isResizing: boolean) => void;
  updateBreakpointWidth: (bp: Breakpoint, width: number) => void;
  updateComponentMeta: (nodeId: string, bp: Breakpoint, meta: Partial<DimensionsMeta>) => void;
  getActiveMeta: (nodeId: string) => DimensionsMeta | null;
  syncMetaFromResize: (nodeId: string, width: number, height: number) => void;
  ensureComponentMeta: (nodeId: string) => void;
  removeComponentMeta: (nodeId: string) => void;
}

// ------ Default dimension metadata ------

const defaultDimensionsMeta: DimensionsMeta = {
  width: 'auto',
  height: 'auto',
  minWidth: undefined,
  maxWidth: undefined,
  minHeight: undefined,
  maxHeight: undefined,
};

// ------ Store ------

export const useResponsiveStore = create<ResponsiveState>((set, get) => ({
  activeBreakpoint: 'desktop',
  isResizing: false,

  breakpoints: {
    mobile: { label: 'Mobile', width: 375 },
    tablet: { label: 'Tablet', width: 768 },
    desktop: { label: 'Desktop', width: 1024 },
  },

  componentMeta: {},

  setBreakpoint: (bp) => set({ activeBreakpoint: bp }),
  setIsResizing: (isResizing) => set({ isResizing }),

  updateBreakpointWidth: (bp, width) =>
    set((state) => ({
      breakpoints: {
        ...state.breakpoints,
        [bp]: { ...state.breakpoints[bp], width },
      },
    })),

  updateComponentMeta: (nodeId, bp, meta) =>
    set((state) => {
      const existing = state.componentMeta[nodeId] || {
        mobile: { ...defaultDimensionsMeta },
        tablet: { ...defaultDimensionsMeta },
        desktop: { ...defaultDimensionsMeta },
      };

      return {
        componentMeta: {
          ...state.componentMeta,
          [nodeId]: {
            ...existing,
            [bp]: { ...existing[bp], ...meta },
          },
        },
      };
    }),

  getActiveMeta: (nodeId) => {
    const state = get();
    const meta = state.componentMeta[nodeId];
    if (!meta) return null;
    return meta[state.activeBreakpoint];
  },

  syncMetaFromResize: (nodeId, width, height) => {
    const state = get();
    const bp = state.activeBreakpoint;

    // Ensure the component has metadata
    const existing = state.componentMeta[nodeId] || {
      mobile: { ...defaultDimensionsMeta },
      tablet: { ...defaultDimensionsMeta },
      desktop: { ...defaultDimensionsMeta },
    };

    set({
      componentMeta: {
        ...state.componentMeta,
        [nodeId]: {
          ...existing,
          [bp]: {
            ...existing[bp],
            width: `${Math.round(width)}px`,
            height: `${Math.round(height)}px`,
          },
        },
      },
    });
  },

  ensureComponentMeta: (nodeId) => {
    const state = get();
    if (state.componentMeta[nodeId]) return;

    set({
      componentMeta: {
        ...state.componentMeta,
        [nodeId]: {
          mobile: { ...defaultDimensionsMeta },
          tablet: { ...defaultDimensionsMeta },
          desktop: { ...defaultDimensionsMeta },
        },
      },
    });
  },

  removeComponentMeta: (nodeId) =>
    set((state) => {
      const next = { ...state.componentMeta };
      delete next[nodeId];
      return { componentMeta: next };
    }),
}));
