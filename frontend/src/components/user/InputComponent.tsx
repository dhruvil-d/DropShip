import { useNode } from '@craftjs/core';


interface InputComponentProps {
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'password' | 'number';
  required: boolean;
}

export const InputComponent = ({ label, placeholder, type, required }: InputComponentProps) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="flex flex-col gap-1 outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move"
    >
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        readOnly
      />
    </div>
  );
};

// ------ Settings Panel ------

const InputSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as InputComponentProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h4>
        <label className="text-xs text-gray-600">
          Label
          <input type="text" value={props.label} onChange={(e) => setProp((p: InputComponentProps) => { p.label = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Placeholder
          <input type="text" value={props.placeholder} onChange={(e) => setProp((p: InputComponentProps) => { p.placeholder = e.target.value; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 mt-2 block">
          Input Type
          <select value={props.type} onChange={(e) => setProp((p: InputComponentProps) => { p.type = e.target.value as InputComponentProps['type']; })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="password">Password</option>
            <option value="number">Number</option>
          </select>
        </label>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Validation</h4>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          <input type="checkbox" checked={props.required} onChange={(e) => setProp((p: InputComponentProps) => { p.required = e.target.checked; })}
            className="rounded border-gray-300" />
          Required
        </label>
      </div>
    </div>
  );
};

InputComponent.craft = {
  displayName: 'InputComponent',
  props: {
    label: 'Label',
    placeholder: 'Enter text...',
    type: 'text',
    required: false,
  } as InputComponentProps,
  related: {
    settings: InputSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
