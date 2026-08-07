// ============================================================
// Component Registry — Shared type definitions & registry
// ============================================================
// This is the SINGLE SOURCE OF TRUTH for all component metadata.
// Used by:
//   - Toolbox.tsx (renders categorized, searchable component cards)
//   - App.tsx (builds the Craft.js resolver dynamically)
//   - Backend compiler (resolves tag names, prop behaviors, classes)
// ============================================================

import type { LucideIcon } from 'lucide-react';
import {
  Type, Square, LayoutTemplate, Heading1, ImageIcon,
  TextCursorInput, AlignLeft, ListOrdered, RectangleHorizontal,
  Tag, Minus, LogIn, Sparkles, Mail,
  AlertCircle, CircleUserRound, List, CreditCard, Quote, Newspaper,
  Table as TableIcon, Images,
} from 'lucide-react';

// ------ Type Definitions ------

export type PropBehaviorType = 'content' | 'style' | 'attribute' | 'className' | 'skip';

export interface PropBehavior {
  /** How this prop maps to compiled HTML output */
  type: PropBehaviorType;
  /** For 'style' type: the CSS property name (e.g. 'fontSize') */
  cssProp?: string;
  /** Auto-appended suffix for numeric values (e.g. 'px', '%') */
  suffix?: string;
}

export interface PropDefinition {
  /** The prop key name */
  name: string;
  /** Display label in settings panel */
  label: string;
  /** Control type for the settings panel */
  control: 'text' | 'number' | 'select' | 'color' | 'boolean' | 'textarea';
  /** Default value */
  defaultValue: string | number | boolean | any[];
  /** For 'select' control: the available options */
  options?: Array<{ label: string; value: string }>;
  /** How this prop compiles to JSX */
  behavior: PropBehavior;
  /** Settings panel group/section */
  group: string;
}

export interface DefaultChild {
  /** The registry key of the child component */
  component: string;
  /** Props to pass to the child */
  props: Record<string, unknown>;
}

export interface ComponentDefinition {
  /** Unique key — must match the React component's display name */
  name: string;
  /** Category for grouping in the Toolbox */
  category: 'Layout' | 'Basic' | 'Forms' | 'Data Display' | 'Composite';
  /** Lucide icon component */
  icon: LucideIcon;
  /** Short description shown in the Toolbox */
  description: string;
  /** HTML tag for compiled output */
  tagName: string;
  /** Default Tailwind classes added to compiled output */
  baseClasses: string;
  /** All prop definitions with their behaviors */
  props: PropDefinition[];
  /** Variant prop name → { variantValue → tailwind classes } */
  variantClasses?: Record<string, Record<string, string>>;
  /** Whether this component should be hidden from the Toolbox */
  hidden?: boolean;
  /** Whether this component can contain children (Craft.js canvas) */
  isCanvas: boolean;
  /** For composite components: pre-built children tree */
  defaultChildren?: DefaultChild[];
  /** Whether the HTML tag is self-closing (img, hr, input) */
  selfClosing?: boolean;
}

// ------ Helper to extract default props from a definition ------

export function getDefaultProps(def: ComponentDefinition): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const prop of def.props) {
    defaults[prop.name] = prop.defaultValue;
  }
  return defaults;
}

// ============================================================
// REGISTRY — All component definitions
// ============================================================

