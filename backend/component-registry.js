// ============================================================
// Backend Component Registry
// ============================================================
// Mirror of the frontend registry's compilation metadata.
// Contains ONLY the fields needed for JSX generation:
//   tagName, baseClasses, propBehaviors, variantClasses, selfClosing
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
    variantClasses: {},
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
    variantClasses: {},
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
};

module.exports = registry;
