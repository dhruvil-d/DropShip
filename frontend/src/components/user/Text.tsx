import { useNode } from '@craftjs/core';
import React from 'react';

interface TextProps {
  text: string;
  fontSize: number;
}

export const Text = ({ text, fontSize }: TextProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <p
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ fontSize: `${fontSize}px` }}
      className="m-0 p-1 text-gray-800 outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all cursor-move"
    >
      {text}
    </p>
  );
};

Text.craft = {
  props: {
    text: 'Edit me',
    fontSize: 16,
  },
  rules: {
    canDrag: () => true,
  },
};