export const componentRegistry: Record<string, ComponentDefinition> = {

  // ==================== LAYOUT ====================

  Container: {
    name: 'Container',
    category: 'Layout',
    icon: LayoutTemplate,
    description: 'Flexible layout container',
    tagName: 'div',
    baseClasses: 'min-h-[50px]',
    isCanvas: true,
    props: [
      {
        name: 'padding', label: 'Padding', control: 'number', defaultValue: 20,
        behavior: { type: 'style', cssProp: 'padding', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'margin', label: 'Margin', control: 'number', defaultValue: 0,
        behavior: { type: 'style', cssProp: 'margin', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'gap', label: 'Gap', control: 'number', defaultValue: 0,
        behavior: { type: 'style', cssProp: 'gap', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'flexDirection', label: 'Direction', control: 'select', defaultValue: 'column',
        options: [
          { label: 'Column', value: 'column' },
          { label: 'Row', value: 'row' },
          { label: 'Column Reverse', value: 'column-reverse' },
          { label: 'Row Reverse', value: 'row-reverse' },
        ],
        behavior: { type: 'style', cssProp: 'flexDirection' }, group: 'Layout',
      },
      {
        name: 'background', label: 'Background', control: 'color', defaultValue: '#ffffff',
        behavior: { type: 'style', cssProp: 'backgroundColor' }, group: 'Colors',
      },
      {
        name: 'borderRadius', label: 'Border Radius', control: 'number', defaultValue: 0,
        behavior: { type: 'style', cssProp: 'borderRadius', suffix: 'px' }, group: 'Borders',
      },
      {
        name: 'shadow', label: 'Shadow', control: 'select', defaultValue: 'none',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
          { label: 'XL', value: 'xl' },
        ],
        behavior: { type: 'skip' }, group: 'Effects',
      },
      {
        name: 'minHeight', label: 'Min Height', control: 'number', defaultValue: 50,
        behavior: { type: 'style', cssProp: 'minHeight', suffix: 'px' }, group: 'Layout',
      },
    ],
  },

  // ==================== BASIC ====================

  Text: {
    name: 'Text',
    category: 'Basic',
    icon: Type,
    description: 'Paragraph text block',
    tagName: 'p',
    baseClasses: 'm-0',
    isCanvas: false,
    props: [
      {
        name: 'text', label: 'Content', control: 'textarea', defaultValue: 'Edit me',
        behavior: { type: 'content' }, group: 'Content',
      },
      {
        name: 'fontSize', label: 'Font Size', control: 'number', defaultValue: 16,
        behavior: { type: 'style', cssProp: 'fontSize', suffix: 'px' }, group: 'Typography',
      },
      {
        name: 'fontWeight', label: 'Weight', control: 'select', defaultValue: '400',
        options: [
          { label: 'Light (300)', value: '300' },
          { label: 'Normal (400)', value: '400' },
          { label: 'Medium (500)', value: '500' },
          { label: 'Semi Bold (600)', value: '600' },
          { label: 'Bold (700)', value: '700' },
        ],
        behavior: { type: 'style', cssProp: 'fontWeight' }, group: 'Typography',
      },
      {
        name: 'color', label: 'Color', control: 'color', defaultValue: '#1f2937',
        behavior: { type: 'style', cssProp: 'color' }, group: 'Typography',
      },
      {
        name: 'textAlign', label: 'Align', control: 'select', defaultValue: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        behavior: { type: 'style', cssProp: 'textAlign' }, group: 'Typography',
      },
      {
        name: 'lineHeight', label: 'Line Height', control: 'number', defaultValue: 1.5,
        behavior: { type: 'style', cssProp: 'lineHeight' }, group: 'Typography',
      },
    ],
  },

  Heading: {
    name: 'Heading',
    category: 'Basic',
    icon: Heading1,
    description: 'Heading (h1–h6)',
    tagName: 'h2', // default, dynamically overridden by `level` prop
    baseClasses: 'm-0 font-bold',
    isCanvas: false,
    props: [
      {
        name: 'text', label: 'Content', control: 'text', defaultValue: 'Heading',
        behavior: { type: 'content' }, group: 'Content',
      },
      {
        name: 'level', label: 'Level', control: 'select', defaultValue: 'h2',
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
          { label: 'H5', value: 'h5' },
          { label: 'H6', value: 'h6' },
        ],
        behavior: { type: 'skip' }, group: 'Content', // handled specially: overrides tagName
      },
      {
        name: 'fontSize', label: 'Font Size', control: 'number', defaultValue: 28,
        behavior: { type: 'style', cssProp: 'fontSize', suffix: 'px' }, group: 'Typography',
      },
      {
        name: 'color', label: 'Color', control: 'color', defaultValue: '#111827',
        behavior: { type: 'style', cssProp: 'color' }, group: 'Typography',
      },
      {
        name: 'textAlign', label: 'Align', control: 'select', defaultValue: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        behavior: { type: 'style', cssProp: 'textAlign' }, group: 'Typography',
      },
    ],
  },

  Button: {
    name: 'Button',
    category: 'Basic',
    icon: Square,
    description: 'Clickable button with variants',
    tagName: 'button',
    baseClasses: 'rounded font-medium cursor-pointer border-0',
    isCanvas: false,
    variantClasses: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        outline: 'border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    props: [
      {
        name: 'text', label: 'Label', control: 'text', defaultValue: 'Click Me',
        behavior: { type: 'content' }, group: 'Content',
      },
      {
        name: 'variant', label: 'Variant', control: 'select', defaultValue: 'primary',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
        ],
        behavior: { type: 'skip' }, group: 'Style',
      },
      {
        name: 'size', label: 'Size', control: 'select', defaultValue: 'md',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
        behavior: { type: 'skip' }, group: 'Style',
      },
      {
        name: 'disabled', label: 'Disabled', control: 'boolean', defaultValue: false,
        behavior: { type: 'attribute' }, group: 'State',
      },
      {
        name: 'fullWidth', label: 'Full Width', control: 'boolean', defaultValue: false,
        behavior: { type: 'skip' }, group: 'Layout',
      },
    ],
  },

  ImageComponent: {
    name: 'ImageComponent',
    category: 'Basic',
    icon: ImageIcon,
    description: 'Image element',
    tagName: 'img',
    baseClasses: 'max-w-full',
    isCanvas: false,
    selfClosing: true,
    props: [
      {
        name: 'src', label: 'Source URL', control: 'text', defaultValue: 'https://placehold.co/400x300',
        behavior: { type: 'attribute' }, group: 'Content',
      },
      {
        name: 'alt', label: 'Alt Text', control: 'text', defaultValue: 'Placeholder image',
        behavior: { type: 'attribute' }, group: 'Content',
      },
      {
        name: 'objectFit', label: 'Object Fit', control: 'select', defaultValue: 'cover',
        options: [
          { label: 'Cover', value: 'cover' },
          { label: 'Contain', value: 'contain' },
          { label: 'Fill', value: 'fill' },
          { label: 'None', value: 'none' },
        ],
        behavior: { type: 'style', cssProp: 'objectFit' }, group: 'Layout',
      },
      {
        name: 'width', label: 'Width', control: 'text', defaultValue: '100%',
        behavior: { type: 'style', cssProp: 'width' }, group: 'Layout',
      },
      {
        name: 'height', label: 'Height', control: 'text', defaultValue: 'auto',
        behavior: { type: 'style', cssProp: 'height' }, group: 'Layout',
      },
      {
        name: 'borderRadius', label: 'Border Radius', control: 'number', defaultValue: 0,
        behavior: { type: 'style', cssProp: 'borderRadius', suffix: 'px' }, group: 'Borders',
      },
    ],
  },

  // ==================== FORMS ====================

  InputComponent: {
    name: 'InputComponent',
    category: 'Forms',
    icon: TextCursorInput,
    description: 'Text input with label',
    tagName: 'div', // wraps label + input
    baseClasses: 'flex flex-col gap-1',
    isCanvas: false,
    props: [
      {
        name: 'label', label: 'Label', control: 'text', defaultValue: 'Label',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'placeholder', label: 'Placeholder', control: 'text', defaultValue: 'Enter text...',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'type', label: 'Input Type', control: 'select', defaultValue: 'text',
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Email', value: 'email' },
          { label: 'Password', value: 'password' },
          { label: 'Number', value: 'number' },
        ],
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'required', label: 'Required', control: 'boolean', defaultValue: false,
        behavior: { type: 'skip' }, group: 'Validation',
      },
    ],
  },

  TextareaComponent: {
    name: 'TextareaComponent',
    category: 'Forms',
    icon: AlignLeft,
    description: 'Multi-line text area',
    tagName: 'div',
    baseClasses: 'flex flex-col gap-1',
    isCanvas: false,
    props: [
      {
        name: 'label', label: 'Label', control: 'text', defaultValue: 'Message',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'placeholder', label: 'Placeholder', control: 'text', defaultValue: 'Enter message...',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'rows', label: 'Rows', control: 'number', defaultValue: 4,
        behavior: { type: 'skip' }, group: 'Layout',
      },
      {
        name: 'required', label: 'Required', control: 'boolean', defaultValue: false,
        behavior: { type: 'skip' }, group: 'Validation',
      },
    ],
  },

  SelectComponent: {
    name: 'SelectComponent',
    category: 'Forms',
    icon: ListOrdered,
    description: 'Dropdown select menu',
    tagName: 'div',
    baseClasses: 'flex flex-col gap-1',
    isCanvas: false,
    props: [
      {
        name: 'label', label: 'Label', control: 'text', defaultValue: 'Select',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'options', label: 'Options (comma-separated)', control: 'text', defaultValue: 'Option 1,Option 2,Option 3',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'required', label: 'Required', control: 'boolean', defaultValue: false,
        behavior: { type: 'skip' }, group: 'Validation',
      },
    ],
  },

  // ==================== DATA DISPLAY ====================

  Table: {
    name: 'Table',
    category: 'Data Display',
    icon: TableIcon,
    description: 'Customizable Grid Table',
    tagName: 'table',
    baseClasses: 'w-full border-collapse',
    isCanvas: true,
    defaultChildren: [
      { component: 'TableRow', props: {} },
      { component: 'TableRow', props: {} },
      { component: 'TableRow', props: {} },
    ],
    props: [
      {
        name: 'responsive', label: 'Responsive', control: 'boolean', defaultValue: true,
        behavior: { type: 'skip' }, group: 'Layout',
      },
    ],
  },

  TableRow: {
    name: 'TableRow',
    category: 'Data Display',
    icon: TableIcon,
    description: 'Table Row',
    tagName: 'tr',
    baseClasses: '',
    isCanvas: true,
    hidden: true,
    defaultChildren: [
      { component: 'TableCell', props: {} },
      { component: 'TableCell', props: {} },
      { component: 'TableCell', props: {} },
    ],
    props: [],
  },

  TableCell: {
    name: 'TableCell',
    category: 'Data Display',
    icon: TableIcon,
    description: 'Table Cell',
    tagName: 'td',
    baseClasses: '',
    isCanvas: true,
    hidden: true,
    defaultChildren: [
      { component: 'Text', props: { text: 'Placeholder' } },
    ],
    props: [
      {
        name: 'padding', label: 'Padding', control: 'number', defaultValue: 12,
        behavior: { type: 'style', cssProp: 'padding', suffix: 'px' }, group: 'Style',
      },
      {
        name: 'backgroundColor', label: 'Background', control: 'color', defaultValue: 'transparent',
        behavior: { type: 'style', cssProp: 'backgroundColor' }, group: 'Style',
      },
      {
        name: 'borderWidth', label: 'Border Width', control: 'number', defaultValue: 1,
        behavior: { type: 'skip' }, group: 'Style',
      },
      {
        name: 'borderColor', label: 'Border Color', control: 'color', defaultValue: '#e5e7eb',
        behavior: { type: 'skip' }, group: 'Style', // Handled custom on backend to combine width + color
      },
      {
        name: 'textAlign', label: 'Text Align', control: 'select', defaultValue: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        behavior: { type: 'style', cssProp: 'textAlign' }, group: 'Style',
      },
    ],
  },

  Carousel: {
    name: 'Carousel',
    category: 'Data Display',
    icon: Images,
    description: 'Image slider/carousel',
    tagName: 'div',
    baseClasses: 'relative w-full overflow-hidden flex',
    isCanvas: false,
    props: [
      {
        name: 'images', label: 'Images', control: 'textarea',
        defaultValue: [
          { id: '1', url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800&q=80', alt: 'Slide 1' },
          { id: '2', url: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&w=800&q=80', alt: 'Slide 2' },
        ],
        behavior: { type: 'skip' }, group: 'Content', // Handled by custom editor panel
      },
      {
        name: 'autoPlay', label: 'Auto-play', control: 'boolean', defaultValue: true,
        behavior: { type: 'skip' }, group: 'Behavior',
      },
      {
        name: 'interval', label: 'Interval (ms)', control: 'number', defaultValue: 3000,
        behavior: { type: 'skip' }, group: 'Behavior',
      },
      {
        name: 'showArrows', label: 'Show Arrows', control: 'boolean', defaultValue: true,
        behavior: { type: 'skip' }, group: 'Behavior',
      },
      {
        name: 'showDots', label: 'Show Dots', control: 'boolean', defaultValue: true,
        behavior: { type: 'skip' }, group: 'Behavior',
      },
      {
        name: 'height', label: 'Height (px)', control: 'number', defaultValue: 400,
        behavior: { type: 'style', cssProp: 'height', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'objectFit', label: 'Image Fit', control: 'select', defaultValue: 'fill',
        options: [
          { label: 'Cover', value: 'cover' },
          { label: 'Contain', value: 'contain' },
          { label: 'Fill', value: 'fill' },
        ],
        behavior: { type: 'skip' }, group: 'Layout',
      },
    ],
  },

  CardComponent: {
    name: 'CardComponent',
    category: 'Data Display',
    icon: RectangleHorizontal,
    description: 'Card container with shadow',
    tagName: 'div',
    baseClasses: '',
    isCanvas: true,
    props: [
      {
        name: 'padding', label: 'Padding', control: 'number', defaultValue: 24,
        behavior: { type: 'style', cssProp: 'padding', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'background', label: 'Background', control: 'color', defaultValue: '#ffffff',
        behavior: { type: 'style', cssProp: 'backgroundColor' }, group: 'Colors',
      },
      {
        name: 'borderRadius', label: 'Border Radius', control: 'number', defaultValue: 8,
        behavior: { type: 'style', cssProp: 'borderRadius', suffix: 'px' }, group: 'Borders',
      },
      {
        name: 'shadow', label: 'Shadow', control: 'select', defaultValue: 'md',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
        behavior: { type: 'skip' }, group: 'Effects',
      },
      {
        name: 'borderWidth', label: 'Border Width', control: 'number', defaultValue: 1,
        behavior: { type: 'style', cssProp: 'borderWidth', suffix: 'px' }, group: 'Borders',
      },
      {
        name: 'borderColor', label: 'Border Color', control: 'color', defaultValue: '#e5e7eb',
        behavior: { type: 'style', cssProp: 'borderColor' }, group: 'Borders',
      },
    ],
  },

  BadgeComponent: {
    name: 'BadgeComponent',
    category: 'Data Display',
    icon: Tag,
    description: 'Small inline label/badge',
    tagName: 'span',
    baseClasses: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    isCanvas: false,
    variantClasses: {
      variant: {
        default: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        gray: 'bg-gray-100 text-gray-800',
      },
    },
    props: [
      {
        name: 'text', label: 'Text', control: 'text', defaultValue: 'Badge',
        behavior: { type: 'content' }, group: 'Content',
      },
      {
        name: 'variant', label: 'Variant', control: 'select', defaultValue: 'default',
        options: [
          { label: 'Default', value: 'default' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
          { label: 'Gray', value: 'gray' },
        ],
        behavior: { type: 'skip' }, group: 'Style',
      },
    ],
  },

  DividerComponent: {
    name: 'DividerComponent',
    category: 'Data Display',
    icon: Minus,
    description: 'Horizontal divider line',
    tagName: 'hr',
    baseClasses: 'border-0 border-t',
    isCanvas: false,
    selfClosing: true,
    props: [
      {
        name: 'color', label: 'Color', control: 'color', defaultValue: '#e5e7eb',
        behavior: { type: 'style', cssProp: 'borderColor' }, group: 'Style',
      },
      {
        name: 'marginY', label: 'Vertical Margin', control: 'number', defaultValue: 16,
        behavior: { type: 'style', cssProp: 'marginBlock', suffix: 'px' }, group: 'Layout',
      },
    ],
  },

  AlertComponent: {
    name: 'AlertComponent',
    category: 'Data Display',
    icon: AlertCircle,
    description: 'Dismissible alert/notification',
    tagName: 'div',
    baseClasses: 'flex items-start gap-3 p-4 rounded-lg border',
    isCanvas: false,
    variantClasses: {
      variant: {
        info:    'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error:   'bg-red-50 border-red-200 text-red-800',
      },
    },
    props: [
      {
        name: 'title', label: 'Title', control: 'text', defaultValue: 'Heads up!',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'message', label: 'Message', control: 'textarea', defaultValue: 'This is an informational alert message.',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'variant', label: 'Variant', control: 'select', defaultValue: 'info',
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
        ],
        behavior: { type: 'skip' }, group: 'Style',
      },
      {
        name: 'dismissible', label: 'Dismissible', control: 'boolean', defaultValue: false,
        behavior: { type: 'skip' }, group: 'Behavior',
      },
    ],
  },

  AvatarComponent: {
    name: 'AvatarComponent',
    category: 'Data Display',
    icon: CircleUserRound,
    description: 'User avatar with fallback',
    tagName: 'div',
    baseClasses: 'inline-flex items-center justify-center bg-gray-200 text-gray-600 font-medium overflow-hidden',
    isCanvas: false,
    variantClasses: {
      size: {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-base',
        xl: 'w-20 h-20 text-lg',
      },
      shape: {
        circle: 'rounded-full',
        rounded: 'rounded-lg',
      },
    },
    props: [
      {
        name: 'src', label: 'Image URL', control: 'text', defaultValue: '',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'alt', label: 'Alt Text', control: 'text', defaultValue: 'Avatar',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'fallbackText', label: 'Fallback Text', control: 'text', defaultValue: 'JD',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'size', label: 'Size', control: 'select', defaultValue: 'md',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' },
        ],
        behavior: { type: 'skip' }, group: 'Style',
      },
      {
        name: 'shape', label: 'Shape', control: 'select', defaultValue: 'circle',
        options: [
          { label: 'Circle', value: 'circle' },
          { label: 'Rounded', value: 'rounded' },
        ],
        behavior: { type: 'skip' }, group: 'Style',
      },
    ],
  },

  ListComponent: {
    name: 'ListComponent',
    category: 'Data Display',
    icon: List,
    description: 'Ordered or unordered list',
    tagName: 'ul',
    baseClasses: 'list-disc pl-5 space-y-1',
    isCanvas: false,
    props: [
      {
        name: 'items', label: 'Items (comma-separated)', control: 'textarea', defaultValue: 'First item, Second item, Third item',
        behavior: { type: 'skip' }, group: 'Content',
      },
      {
        name: 'ordered', label: 'Ordered (numbered)', control: 'boolean', defaultValue: false,
        behavior: { type: 'skip' }, group: 'Style',
      },
      {
        name: 'spacing', label: 'Spacing', control: 'select', defaultValue: 'normal',
        options: [
          { label: 'Tight', value: 'tight' },
          { label: 'Normal', value: 'normal' },
          { label: 'Relaxed', value: 'relaxed' },
        ],
        behavior: { type: 'skip' }, group: 'Style',
      },
    ],
  },

  // ==================== COMPOSITE ====================

  LoginForm: {
    name: 'LoginForm',
    category: 'Composite',
    icon: LogIn,
    description: 'Pre-built sign-in form',
    tagName: 'div',
    baseClasses: '',
    isCanvas: true,
    props: [
      {
        name: 'padding', label: 'Padding', control: 'number', defaultValue: 32,
        behavior: { type: 'style', cssProp: 'padding', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'gap', label: 'Gap', control: 'number', defaultValue: 16,
        behavior: { type: 'style', cssProp: 'gap', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'background', label: 'Background', control: 'color', defaultValue: '#ffffff',
        behavior: { type: 'style', cssProp: 'backgroundColor' }, group: 'Colors',
      },
      {
        name: 'borderRadius', label: 'Border Radius', control: 'number', defaultValue: 8,
        behavior: { type: 'style', cssProp: 'borderRadius', suffix: 'px' }, group: 'Borders',
      },
    ],
    defaultChildren: [
      { component: 'Heading', props: { text: 'Sign In', level: 'h2', fontSize: 24 } },
      { component: 'InputComponent', props: { label: 'Email', type: 'email', placeholder: 'you@example.com' } },
      { component: 'InputComponent', props: { label: 'Password', type: 'password', placeholder: '••••••••' } },
      { component: 'Button', props: { text: 'Sign In', variant: 'primary', fullWidth: true, size: 'md' } },
    ],
  },

  HeroSection: {
    name: 'HeroSection',
    category: 'Composite',
    icon: Sparkles,
    description: 'Pre-built hero with CTA',
    tagName: 'div',
    baseClasses: '',
    isCanvas: true,
    props: [
      {
        name: 'padding', label: 'Padding', control: 'number', defaultValue: 64,
        behavior: { type: 'style', cssProp: 'padding', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'background', label: 'Background', control: 'color', defaultValue: '#f9fafb',
        behavior: { type: 'style', cssProp: 'backgroundColor' }, group: 'Colors',
      },
      {
        name: 'textAlign', label: 'Text Align', control: 'select', defaultValue: 'center',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        behavior: { type: 'style', cssProp: 'textAlign' }, group: 'Typography',
      },
    ],
    defaultChildren: [
      { component: 'Heading', props: { text: 'Build Something Amazing', level: 'h1', fontSize: 40, textAlign: 'center' } },
      { component: 'Text', props: { text: 'Create beautiful applications with our drag-and-drop builder. No coding required.', fontSize: 18, color: '#6b7280', textAlign: 'center' } },
      { component: 'Button', props: { text: 'Get Started', variant: 'primary', size: 'lg' } },
    ],
  },

  ContactForm: {
    name: 'ContactForm',
    category: 'Composite',
    icon: Mail,
    description: 'Pre-built contact form',
    tagName: 'div',
    baseClasses: '',
    isCanvas: true,
    props: [
      {
        name: 'padding', label: 'Padding', control: 'number', defaultValue: 32,
        behavior: { type: 'style', cssProp: 'padding', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'gap', label: 'Gap', control: 'number', defaultValue: 16,
        behavior: { type: 'style', cssProp: 'gap', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'background', label: 'Background', control: 'color', defaultValue: '#ffffff',
        behavior: { type: 'style', cssProp: 'backgroundColor' }, group: 'Colors',
      },
    ],
    defaultChildren: [
      { component: 'Heading', props: { text: 'Contact Us', level: 'h2', fontSize: 24 } },
      { component: 'InputComponent', props: { label: 'Name', type: 'text', placeholder: 'Your name' } },
      { component: 'InputComponent', props: { label: 'Email', type: 'email', placeholder: 'you@example.com' } },
      { component: 'TextareaComponent', props: { label: 'Message', placeholder: 'Your message...', rows: 4 } },
      { component: 'Button', props: { text: 'Send Message', variant: 'primary', size: 'md' } },
    ],
  },

  PricingCard: {
    name: 'PricingCard',
    category: 'Composite',
    icon: CreditCard,
    description: 'Pre-built pricing card',
    tagName: 'div',
    baseClasses: '',
    isCanvas: true,
    props: [
      {
        name: 'padding', label: 'Padding', control: 'number', defaultValue: 32,
        behavior: { type: 'style', cssProp: 'padding', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'background', label: 'Background', control: 'color', defaultValue: '#ffffff',
        behavior: { type: 'style', cssProp: 'backgroundColor' }, group: 'Colors',
      },
      {
        name: 'borderRadius', label: 'Border Radius', control: 'number', defaultValue: 12,
        behavior: { type: 'style', cssProp: 'borderRadius', suffix: 'px' }, group: 'Borders',
      },
      {
        name: 'highlighted', label: 'Highlighted (Popular)', control: 'boolean', defaultValue: false,
        behavior: { type: 'skip' }, group: 'Style',
      },
    ],
    defaultChildren: [
      { component: 'Heading', props: { text: 'Pro Plan', level: 'h3', fontSize: 24 } },
      { component: 'Text', props: { text: '$29/month', fontSize: 36, fontWeight: '700', color: '#111827' } },
      { component: 'Text', props: { text: 'Everything you need to grow your business', fontSize: 14, color: '#6b7280' } },
      { component: 'ListComponent', props: { items: 'Unlimited projects, Priority support, Advanced analytics, Custom domain', ordered: false, spacing: 'normal' } },
      { component: 'Button', props: { text: 'Get Started', variant: 'primary', size: 'lg', fullWidth: true } },
    ],
  },

  TestimonialCard: {
    name: 'TestimonialCard',
    category: 'Composite',
    icon: Quote,
    description: 'Customer testimonial card',
    tagName: 'div',
    baseClasses: '',
    isCanvas: true,
    props: [
      {
        name: 'padding', label: 'Padding', control: 'number', defaultValue: 24,
        behavior: { type: 'style', cssProp: 'padding', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'background', label: 'Background', control: 'color', defaultValue: '#ffffff',
        behavior: { type: 'style', cssProp: 'backgroundColor' }, group: 'Colors',
      },
      {
        name: 'borderRadius', label: 'Border Radius', control: 'number', defaultValue: 12,
        behavior: { type: 'style', cssProp: 'borderRadius', suffix: 'px' }, group: 'Borders',
      },
    ],
    defaultChildren: [
      { component: 'Text', props: { text: '"This product completely transformed how we work. The team collaboration features are incredible and the support is outstanding."', fontSize: 16, fontWeight: '400', color: '#374151', lineHeight: 1.6 } },
      { component: 'AvatarComponent', props: { src: '', fallbackText: 'JD', size: 'md', shape: 'circle', alt: 'Jane Doe' } },
      { component: 'Text', props: { text: 'Jane Doe', fontSize: 14, fontWeight: '600', color: '#111827' } },
      { component: 'Text', props: { text: 'CEO at TechCorp', fontSize: 12, fontWeight: '400', color: '#9ca3af' } },
    ],
  },

  NewsletterSection: {
    name: 'NewsletterSection',
    category: 'Composite',
    icon: Newspaper,
    description: 'Email signup section',
    tagName: 'div',
    baseClasses: '',
    isCanvas: true,
    props: [
      {
        name: 'padding', label: 'Padding', control: 'number', defaultValue: 48,
        behavior: { type: 'style', cssProp: 'padding', suffix: 'px' }, group: 'Layout',
      },
      {
        name: 'background', label: 'Background', control: 'color', defaultValue: '#f0f9ff',
        behavior: { type: 'style', cssProp: 'backgroundColor' }, group: 'Colors',
      },
      {
        name: 'textAlign', label: 'Text Align', control: 'select', defaultValue: 'center',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        behavior: { type: 'style', cssProp: 'textAlign' }, group: 'Typography',
      },
    ],
    defaultChildren: [
      { component: 'Heading', props: { text: 'Stay Updated', level: 'h2', fontSize: 28, textAlign: 'center' } },
      { component: 'Text', props: { text: 'Subscribe to our newsletter for the latest updates, tips, and exclusive offers.', fontSize: 16, color: '#6b7280', textAlign: 'center' } },
      { component: 'InputComponent', props: { label: 'Email Address', type: 'email', placeholder: 'you@example.com' } },
      { component: 'Button', props: { text: 'Subscribe', variant: 'primary', size: 'md' } },
    ],
  },
};

// ------ Helper: Get all categories with their components ------

export function getComponentsByCategory(): Array<{ category: string; components: ComponentDefinition[] }> {
  const categoryMap = new Map<string, ComponentDefinition[]>();
  const categoryOrder = ['Layout', 'Basic', 'Forms', 'Data Display', 'Composite'];

  for (const def of Object.values(componentRegistry)) {
    if (def.hidden) continue;
    const list = categoryMap.get(def.category) || [];
    list.push(def);
    categoryMap.set(def.category, list);
  }

  return categoryOrder
    .filter(cat => categoryMap.has(cat))
    .map(cat => ({ category: cat, components: categoryMap.get(cat)! }));
}

// ------ Helper: Get a flat list of component names for the resolver ------

export function getRegistryNames(): string[] {
  return Object.keys(componentRegistry);
}
