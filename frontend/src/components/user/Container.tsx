import { useNode } from '@craftjs/core';
import React from 'react';

interface ContainerProps {
  background: string;
  padding: number;
  children?: React.ReactNode;
}

export const Container = ({ background, padding, children }: ContainerProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ background, padding: `${padding}px` }}
      className="min-h-[50px] outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all"
    >
      {children}
    </div>
  );
};

Container.craft = {
  props: {
    background: '#ffffff',
    padding: 20,
  },
  rules: {
    canDrag: () => true,
  },
};
