// ============================================================
// Backend Component Registry
// ============================================================
// Mirror of the frontend registry's compilation metadata.
// Contains ONLY the fields needed for JSX generation:
//   tagName, baseClasses, propBehaviors, variantClasses,
//   selfClosing, booleanClasses, formLabelClasses, formFieldClasses
//
// When you add a new component to the frontend registry,
// add its compilation entry here too.
// ============================================================

const registry = {

  // ==================== LAYOUT ====================

  Container: {
    tagName: 'div',
    baseClasses: 'min-h-[50px]',
    selfClosing: false,
    propBehaviors: {
      padding:       { type: 'style', cssProp: 'padding', suffix: 'px' },
      margin:        { type: 'style', cssProp: 'margin', suffix: 'px' },
      gap:           { type: 'style', cssProp: 'gap', suffix: 'px' },
      flexDirection: { type: 'style', cssProp: 'flexDirection' },
      background:    { type: 'style', cssProp: 'backgroundColor' },
      borderRadius:  { type: 'style', cssProp: 'borderRadius', suffix: 'px' },
      shadow:        { type: 'skip' },
      minHeight:     { type: 'style', cssProp: 'minHeight', suffix: 'px' },
    },
    variantClasses: {
      shadow: { none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl' },
    },
  },

  // ==================== BASIC ====================

  Text: {
    tagName: 'p',
    baseClasses: 'm-0',
    selfClosing: false,
    propBehaviors: {
      text:       { type: 'content' },
      fontSize:   { type: 'style', cssProp: 'fontSize', suffix: 'px' },
      fontWeight: { type: 'style', cssProp: 'fontWeight' },
      color:      { type: 'style', cssProp: 'color' },
      textAlign:  { type: 'style', cssProp: 'textAlign' },
      lineHeight: { type: 'style', cssProp: 'lineHeight' },
    },
    variantClasses: {},
  },

  Heading: {
    tagName: 'h2', // overridden by `level` prop
    baseClasses: 'm-0 font-bold',
    selfClosing: false,
    dynamicTag: 'level', // prop name that overrides tagName
    propBehaviors: {
      text:      { type: 'content' },
      level:     { type: 'skip' },
      fontSize:  { type: 'style', cssProp: 'fontSize', suffix: 'px' },
      color:     { type: 'style', cssProp: 'color' },
      textAlign: { type: 'style', cssProp: 'textAlign' },
    },
    variantClasses: {},
  },

  Button: {
    tagName: 'button',
    baseClasses: 'rounded font-medium cursor-pointer border-0',
    selfClosing: false,
    propBehaviors: {
      text:      { type: 'content' },
      variant:   { type: 'skip' },
      size:      { type: 'skip' },
      disabled:  { type: 'attribute' },
      fullWidth: { type: 'skip' },
    },
    variantClasses: {
      variant: {
        primary:   'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        outline:   'border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    // Boolean props that add a class when true
    booleanClasses: {
      fullWidth: 'w-full',
    },
  },

  ImageComponent: {
    tagName: 'img',
    baseClasses: 'max-w-full',
    selfClosing: true,
    propBehaviors: {
      src:          { type: 'attribute' },
      alt:          { type: 'attribute' },
      objectFit:    { type: 'style', cssProp: 'objectFit' },
      width:        { type: 'style', cssProp: 'width' },
      height:       { type: 'style', cssProp: 'height' },
      borderRadius: { type: 'style', cssProp: 'borderRadius', suffix: 'px' },
    },
    variantClasses: {},
  },

  // ==================== FORMS ====================
  // Form components render as wrapper divs with label+input inside.
  // The compiler generates the full structure from props.

  InputComponent: {
    tagName: 'div',
    baseClasses: 'flex flex-col gap-1',
    selfClosing: false,
    isFormField: true,
    formFieldTag: 'input',
    formLabelClasses: 'text-sm font-medium text-gray-700',
    formFieldClasses: 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    propBehaviors: {
      label:       { type: 'skip' },
      placeholder: { type: 'skip' },
      type:        { type: 'skip' },
      required:    { type: 'skip' },
    },
    variantClasses: {},
  },

  TextareaComponent: {
    tagName: 'div',
    baseClasses: 'flex flex-col gap-1',
    selfClosing: false,
    isFormField: true,
    formFieldTag: 'textarea',
    formLabelClasses: 'text-sm font-medium text-gray-700',
    formFieldClasses: 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    propBehaviors: {
      label:       { type: 'skip' },
      placeholder: { type: 'skip' },
      rows:        { type: 'skip' },
      required:    { type: 'skip' },
    },
    variantClasses: {},
  },

  SelectComponent: {
    tagName: 'div',
    baseClasses: 'flex flex-col gap-1',
    selfClosing: false,
    isFormField: true,
    formFieldTag: 'select',
    formLabelClasses: 'text-sm font-medium text-gray-700',
    formFieldClasses: 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    propBehaviors: {
      label:    { type: 'skip' },
      options:  { type: 'skip' },
      required: { type: 'skip' },
    },
    variantClasses: {},
  },

  // ==================== DATA DISPLAY ====================

  CardComponent: {
    tagName: 'div',
    baseClasses: '',
    selfClosing: false,
    propBehaviors: {
      padding:      { type: 'style', cssProp: 'padding', suffix: 'px' },
      background:   { type: 'style', cssProp: 'backgroundColor' },
      borderRadius: { type: 'style', cssProp: 'borderRadius', suffix: 'px' },
      shadow:       { type: 'skip' },
      borderWidth:  { type: 'style', cssProp: 'borderWidth', suffix: 'px' },
      borderColor:  { type: 'style', cssProp: 'borderColor' },
    },
    variantClasses: {
      shadow: { none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl' },
    },
  },

  BadgeComponent: {
    tagName: 'span',
    baseClasses: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    selfClosing: false,
    propBehaviors: {
      text:    { type: 'content' },
      variant: { type: 'skip' },
    },
    variantClasses: {
      variant: {
        default: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error:   'bg-red-100 text-red-800',
        gray:    'bg-gray-100 text-gray-800',
      },
    },
  },

  DividerComponent: {
    tagName: 'hr',
    baseClasses: 'border-0 border-t',
    selfClosing: true,
    propBehaviors: {
      color:   { type: 'style', cssProp: 'borderColor' },
      marginY: { type: 'style', cssProp: 'marginBlock', suffix: 'px' },
    },
    variantClasses: {},
  },

  AlertComponent: {
    tagName: 'div',
    baseClasses: 'flex items-start gap-3 p-4 rounded-lg border',
    selfClosing: false,
    propBehaviors: {
      title:       { type: 'skip' },
      message:     { type: 'skip' },
      variant:     { type: 'skip' },
      dismissible: { type: 'skip' },
    },
    isAlert: true,
    variantClasses: {
      variant: {
        info:    'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error:   'bg-red-50 border-red-200 text-red-800',
      },
    },
  },

  AvatarComponent: {
    tagName: 'div',
    baseClasses: 'inline-flex items-center justify-center bg-gray-200 text-gray-600 font-medium overflow-hidden',
    selfClosing: false,
    propBehaviors: {
      src:          { type: 'skip' },
      alt:          { type: 'skip' },
      fallbackText: { type: 'skip' },
      size:         { type: 'skip' },
      shape:        { type: 'skip' },
    },
    isAvatar: true,
    variantClasses: {
      size: {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-base',
        xl: 'w-20 h-20 text-lg',
      },
      shape: {
        circle:  'rounded-full',
        rounded: 'rounded-lg',
      },
    },
  },

  ListComponent: {
    tagName: 'ul',
    baseClasses: 'list-disc pl-5 space-y-1',
    selfClosing: false,
    propBehaviors: {
      items:   { type: 'skip' },
      ordered: { type: 'skip' },
      spacing: { type: 'skip' },
    },
    isList: true,
    variantClasses: {},
  },

  // ==================== COMPOSITE ====================
  // Composite components compile as plain divs — their children
  // are individual components that compile independently.

  LoginForm: {
    tagName: 'div',
    baseClasses: '',
    selfClosing: false,
    propBehaviors: {
      padding:      { type: 'style', cssProp: 'padding', suffix: 'px' },
      gap:          { type: 'style', cssProp: 'gap', suffix: 'px' },
      background:   { type: 'style', cssProp: 'backgroundColor' },
      borderRadius: { type: 'style', cssProp: 'borderRadius', suffix: 'px' },
    },
    variantClasses: {},
  },

  HeroSection: {
    tagName: 'div',
    baseClasses: '',
    selfClosing: false,
    propBehaviors: {
      padding:    { type: 'style', cssProp: 'padding', suffix: 'px' },
      background: { type: 'style', cssProp: 'backgroundColor' },
      textAlign:  { type: 'style', cssProp: 'textAlign' },
    },
    variantClasses: {},
  },

  ContactForm: {
    tagName: 'div',
    baseClasses: '',
    selfClosing: false,
    propBehaviors: {
      padding:    { type: 'style', cssProp: 'padding', suffix: 'px' },
      gap:        { type: 'style', cssProp: 'gap', suffix: 'px' },
      background: { type: 'style', cssProp: 'backgroundColor' },
    },
    variantClasses: {},
  },

  PricingCard: {
    tagName: 'div',
    baseClasses: '',
    selfClosing: false,
    propBehaviors: {
      padding:      { type: 'style', cssProp: 'padding', suffix: 'px' },
      background:   { type: 'style', cssProp: 'backgroundColor' },
      borderRadius: { type: 'style', cssProp: 'borderRadius', suffix: 'px' },
      highlighted:  { type: 'skip' },
    },
    booleanClasses: {
      highlighted: 'ring-2 ring-blue-500',
    },
    variantClasses: {},
  },

  TestimonialCard: {
    tagName: 'div',
    baseClasses: '',
    selfClosing: false,
    propBehaviors: {
      padding:      { type: 'style', cssProp: 'padding', suffix: 'px' },
      background:   { type: 'style', cssProp: 'backgroundColor' },
      borderRadius: { type: 'style', cssProp: 'borderRadius', suffix: 'px' },
    },
    variantClasses: {},
  },

  NewsletterSection: {
    tagName: 'div',
    baseClasses: '',
    selfClosing: false,
    propBehaviors: {
      padding:    { type: 'style', cssProp: 'padding', suffix: 'px' },
      background: { type: 'style', cssProp: 'backgroundColor' },
      textAlign:  { type: 'style', cssProp: 'textAlign' },
    },
    variantClasses: {},
  },
};

module.exports = registry;
