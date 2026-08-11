// ============================================================
// Dark Mode Store — Zustand-based state for global & per-component
// dark mode management
// ============================================================

import { create } from 'zustand';

// ------ Types ------

export type DarkModeOverride = 'inherit' | 'light' | 'dark';

interface DarkModeState {
  /** Global project-level dark mode toggle */
  globalDarkMode: boolean;
  /** Per-component overrides: nodeId → 'inherit' | 'light' | 'dark' */
  componentOverrides: Record<string, DarkModeOverride>;

  // Actions
  setGlobalDarkMode: (enabled: boolean) => void;
  toggleGlobalDarkMode: () => void;
  setComponentOverride: (nodeId: string, override: DarkModeOverride) => void;
  removeComponentOverride: (nodeId: string) => void;

  /** Resolve the effective mode for a given component */
  getResolvedMode: (nodeId: string) => 'light' | 'dark';
}

// ------ Store ------

export const useDarkModeStore = create<DarkModeState>((set, get) => ({
  globalDarkMode: false,
  componentOverrides: {},

  setGlobalDarkMode: (enabled) => set({ globalDarkMode: enabled }),

  toggleGlobalDarkMode: () =>
    set((state) => ({ globalDarkMode: !state.globalDarkMode })),

  setComponentOverride: (nodeId, override) =>
    set((state) => ({
      componentOverrides: {
        ...state.componentOverrides,
        [nodeId]: override,
      },
    })),

  removeComponentOverride: (nodeId) =>
    set((state) => {
      const next = { ...state.componentOverrides };
      delete next[nodeId];
      return { componentOverrides: next };
    }),

  getResolvedMode: (nodeId) => {
    const state = get();
    const override = state.componentOverrides[nodeId];

    if (override === 'light') return 'light';
    if (override === 'dark') return 'dark';

    // 'inherit' or no override → follow global
    return state.globalDarkMode ? 'dark' : 'light';
  },
}));
