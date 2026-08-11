import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';
import { deriveDarkColor } from '../../shared/colorTransform';
import { ColorPickerControl } from '../editor/ColorPickerControl';


interface DividerComponentProps {
  color: string;
  colorDark?: string;
  marginY: number;
}

export const DividerComponent = ({ color, colorDark, marginY }: DividerComponentProps) => {
  const { connectRef, isSelected, isDark, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLHRElement>(null);

  const resolvedColor = isDark
    ? (colorDark || deriveDarkColor(color, 'border'))
    : color;

  return (
    <div style={{ position: 'relative', ...responsiveStyles, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <hr
        ref={(ref: HTMLHRElement | null) => {
          elementRef.current = ref;
          connectRef(ref);
        }}
        style={{
          borderColor: resolvedColor,
          marginBlock: `${marginY}px`,
        }}
        className="border-0 border-t outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move"
      />
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

// ------ Settings Panel ------

const DividerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as DividerComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Style</h4>
        <ColorPickerControl
          label="Color"
          role="border"
          lightColor={props.color}
          darkColorOverride={props.colorDark}
          onLightChange={(color) => setProp((p: DividerComponentProps) => { p.color = color; })}
          onDarkChange={(color) => setProp((p: DividerComponentProps) => { p.colorDark = color; })}
          onDarkReset={() => setProp((p: DividerComponentProps) => { p.colorDark = undefined; })}
        />
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <label className="text-xs text-gray-600">
          Vertical Margin
          <input type="number" value={props.marginY} onChange={(e) => setProp((p: DividerComponentProps) => { p.marginY = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>
    </div>
  );
};

DividerComponent.craft = {
  displayName: 'DividerComponent',
  props: {
    color: '#e5e7eb',
    marginY: 16,
  } as DividerComponentProps,
  related: {
    settings: DividerSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
