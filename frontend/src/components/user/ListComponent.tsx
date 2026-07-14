import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';

interface ListComponentProps {
  items: string;
  ordered: boolean;
  spacing: 'tight' | 'normal' | 'relaxed';
}

const spacingClasses: Record<string, string> = {
  tight: 'space-y-0.5',
  normal: 'space-y-1',
  relaxed: 'space-y-2',
};

export const ListComponent = ({ items, ordered, spacing }: ListComponentProps) => {
  const { connectRef, isSelected, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLOListElement | HTMLUListElement>(null);
  const Tag = ordered ? 'ol' : 'ul';
  const listItems = items.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <Tag
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 ${spacingClasses[spacing] || ''} text-gray-700 outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move`}
      style={{ position: 'relative', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', ...responsiveStyles }}
    >
      {listItems.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef as React.RefObject<HTMLElement | null>} />}
    </Tag>
  );
};

// ------ Settings Panel ------

const ListSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as ListComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <label className="text-xs text-gray-600">
          Items (comma-separated)
          <textarea value={props.items} onChange={(e) => setProp((p: ListComponentProps) => { p.items = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" rows={4} />
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Style</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          <input type="checkbox" checked={props.ordered} onChange={(e) => setProp((p: ListComponentProps) => { p.ordered = e.target.checked; })}
            className="rounded border-gray-300" />
          Ordered (numbered)
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Spacing
          <select value={props.spacing} onChange={(e) => setProp((p: ListComponentProps) => { p.spacing = e.target.value as ListComponentProps['spacing']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="tight">Tight</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </label>
      </div>
    </div>
  );
};

ListComponent.craft = {
  displayName: 'ListComponent',
  props: {
    items: 'First item, Second item, Third item',
    ordered: false,
    spacing: 'normal',
  } as ListComponentProps,
  related: {
    settings: ListSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
