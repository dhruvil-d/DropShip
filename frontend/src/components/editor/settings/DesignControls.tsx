// ============================================================
// DesignControls — Full CSS control sections for the SettingsPanel
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Link, Unlink } from 'lucide-react';

// ------ Accordion Section ------

function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>(defaultOpen ? 'none' : '0');

  useEffect(() => {
    if (isOpen && bodyRef.current) {
      setMaxHeight(`${bodyRef.current.scrollHeight + 20}px`);
    } else {
      setMaxHeight('0');
    }
  }, [isOpen, children]);

  return (
    <div className="settings-accordion">
      <button
        className="settings-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <svg
          className={`settings-accordion-chevron ${isOpen ? 'open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        ref={bodyRef}
        className={`settings-accordion-body ${isOpen ? 'expanded' : 'collapsed'}`}
        style={{ maxHeight: isOpen ? maxHeight : '0' }}
      >
        {children}
      </div>
    </div>
  );
}

// ------ Helpers ------

function NumberInput({
  value,
  onChange,
  unit,
  min,
  max,
  step,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}) {
  return (
    <div>
      {label && <span className="settings-section-label">{label}</span>}
      <div className="settings-number-group">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step ?? 1}
          className="settings-input settings-input-sm"
        />
        {unit && <span className="unit-label">{unit}</span>}
      </div>
    </div>
  );
}

function ColorInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <div>
      {label && <span className="settings-section-label">{label}</span>}
      <div className="settings-color-group">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="settings-color-swatch"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="settings-input settings-input-sm settings-color-hex"
          style={{ width: '80px', fontFamily: "'SF Mono', 'Fira Code', monospace" }}
        />
      </div>
    </div>
  );
}

function ToggleGroup({
  options,
  value,
  onChange,
  label,
}: {
  options: { label: string; value: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <div>
      {label && <span className="settings-section-label">{label}</span>}
      <div className="settings-toggle-group">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`settings-toggle-btn ${value === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
            title={opt.label}
          >
            {opt.icon || opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  label?: string;
}) {
  return (
    <div>
      {label && <span className="settings-section-label">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="settings-input settings-input-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ------ Box Model Visual ------

function BoxModelEditor({
  marginTop, marginRight, marginBottom, marginLeft,
  paddingTop, paddingRight, paddingBottom, paddingLeft,
  onMarginChange,
  onPaddingChange,
}: {
  marginTop: number; marginRight: number; marginBottom: number; marginLeft: number;
  paddingTop: number; paddingRight: number; paddingBottom: number; paddingLeft: number;
  onMarginChange: (side: string, val: number) => void;
  onPaddingChange: (side: string, val: number) => void;
}) {
  return (
    <div className="box-model-visual">
      <div className="box-model-layer box-model-margin">
        <span className="box-model-label" style={{ top: 2, left: 4, color: '#d97706' }}>
          margin
        </span>

        {/* Margin inputs */}
        <input
          className="box-model-input"
          style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}
          value={marginTop}
          onChange={(e) => onMarginChange('top', Number(e.target.value))}
          type="number"
        />
        <input
          className="box-model-input"
          style={{ right: 0, top: '50%', transform: 'translateY(-50%)' }}
          value={marginRight}
          onChange={(e) => onMarginChange('right', Number(e.target.value))}
          type="number"
        />
        <input
          className="box-model-input"
          style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)' }}
          value={marginBottom}
          onChange={(e) => onMarginChange('bottom', Number(e.target.value))}
          type="number"
        />
        <input
          className="box-model-input"
          style={{ left: 0, top: '50%', transform: 'translateY(-50%)' }}
          value={marginLeft}
          onChange={(e) => onMarginChange('left', Number(e.target.value))}
          type="number"
        />

        <div className="box-model-layer box-model-padding">
          <span className="box-model-label" style={{ top: 2, left: 4, color: '#059669' }}>
            padding
          </span>

          {/* Padding inputs */}
          <input
            className="box-model-input"
            style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}
            value={paddingTop}
            onChange={(e) => onPaddingChange('top', Number(e.target.value))}
            type="number"
          />
          <input
            className="box-model-input"
            style={{ right: 0, top: '50%', transform: 'translateY(-50%)' }}
            value={paddingRight}
            onChange={(e) => onPaddingChange('right', Number(e.target.value))}
            type="number"
          />
          <input
            className="box-model-input"
            style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)' }}
            value={paddingBottom}
            onChange={(e) => onPaddingChange('bottom', Number(e.target.value))}
            type="number"
          />
          <input
            className="box-model-input"
            style={{ left: 0, top: '50%', transform: 'translateY(-50%)' }}
            value={paddingLeft}
            onChange={(e) => onPaddingChange('left', Number(e.target.value))}
            type="number"
          />

          <div className="box-model-content">content</div>
        </div>
      </div>
    </div>
  );
}

// ------ Main Component ------

export const DesignControls = () => {
  const { actions, selected } = useEditor((state) => {
    const nodeId = Array.from(state.events.selected)[0];
    if (!nodeId) return { selected: null };

    return {
      selected: {
        id: nodeId,
        props: state.nodes[nodeId].data.props as Record<string, any>,
      },
    };
  });

  // Local design state — acts as override layer
  const [designState, setDesignState] = useState<Record<string, any>>({});

  // Reset when selection changes
  useEffect(() => {
    if (selected?.id) {
      // Initialize from existing props
      const p = selected.props || {};
      setDesignState({
        // Spacing
        marginTop: p.marginTop ?? p.margin ?? 0,
        marginRight: p.marginRight ?? p.margin ?? 0,
        marginBottom: p.marginBottom ?? p.margin ?? 0,
        marginLeft: p.marginLeft ?? p.margin ?? 0,
        paddingTop: p.paddingTop ?? p.padding ?? 0,
        paddingRight: p.paddingRight ?? p.padding ?? 0,
        paddingBottom: p.paddingBottom ?? p.padding ?? 0,
        paddingLeft: p.paddingLeft ?? p.padding ?? 0,

        // Size
        width: p.width ?? 'auto',
        height: p.height ?? 'auto',
        minWidth: p.minWidth ?? '',
        maxWidth: p.maxWidth ?? '',
        minHeight: p.minHeight ?? p.minHeight ?? '',
        maxHeight: p.maxHeight ?? '',
        overflow: p.overflow ?? 'visible',

        // Flexbox
        display: p.display ?? 'flex',
        flexDirection: p.flexDirection ?? 'column',
        justifyContent: p.justifyContent ?? 'flex-start',
        alignItems: p.alignItems ?? 'stretch',
        flexWrap: p.flexWrap ?? 'nowrap',
        gap: p.gap ?? 0,
        rowGap: p.rowGap ?? p.gap ?? 0,
        columnGap: p.columnGap ?? p.gap ?? 0,

        // Typography
        fontFamily: p.fontFamily ?? 'Inter',
        fontSize: p.fontSize ?? 16,
        fontWeight: p.fontWeight ?? '400',
        lineHeight: p.lineHeight ?? 1.5,
        letterSpacing: p.letterSpacing ?? 0,
        textTransform: p.textTransform ?? 'none',
        textDecoration: p.textDecoration ?? 'none',
        textAlign: p.textAlign ?? 'left',
        color: p.color ?? '#1f2937',

        // Border
        borderWidth: p.borderWidth ?? 0,
        borderStyle: p.borderStyle ?? 'solid',
        borderColor: p.borderColor ?? '#e5e7eb',
        borderRadius: p.borderRadius ?? 0,
        borderRadiusTL: p.borderRadiusTL ?? p.borderRadius ?? 0,
        borderRadiusTR: p.borderRadiusTR ?? p.borderRadius ?? 0,
        borderRadiusBL: p.borderRadiusBL ?? p.borderRadius ?? 0,
        borderRadiusBR: p.borderRadiusBR ?? p.borderRadius ?? 0,
        borderLinked: true,

        // Effects
        opacity: p.opacity ?? 100,
        boxShadowX: p.boxShadowX ?? 0,
        boxShadowY: p.boxShadowY ?? 2,
        boxShadowBlur: p.boxShadowBlur ?? 4,
        boxShadowSpread: p.boxShadowSpread ?? 0,
        boxShadowColor: p.boxShadowColor ?? 'rgba(0,0,0,0.1)',
        cursor: p.cursor ?? 'default',
      });
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!selected) {
    return (
      <div className="text-center text-sm text-gray-400 py-8">
        Select a component to edit its design properties
      </div>
    );
  }

  const update = (key: string, value: any) => {
    setDesignState((prev) => ({ ...prev, [key]: value }));
    // Also push to Craft.js node
    actions.setProp(selected.id, (p: Record<string, any>) => {
      p[key] = value;
    });
  };

  const updateMulti = (updates: Record<string, any>) => {
    setDesignState((prev) => ({ ...prev, ...updates }));
    actions.setProp(selected.id, (p: Record<string, any>) => {
      for (const [key, val] of Object.entries(updates)) {
        p[key] = val;
      }
    });
  };

  return (
    <div className="flex flex-col gap-0">
      {/* ===== Spacing (Box Model) ===== */}
      <AccordionSection title="Spacing" defaultOpen>
        <BoxModelEditor
          marginTop={designState.marginTop}
          marginRight={designState.marginRight}
          marginBottom={designState.marginBottom}
          marginLeft={designState.marginLeft}
          paddingTop={designState.paddingTop}
          paddingRight={designState.paddingRight}
          paddingBottom={designState.paddingBottom}
          paddingLeft={designState.paddingLeft}
          onMarginChange={(side, val) => update(`margin${side.charAt(0).toUpperCase() + side.slice(1)}`, val)}
          onPaddingChange={(side, val) => update(`padding${side.charAt(0).toUpperCase() + side.slice(1)}`, val)}
        />
      </AccordionSection>

      {/* ===== Size & Dimensions ===== */}
      <AccordionSection title="Size">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <span className="settings-section-label">Width</span>
            <input
              className="settings-input settings-input-sm"
              value={designState.width}
              onChange={(e) => update('width', e.target.value)}
              placeholder="auto"
            />
          </div>
          <div>
            <span className="settings-section-label">Height</span>
            <input
              className="settings-input settings-input-sm"
              value={designState.height}
              onChange={(e) => update('height', e.target.value)}
              placeholder="auto"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <span className="settings-section-label">Min W</span>
            <input
              className="settings-input settings-input-sm"
              value={designState.minWidth}
              onChange={(e) => update('minWidth', e.target.value)}
              placeholder="—"
            />
          </div>
          <div>
            <span className="settings-section-label">Max W</span>
            <input
              className="settings-input settings-input-sm"
              value={designState.maxWidth}
              onChange={(e) => update('maxWidth', e.target.value)}
              placeholder="—"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <span className="settings-section-label">Min H</span>
            <input
              className="settings-input settings-input-sm"
              value={designState.minHeight}
              onChange={(e) => update('minHeight', e.target.value)}
              placeholder="—"
            />
          </div>
          <div>
            <span className="settings-section-label">Max H</span>
            <input
              className="settings-input settings-input-sm"
              value={designState.maxHeight}
              onChange={(e) => update('maxHeight', e.target.value)}
              placeholder="—"
            />
          </div>
        </div>
        <SelectInput
          label="Overflow"
          value={designState.overflow}
          onChange={(v) => update('overflow', v)}
          options={[
            { label: 'Visible', value: 'visible' },
            { label: 'Hidden', value: 'hidden' },
            { label: 'Scroll', value: 'scroll' },
            { label: 'Auto', value: 'auto' },
          ]}
        />
      </AccordionSection>

      {/* ===== Flexbox / Layout ===== */}
      <AccordionSection title="Layout">
        <div className="flex flex-col gap-3">
          <SelectInput
            label="Display"
            value={designState.display}
            onChange={(v) => update('display', v)}
            options={[
              { label: 'Flex', value: 'flex' },
              { label: 'Block', value: 'block' },
              { label: 'Inline', value: 'inline' },
              { label: 'Inline Flex', value: 'inline-flex' },
              { label: 'Grid', value: 'grid' },
              { label: 'None', value: 'none' },
            ]}
          />

          <ToggleGroup
            label="Direction"
            options={[
              { label: 'Row', value: 'row' },
              { label: 'Row Rev', value: 'row-reverse' },
              { label: 'Col', value: 'column' },
              { label: 'Col Rev', value: 'column-reverse' },
            ]}
            value={designState.flexDirection}
            onChange={(v) => update('flexDirection', v)}
          />

          <ToggleGroup
            label="Justify Content"
            options={[
              { label: 'Start', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'flex-end' },
              { label: 'Between', value: 'space-between' },
              { label: 'Around', value: 'space-around' },
            ]}
            value={designState.justifyContent}
            onChange={(v) => update('justifyContent', v)}
          />

          <ToggleGroup
            label="Align Items"
            options={[
              { label: 'Start', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'flex-end' },
              { label: 'Stretch', value: 'stretch' },
            ]}
            value={designState.alignItems}
            onChange={(v) => update('alignItems', v)}
          />

          <ToggleGroup
            label="Flex Wrap"
            options={[
              { label: 'No Wrap', value: 'nowrap' },
              { label: 'Wrap', value: 'wrap' },
              { label: 'Reverse', value: 'wrap-reverse' },
            ]}
            value={designState.flexWrap}
            onChange={(v) => update('flexWrap', v)}
          />

          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Row Gap"
              value={designState.rowGap}
              onChange={(v) => updateMulti({ rowGap: v, gap: v })}
              unit="px"
              min={0}
            />
            <NumberInput
              label="Col Gap"
              value={designState.columnGap}
              onChange={(v) => update('columnGap', v)}
              unit="px"
              min={0}
            />
          </div>
        </div>
      </AccordionSection>

      {/* ===== Typography ===== */}
      <AccordionSection title="Typography">
        <div className="flex flex-col gap-3">
          <SelectInput
            label="Font Family"
            value={designState.fontFamily}
            onChange={(v) => update('fontFamily', v)}
            options={[
              { label: 'Inter', value: 'Inter' },
              { label: 'Roboto', value: 'Roboto' },
              { label: 'Open Sans', value: 'Open Sans' },
              { label: 'Lato', value: 'Lato' },
              { label: 'Montserrat', value: 'Montserrat' },
              { label: 'Poppins', value: 'Poppins' },
              { label: 'System UI', value: 'system-ui' },
              { label: 'Serif', value: 'Georgia, serif' },
              { label: 'Monospace', value: "'SF Mono', monospace" },
            ]}
          />

          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Font Size"
              value={designState.fontSize}
              onChange={(v) => update('fontSize', v)}
              unit="px"
              min={1}
            />
            <NumberInput
              label="Line Height"
              value={designState.lineHeight}
              onChange={(v) => update('lineHeight', v)}
              step={0.1}
              min={0.5}
              max={5}
            />
          </div>

          <SelectInput
            label="Font Weight"
            value={designState.fontWeight}
            onChange={(v) => update('fontWeight', v)}
            options={[
              { label: 'Thin (100)', value: '100' },
              { label: 'Light (300)', value: '300' },
              { label: 'Normal (400)', value: '400' },
              { label: 'Medium (500)', value: '500' },
              { label: 'Semi Bold (600)', value: '600' },
              { label: 'Bold (700)', value: '700' },
              { label: 'Extra Bold (800)', value: '800' },
              { label: 'Black (900)', value: '900' },
            ]}
          />

          <NumberInput
            label="Letter Spacing"
            value={designState.letterSpacing}
            onChange={(v) => update('letterSpacing', v)}
            unit="px"
            step={0.5}
          />

          <ToggleGroup
            label="Text Align"
            options={[
              { label: 'Left', value: 'left', icon: <AlignLeft className="w-4 h-4" /> },
              { label: 'Center', value: 'center', icon: <AlignCenter className="w-4 h-4" /> },
              { label: 'Right', value: 'right', icon: <AlignRight className="w-4 h-4" /> },
              { label: 'Justify', value: 'justify', icon: <AlignJustify className="w-4 h-4" /> },
            ]}
            value={designState.textAlign}
            onChange={(v) => update('textAlign', v)}
          />

          <ToggleGroup
            label="Transform"
            options={[
              { label: 'None', value: 'none' },
              { label: 'AB', value: 'uppercase' },
              { label: 'ab', value: 'lowercase' },
              { label: 'Ab', value: 'capitalize' },
            ]}
            value={designState.textTransform}
            onChange={(v) => update('textTransform', v)}
          />

          <ToggleGroup
            label="Decoration"
            options={[
              { label: 'None', value: 'none' },
              { label: 'U̲', value: 'underline' },
              { label: 'S̶', value: 'line-through' },
              { label: 'O̅', value: 'overline' },
            ]}
            value={designState.textDecoration}
            onChange={(v) => update('textDecoration', v)}
          />

          <ColorInput
            label="Text Color"
            value={designState.color}
            onChange={(v) => update('color', v)}
          />
        </div>
      </AccordionSection>

      {/* ===== Borders ===== */}
      <AccordionSection title="Borders">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Width"
              value={designState.borderWidth}
              onChange={(v) => update('borderWidth', v)}
              unit="px"
              min={0}
            />
            <SelectInput
              label="Style"
              value={designState.borderStyle}
              onChange={(v) => update('borderStyle', v)}
              options={[
                { label: 'Solid', value: 'solid' },
                { label: 'Dashed', value: 'dashed' },
                { label: 'Dotted', value: 'dotted' },
                { label: 'Double', value: 'double' },
                { label: 'None', value: 'none' },
              ]}
            />
          </div>

          <ColorInput
            label="Border Color"
            value={designState.borderColor}
            onChange={(v) => update('borderColor', v)}
          />

          {/* Border Radius */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="settings-section-label" style={{ marginBottom: 0 }}>
                Border Radius
              </span>
              <button
                className={`radius-link-btn ${designState.borderLinked ? 'linked' : ''}`}
                onClick={() => update('borderLinked', !designState.borderLinked)}
                title={designState.borderLinked ? 'Unlink corners' : 'Link corners'}
              >
                {designState.borderLinked ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
              </button>
            </div>

            {designState.borderLinked ? (
              <NumberInput
                value={designState.borderRadius}
                onChange={(v) => {
                  updateMulti({
                    borderRadius: v,
                    borderRadiusTL: v,
                    borderRadiusTR: v,
                    borderRadiusBL: v,
                    borderRadiusBR: v,
                  });
                }}
                unit="px"
                min={0}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="TL"
                  value={designState.borderRadiusTL}
                  onChange={(v) => update('borderRadiusTL', v)}
                  unit="px"
                  min={0}
                />
                <NumberInput
                  label="TR"
                  value={designState.borderRadiusTR}
                  onChange={(v) => update('borderRadiusTR', v)}
                  unit="px"
                  min={0}
                />
                <NumberInput
                  label="BL"
                  value={designState.borderRadiusBL}
                  onChange={(v) => update('borderRadiusBL', v)}
                  unit="px"
                  min={0}
                />
                <NumberInput
                  label="BR"
                  value={designState.borderRadiusBR}
                  onChange={(v) => update('borderRadiusBR', v)}
                  unit="px"
                  min={0}
                />
              </div>
            )}

            {/* Radius preview */}
            <div className="flex justify-center mt-2">
              <div
                className="radius-corner-preview"
                style={{
                  borderRadius: designState.borderLinked
                    ? `${designState.borderRadius}px`
                    : `${designState.borderRadiusTL}px ${designState.borderRadiusTR}px ${designState.borderRadiusBR}px ${designState.borderRadiusBL}px`,
                }}
              />
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* ===== Effects ===== */}
      <AccordionSection title="Effects">
        <div className="flex flex-col gap-3">
          {/* Opacity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="settings-section-label" style={{ marginBottom: 0 }}>
                Opacity
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{designState.opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={designState.opacity}
              onChange={(e) => update('opacity', Number(e.target.value))}
              className="settings-slider"
            />
          </div>

          {/* Box Shadow */}
          <div>
            <span className="settings-section-label">Box Shadow</span>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label="Offset X"
                value={designState.boxShadowX}
                onChange={(v) => update('boxShadowX', v)}
                unit="px"
              />
              <NumberInput
                label="Offset Y"
                value={designState.boxShadowY}
                onChange={(v) => update('boxShadowY', v)}
                unit="px"
              />
              <NumberInput
                label="Blur"
                value={designState.boxShadowBlur}
                onChange={(v) => update('boxShadowBlur', v)}
                unit="px"
                min={0}
              />
              <NumberInput
                label="Spread"
                value={designState.boxShadowSpread}
                onChange={(v) => update('boxShadowSpread', v)}
                unit="px"
              />
            </div>
            <div className="mt-2">
              <ColorInput
                label="Shadow Color"
                value={designState.boxShadowColor}
                onChange={(v) => update('boxShadowColor', v)}
              />
            </div>
          </div>

          {/* Cursor */}
          <SelectInput
            label="Cursor"
            value={designState.cursor}
            onChange={(v) => update('cursor', v)}
            options={[
              { label: 'Default', value: 'default' },
              { label: 'Pointer', value: 'pointer' },
              { label: 'Move', value: 'move' },
              { label: 'Text', value: 'text' },
              { label: 'Not Allowed', value: 'not-allowed' },
              { label: 'Grab', value: 'grab' },
              { label: 'Crosshair', value: 'crosshair' },
            ]}
          />
        </div>
      </AccordionSection>
    </div>
  );
};
