import { useNode } from '@craftjs/core';
import React from 'react';

interface ButtonProps {
  text: string;
  variant: 'primary' | 'secondary' | 'outline';
}

export const Button = ({ text, variant }: ButtonProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  const baseClasses = "px-4 py-2 rounded font-medium cursor-move outline-transparent hover:outline-blue-400 hover:outline-dashed hover:outline-2 transition-all";
  let variantClasses = "";
  
  if (variant === 'primary') {
    variantClasses = "bg-blue-600 text-white hover:bg-blue-700";
  } else if (variant === 'secondary') {
    variantClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300";
  } else if (variant === 'outline') {
    variantClasses = "border border-blue-600 text-blue-600 hover:bg-blue-50";
  }

  return (
    <button
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`${baseClasses} ${variantClasses}`}
    >
      {text}
    </button>
  );
};

Button.craft = {
  props: {
    text: 'Click Me',
    variant: 'primary',
  },
  rules: {
    canDrag: () => true,
  },
};
