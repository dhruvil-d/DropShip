import { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { ResizeHandles } from '../editor/ResizeHandles';

interface AvatarComponentProps {
  src: string;
  alt: string;
  fallbackText: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  shape: 'circle' | 'rounded';
}

const sizeClasses: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-lg',
};

const shapeClasses: Record<string, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-lg',
};

export const AvatarComponent = ({ src, alt, fallbackText, size, shape }: AvatarComponentProps) => {
  const { connectRef, isSelected, isDark, responsiveStyles, nodeId } = useResponsiveNode();
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={(ref) => {
        elementRef.current = ref;
        connectRef(ref);
      }}
      className={`inline-flex items-center justify-center ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'} font-medium overflow-hidden outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move ${sizeClasses[size] || ''} ${shapeClasses[shape] || ''}`}
      style={{ position: 'relative', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', ...responsiveStyles }}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallbackText || '?'}</span>
      )}
      {isSelected && <ResizeHandles nodeId={nodeId} targetRef={elementRef} />}
    </div>
  );
};

// ------ Settings Panel ------

const AvatarSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as AvatarComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <label className="text-xs text-gray-600">
          Image URL
          <input type="text" value={props.src} onChange={(e) => setProp((p: AvatarComponentProps) => { p.src = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Alt Text
          <input type="text" value={props.alt} onChange={(e) => setProp((p: AvatarComponentProps) => { p.alt = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Fallback Text
          <input type="text" value={props.fallbackText} onChange={(e) => setProp((p: AvatarComponentProps) => { p.fallbackText = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Style</h4>
        <label className="text-xs text-gray-600">
          Size
          <select value={props.size} onChange={(e) => setProp((p: AvatarComponentProps) => { p.size = e.target.value as AvatarComponentProps['size']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Shape
          <select value={props.shape} onChange={(e) => setProp((p: AvatarComponentProps) => { p.shape = e.target.value as AvatarComponentProps['shape']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="circle">Circle</option>
            <option value="rounded">Rounded</option>
          </select>
        </label>
      </div>
    </div>
  );
};

AvatarComponent.craft = {
  displayName: 'AvatarComponent',
  props: {
    src: '',
    alt: 'Avatar',
    fallbackText: 'JD',
    size: 'md',
    shape: 'circle',
  } as AvatarComponentProps,
  related: {
    settings: AvatarSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
