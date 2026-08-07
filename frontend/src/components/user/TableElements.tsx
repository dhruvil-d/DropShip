import React from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { useResponsiveNode } from '../../hooks/useResponsiveNode';
import { Text } from './Text';

// ==================== TABLE CELL ====================

interface TableCellProps {
  padding: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textAlign: 'left' | 'center' | 'right';
}

export const TableCell = ({ padding, backgroundColor, borderColor, borderWidth, textAlign, children }: React.PropsWithChildren<TableCellProps>) => {
  const { connectors: { connect } } = useNode();
  const { isSelected } = useResponsiveNode();

  return (
    <td
      ref={(ref) => { if (ref) connect(ref); }}
      className={`transition-all ${isSelected ? 'outline outline-2 outline-blue-500 z-10 relative' : 'outline-transparent'}`}
      style={{
        padding: `${padding}px`,
        backgroundColor,
        border: `${borderWidth}px solid ${borderColor}`,
        textAlign,
      }}
    >
      {children}
    </td>
  );
};

const TableCellSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as TableCellProps,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cell Style</h4>
      
      <label className="text-xs text-gray-600 flex flex-col gap-1">
        Background Color
        <div className="flex items-center gap-2">
          <input type="color" value={props.backgroundColor} onChange={(e) => setProp((p: TableCellProps) => p.backgroundColor = e.target.value)} className="w-6 h-6 rounded cursor-pointer p-0 border-0" />
          <span className="font-mono text-[10px] text-gray-400">{props.backgroundColor}</span>
        </div>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-600">
          Border Width (px)
          <input type="number" value={props.borderWidth} onChange={(e) => setProp((p: TableCellProps) => p.borderWidth = Number(e.target.value))} className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600 flex flex-col gap-1">
          Border Color
          <div className="flex items-center gap-2 mt-1">
            <input type="color" value={props.borderColor} onChange={(e) => setProp((p: TableCellProps) => p.borderColor = e.target.value)} className="w-5 h-5 rounded cursor-pointer p-0 border-0" />
          </div>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-600">
          Padding (px)
          <input type="number" value={props.padding} onChange={(e) => setProp((p: TableCellProps) => p.padding = Number(e.target.value))} className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm" />
        </label>
        <label className="text-xs text-gray-600">
          Text Align
          <select value={props.textAlign} onChange={(e) => setProp((p: TableCellProps) => p.textAlign = e.target.value as any)} className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export const defaultTableCellProps: TableCellProps = {
  padding: 12,
  backgroundColor: 'transparent',
  borderColor: '#e5e7eb',
  borderWidth: 1,
  textAlign: 'left',
};

TableCell.craft = {
  displayName: 'TableCell',
  props: defaultTableCellProps,
  related: { settings: TableCellSettings },
  rules: {
    canMoveIn: () => true,
  }
};

// ==================== TABLE ROW ====================

export const TableRow = ({ children }: React.PropsWithChildren<{}>) => {
  const { connectors: { connect } } = useNode();
  const { isSelected } = useResponsiveNode();

  return (
    <tr
      ref={(ref) => { if (ref) connect(ref); }}
      className={`transition-colors hover:bg-gray-50 ${isSelected ? 'outline outline-2 outline-blue-400' : ''}`}
    >
      {children}
    </tr>
  );
};

const TableRowSettings = () => {
  return <div className="text-sm text-gray-500">Manage columns from the parent Table settings.</div>;
};

TableRow.craft = {
  displayName: 'TableRow',
  props: {},
  related: { settings: TableRowSettings },
  rules: {
    canMoveIn: (incomingNodes: any[]) => incomingNodes.every(node => node.data.type === TableCell || node.data.name === 'TableCell'),
  }
};

// ==================== TABLE ====================

interface TableProps {
  responsive: boolean;
}

export const Table = ({ responsive, children }: React.PropsWithChildren<TableProps>) => {
  const { connectors: { connect } } = useNode();
  const { isSelected, responsiveStyles } = useResponsiveNode();

  return (
    <div
      style={{ width: '100%', ...responsiveStyles }}
      className={`${responsive ? 'overflow-x-auto max-w-full' : ''}`}
    >
      <table
        ref={(ref) => { if (ref) connect(ref); }}
        className={`w-full border-collapse transition-all ${
          isSelected ? 'outline outline-2 outline-blue-600' : 'hover:outline hover:outline-2 hover:outline-blue-300 hover:outline-dashed outline-transparent'
        }`}
      >
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
};

const TableSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as TableProps,
  }));
  
  // Custom Craft.js actions for adding rows/columns
  const { id } = useNode();
  const { actions, query } = useEditor();

  const addRow = () => {
    // 1. Find the current node (Table)
    const tableNode = query.node(id).get();
    const rows = tableNode.data.nodes; // array of TableRow ids
    
    // Default column count if table is empty
    let columnCount = 3; 
    
    if (rows.length > 0) {
      // 2. Count cells in the first row
      const firstRowNode = query.node(rows[0]).get();
      columnCount = firstRowNode.data.nodes.length;
    }

    // 3. Create a new TableRow node
    const newRowNode = query.parseReactElement(<Element is={TableRow} canvas />).toNodeTree();
    actions.addNodeTree(newRowNode, id);

    // 4. Populate it with cells
    for (let i = 0; i < columnCount; i++) {
      const newCellNode = query.parseReactElement(
        <Element is={TableCell} canvas {...defaultTableCellProps}>
          <Text text="Placeholder" fontSize={14} color="#374151" fontWeight="400" textAlign="left" lineHeight={1.5} />
        </Element>
      ).toNodeTree();
      actions.addNodeTree(newCellNode, newRowNode.rootNodeId);
    }
  };

  const addColumn = () => {
    // Add one cell to every row
    const tableNode = query.node(id).get();
    const rows = tableNode.data.nodes;

    rows.forEach(rowId => {
      const newCellNode = query.parseReactElement(
        <Element is={TableCell} canvas {...defaultTableCellProps}>
          <Text text="Placeholder" fontSize={14} color="#374151" fontWeight="400" textAlign="left" lineHeight={1.5} />
        </Element>
      ).toNodeTree();
      actions.addNodeTree(newCellNode, rowId);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout</h4>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={addRow} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors cursor-pointer">
          + Add Row
        </button>
        <button onClick={addColumn} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors cursor-pointer">
          + Add Column
        </button>
      </div>

      <div className="h-px bg-gray-100 w-full my-1" />

      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
        <input type="checkbox" checked={props.responsive} onChange={(e) => setProp((p: TableProps) => p.responsive = e.target.checked)} className="rounded border-gray-300" />
        Responsive (Horizontal Scroll)
      </label>
    </div>
  );
};

export const defaultTableProps: TableProps = {
  responsive: true,
};

Table.craft = {
  displayName: 'Table',
  props: defaultTableProps,
  related: { settings: TableSettings },
  rules: {
    canMoveIn: (incomingNodes: any[]) => incomingNodes.every(node => node.data.type === TableRow || node.data.name === 'TableRow'),
  }
};
