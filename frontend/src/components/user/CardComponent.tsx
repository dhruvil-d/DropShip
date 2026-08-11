import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { deriveDarkColor } from '../../shared/colorTransform';
import { ColorPickerControl } from '../editor/ColorPickerControl';


interface CardComponentProps {
  padding: number;
  background: string;
  backgroundDark?: string;
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  borderWidth: number;
  borderColor: string;
  borderColorDark?: string;
  children?: React.ReactNode;
}

const shadowClasses: Record<string, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export const CardComponent = ({
  padding, background, backgroundDark, borderRadius, shadow, borderWidth, borderColor, borderColorDark, children,
}: CardComponentProps) => {
  const { connectRef, isSelected, isDark, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLDivElement>(null);

  const activeBg = isDark
    ? (backgroundDark || deriveDarkColor(background, 'background'))
    : background;
  const activeBorder = isDark
    ? (borderColorDark || deriveDarkColor(borderColor, 'border'))
    : borderColor;

  return (
    <div
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      style={{
        padding: `${padding}px`,
        backgroundColor: activeBg,
        borderRadius: `${borderRadius}px`,
        borderWidth: `${borderWidth}px`,
        borderColor: activeBorder,
        borderStyle: 'solid',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ...responsiveStyles,
      }}
      className={`min-h-[40px] outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all ${shadowClasses[shadow] || ''}`}
    >
      {children}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

// ------ Settings Panel ------

const CardSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as CardComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <label className="text-xs text-gray-600">
          Padding
          <input type="number" value={props.padding} onChange={(e) => setProp((p: CardComponentProps) => { p.padding = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</h4>
        <ColorPickerControl
          label="Background"
          role="background"
          lightColor={props.background}
          darkColorOverride={props.backgroundDark}
          onLightChange={(color) => setProp((p: CardComponentProps) => { p.background = color; })}
          onDarkChange={(color) => setProp((p: CardComponentProps) => { p.backgroundDark = color; })}
          onDarkReset={() => setProp((p: CardComponentProps) => { p.backgroundDark = undefined; })}
        />
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Borders</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Radius
            <input type="number" value={props.borderRadius} onChange={(e) => setProp((p: CardComponentProps) => { p.borderRadius = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Width
            <input type="number" value={props.borderWidth} onChange={(e) => setProp((p: CardComponentProps) => { p.borderWidth = Number(e.target.value); })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
        </div>
        <ColorPickerControl
          label="Border Color"
          role="border"
          lightColor={props.borderColor}
          darkColorOverride={props.borderColorDark}
          onLightChange={(color) => setProp((p: CardComponentProps) => { p.borderColor = color; })}
          onDarkChange={(color) => setProp((p: CardComponentProps) => { p.borderColorDark = color; })}
          onDarkReset={() => setProp((p: CardComponentProps) => { p.borderColorDark = undefined; })}
        />
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Effects</h4>
        <label className="text-xs text-gray-600">
          Shadow
          <select value={props.shadow} onChange={(e) => setProp((p: CardComponentProps) => { p.shadow = e.target.value as CardComponentProps['shadow']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
      </div>
    </div>
  );
};

CardComponent.craft = {
  displayName: 'CardComponent',
  props: {
    padding: 24,
    background: '#ffffff',
    borderRadius: 8,
    shadow: 'md',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  } as CardComponentProps,
  related: {
    settings: CardSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
