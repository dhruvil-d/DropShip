import { useNode } from '@craftjs/core';


interface ImageComponentProps {
  src: string;
  alt: string;
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
  width: string;
  height: string;
  borderRadius: number;
}

export const ImageComponent = ({ src, alt, objectFit, width, height, borderRadius }: ImageComponentProps) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <img
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      src={src}
      alt={alt}
      style={{
        objectFit,
        width,
        height,
        borderRadius: `${borderRadius}px`,
      }}
      className="max-w-full outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move block"
    />
  );
};

// ------ Settings Panel ------

const ImageSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as ImageComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <label className="text-xs text-gray-600">
          Source URL
          <input type="text" value={props.src} onChange={(e) => setProp((p: ImageComponentProps) => { p.src = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Alt Text
          <input type="text" value={props.alt} onChange={(e) => setProp((p: ImageComponentProps) => { p.alt = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Width
            <input type="text" value={props.width} onChange={(e) => setProp((p: ImageComponentProps) => { p.width = e.target.value; })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Height
            <input type="text" value={props.height} onChange={(e) => setProp((p: ImageComponentProps) => { p.height = e.target.value; })}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
          </label>
        </div>
        <label className="text-xs text-gray-600 mt-2 block">
          Object Fit
          <select value={props.objectFit} onChange={(e) => setProp((p: ImageComponentProps) => { p.objectFit = e.target.value as ImageComponentProps['objectFit']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
            <option value="none">None</option>
          </select>
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Borders</h4>
        <label className="text-xs text-gray-600">
          Border Radius
          <input type="number" value={props.borderRadius} onChange={(e) => setProp((p: ImageComponentProps) => { p.borderRadius = Number(e.target.value); })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
      </div>
    </div>
  );
};

ImageComponent.craft = {
  displayName: 'ImageComponent',
  props: {
    src: 'https://placehold.co/400x300',
    alt: 'Placeholder image',
    objectFit: 'cover',
    width: '100%',
    height: 'auto',
    borderRadius: 0,
  } as ImageComponentProps,
  related: {
    settings: ImageSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
