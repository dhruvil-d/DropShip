// ============================================================
// useResponsiveNode — Hook for components to read responsive
// dimensions & selection state from the responsive store
// ============================================================

import { useCallback, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { useResponsiveStore } from '../shared/responsiveStore';
import { useDarkModeStore } from '../shared/darkModeStore';
import type { DimensionsMeta } from '../shared/responsiveStore';

export interface ResponsiveNodeResult {
  /** The Craft.js node ID */
  nodeId: string;
  /** Whether this node is currently selected */
  isSelected: boolean;
  /** Whether this node is hovered */
  isHovered: boolean;
  /** Whether this node should render in dark mode */
  isDark: boolean;
  /** The active breakpoint's dimension metadata (null if none set) */
  activeMeta: DimensionsMeta | null;
  /** Style overrides to spread onto the component's root element */
  responsiveStyles: React.CSSProperties;
  /** Ref callback that connects Craft.js connect + drag */
  connectRef: (ref: HTMLElement | null) => void;
  /** The Craft.js connect function */
  connect: (ref: HTMLElement) => HTMLElement;
  /** The Craft.js drag function */
  drag: (ref: HTMLElement) => HTMLElement;
}

export function useResponsiveNode(): ResponsiveNodeResult {
  const {
    id,
    connectors: { connect, drag },
    isSelected,
    isHovered,
    nodeProps,
  } = useNode((node) => ({
    isSelected: node.events.selected,
    isHovered: node.events.hovered,
    nodeProps: node.data.props as Record<string, any>,
  }));

  const { ancestors } = useEditor((_state, query) => {
    try {
      if (query && id && query.node(id)) {
        return { ancestors: query.node(id).ancestors() };
      }
    } catch {
      // fallback
    }
    return { ancestors: [] };
  });

  const activeMeta = useResponsiveStore((s) => {
    const meta = s.componentMeta[id];
    if (!meta) return null;
    return meta[s.activeBreakpoint];
  });

  const ensureComponentMeta = useResponsiveStore((s) => s.ensureComponentMeta);

  // Dark mode resolution with parent/ancestor inheritance
  const isDark = useDarkModeStore((s) => s.getResolvedMode(id, ancestors) === 'dark');

  // Ensure this component has metadata entries in the store
  useEffect(() => {
    ensureComponentMeta(id);
  }, [id, ensureComponentMeta]);

  // Build responsive style overrides
  const responsiveStyles: React.CSSProperties = {};

  // 1. Inject design props (from DesignControls)
  if (nodeProps) {
    const p = nodeProps;
    
    // Spacing
    if (p.marginTop !== undefined) responsiveStyles.marginTop = `${p.marginTop}px`;
    if (p.marginRight !== undefined) responsiveStyles.marginRight = `${p.marginRight}px`;
    if (p.marginBottom !== undefined) responsiveStyles.marginBottom = `${p.marginBottom}px`;
    if (p.marginLeft !== undefined) responsiveStyles.marginLeft = `${p.marginLeft}px`;
    if (p.paddingTop !== undefined) responsiveStyles.paddingTop = `${p.paddingTop}px`;
    if (p.paddingRight !== undefined) responsiveStyles.paddingRight = `${p.paddingRight}px`;
    if (p.paddingBottom !== undefined) responsiveStyles.paddingBottom = `${p.paddingBottom}px`;
    if (p.paddingLeft !== undefined) responsiveStyles.paddingLeft = `${p.paddingLeft}px`;

    // Flexbox
    if (p.display) responsiveStyles.display = p.display;
    if (p.flexDirection) responsiveStyles.flexDirection = p.flexDirection;
    if (p.justifyContent) responsiveStyles.justifyContent = p.justifyContent;
    if (p.alignItems) responsiveStyles.alignItems = p.alignItems;
    if (p.flexWrap) responsiveStyles.flexWrap = p.flexWrap;
    if (p.gap !== undefined) responsiveStyles.gap = `${p.gap}px`;

    // Typography
    if (p.fontFamily) responsiveStyles.fontFamily = p.fontFamily;
    if (p.fontSize !== undefined) responsiveStyles.fontSize = `${p.fontSize}px`;
    if (p.fontWeight) responsiveStyles.fontWeight = p.fontWeight;
    if (p.lineHeight !== undefined) responsiveStyles.lineHeight = p.lineHeight;
    if (p.letterSpacing !== undefined) responsiveStyles.letterSpacing = `${p.letterSpacing}px`;
    if (p.textTransform) responsiveStyles.textTransform = p.textTransform as any;
    if (p.textDecoration) responsiveStyles.textDecoration = p.textDecoration as any;
    if (p.textAlign) responsiveStyles.textAlign = p.textAlign as any;
    if (p.color) responsiveStyles.color = p.color;

    // Borders
    if (p.borderWidth !== undefined) responsiveStyles.borderWidth = `${p.borderWidth}px`;
    if (p.borderStyle) responsiveStyles.borderStyle = p.borderStyle;
    if (p.borderColor) responsiveStyles.borderColor = p.borderColor;
    
    if (p.borderLinked) {
      if (p.borderRadius !== undefined) responsiveStyles.borderRadius = `${p.borderRadius}px`;
    } else {
      if (p.borderRadiusTL !== undefined) responsiveStyles.borderTopLeftRadius = `${p.borderRadiusTL}px`;
      if (p.borderRadiusTR !== undefined) responsiveStyles.borderTopRightRadius = `${p.borderRadiusTR}px`;
      if (p.borderRadiusBL !== undefined) responsiveStyles.borderBottomLeftRadius = `${p.borderRadiusBL}px`;
      if (p.borderRadiusBR !== undefined) responsiveStyles.borderBottomRightRadius = `${p.borderRadiusBR}px`;
    }

    // Effects
    if (p.opacity !== undefined) responsiveStyles.opacity = p.opacity / 100;
    if (p.cursor) responsiveStyles.cursor = p.cursor;
    
    // Box Shadow
    if (p.boxShadowColor && p.boxShadowColor !== 'transparent') {
      responsiveStyles.boxShadow = `${p.boxShadowX || 0}px ${p.boxShadowY || 0}px ${p.boxShadowBlur || 0}px ${p.boxShadowSpread || 0}px ${p.boxShadowColor}`;
    }
  }

  // 2. Inject responsive breakpoint dimension overrides (from ResponsiveStore)
  if (activeMeta) {
    if (activeMeta.width && activeMeta.width !== 'auto') responsiveStyles.width = activeMeta.width;
    if (activeMeta.height && activeMeta.height !== 'auto') responsiveStyles.height = activeMeta.height;
    if (activeMeta.minWidth) responsiveStyles.minWidth = activeMeta.minWidth;
    if (activeMeta.maxWidth) responsiveStyles.maxWidth = activeMeta.maxWidth;
    if (activeMeta.minHeight) responsiveStyles.minHeight = activeMeta.minHeight;
    if (activeMeta.maxHeight) responsiveStyles.maxHeight = activeMeta.maxHeight;
  }

  // Combined ref callback
  const connectRef = useCallback(
    (ref: HTMLElement | null) => {
      if (ref) connect(drag(ref));
    },
    [connect, drag]
  );

  return {
    nodeId: id,
    isSelected,
    isHovered,
    isDark,
    activeMeta,
    responsiveStyles,
    connectRef,
    connect,
    drag,
  };
}
