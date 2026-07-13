const express = require('express');
const cors = require('cors');
const t = require('@babel/types');
const generate = require('@babel/generator').default;
const registry = require('./component-registry');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 images

// ============================================================
// Dynamic JSX Compiler — Registry-Driven
// ============================================================
// Zero hardcoded if/else chains. Every component's compilation
// behavior is defined by the registry.
// ============================================================

/**
 * Build a single style object expression from collected style entries.
 * e.g. { padding: '20px', backgroundColor: '#fff' }
 */
function buildStyleAttribute(styleEntries) {
  if (styleEntries.length === 0) return null;

  const properties = styleEntries.map(({ cssProp, value, suffix }) => {
    let finalValue;
    if (suffix && typeof value === 'number') {
      finalValue = `${value}${suffix}`;
    } else {
      finalValue = String(value);
    }
    return t.objectProperty(
      t.identifier(cssProp),
      t.stringLiteral(finalValue)
    );
  });

  return t.jsxAttribute(
    t.jsxIdentifier('style'),
    t.jsxExpressionContainer(t.objectExpression(properties))
  );
}

/**
 * Build form field children (label + input/textarea/select) for form components.
 * Reads label/field classes from the registry definition — no hardcoded strings.
 */
function buildFormFieldChildren(def, nodeProps) {
  const children = [];
  const fieldTag = def.formFieldTag; // 'input', 'textarea', or 'select'
  const labelClasses = def.formLabelClasses || 'text-sm font-medium text-gray-700';
  const fieldClasses = def.formFieldClasses || 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm';

  const fieldName = nodeProps.label 
    ? nodeProps.label.toLowerCase().replace(/[^a-z0-9]/g, '-') 
    : 'field';

  // Label
  if (nodeProps.label) {
    const labelEl = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('label'), [
        t.jsxAttribute(t.jsxIdentifier('htmlFor'), t.stringLiteral(fieldName)),
        t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral(labelClasses)),
      ], false),
      t.jsxClosingElement(t.jsxIdentifier('label')),
      [t.jsxText(nodeProps.label)],
      false
    );
    children.push(labelEl);
  }

  // Build field attributes
  const fieldAttrs = [
    t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral(fieldName)),
    t.jsxAttribute(t.jsxIdentifier('name'), t.stringLiteral(fieldName)),
    t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral(fieldClasses)),
  ];

  if (nodeProps.placeholder) {
    fieldAttrs.push(t.jsxAttribute(t.jsxIdentifier('placeholder'), t.stringLiteral(nodeProps.placeholder)));
  }
  if (nodeProps.type && fieldTag === 'input') {
    fieldAttrs.push(t.jsxAttribute(t.jsxIdentifier('type'), t.stringLiteral(nodeProps.type)));
  }
  if (nodeProps.required) {
    fieldAttrs.push(t.jsxAttribute(t.jsxIdentifier('required'), null));
  }
  if (nodeProps.rows && fieldTag === 'textarea') {
    fieldAttrs.push(t.jsxAttribute(t.jsxIdentifier('rows'), t.jsxExpressionContainer(t.numericLiteral(Number(nodeProps.rows)))));
  }

  if (fieldTag === 'select') {
    const optionStrings = (nodeProps.options || '').split(',').map(s => s.trim()).filter(Boolean);
    const optionElements = optionStrings.map(opt => {
      return t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('option'), [
          t.jsxAttribute(t.jsxIdentifier('value'), t.stringLiteral(opt)),
        ], false),
        t.jsxClosingElement(t.jsxIdentifier('option')),
        [t.jsxText(opt)],
        false
      );
    });

    const selectEl = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('select'), fieldAttrs, false),
      t.jsxClosingElement(t.jsxIdentifier('select')),
      optionElements,
      false
    );
    children.push(selectEl);
  } else if (fieldTag === 'input') {
    const inputEl = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('input'), fieldAttrs, true),
      null,
      [],
      true
    );
    children.push(inputEl);
  } else {
    const textareaEl = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier(fieldTag), fieldAttrs, false),
      t.jsxClosingElement(t.jsxIdentifier(fieldTag)),
      [],
      false
    );
    children.push(textareaEl);
  }

  return children;
}

/**
 * Build Alert children (title + message) for AlertComponent.
 */
function buildAlertChildren(nodeProps) {
  const children = [];

  if (nodeProps.title) {
    const titleEl = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('strong'), [
        t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('block font-semibold mb-1')),
      ], false),
      t.jsxClosingElement(t.jsxIdentifier('strong')),
      [t.jsxText(nodeProps.title)],
      false
    );
    children.push(titleEl);
  }

  if (nodeProps.message) {
    const msgEl = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('span'), [
        t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('text-sm')),
      ], false),
      t.jsxClosingElement(t.jsxIdentifier('span')),
      [t.jsxText(nodeProps.message)],
      false
    );
    children.push(msgEl);
  }

  return children;
}

/**
 * Build Avatar children — either an <img> or a fallback <span>.
 */
function buildAvatarChildren(nodeProps) {
  if (nodeProps.src) {
    const imgEl = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('img'), [
        t.jsxAttribute(t.jsxIdentifier('src'), t.stringLiteral(nodeProps.src)),
        t.jsxAttribute(t.jsxIdentifier('alt'), t.stringLiteral(nodeProps.alt || '')),
        t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('w-full h-full object-cover')),
      ], true),
      null, [], true
    );
    return [imgEl];
  }

  // Fallback: show initials
  const fallback = nodeProps.fallbackText || '?';
  return [t.jsxText(fallback)];
}

/**
 * Build List children — <li> elements from comma-separated items string.
 */
function buildListChildren(nodeProps) {
  const items = (nodeProps.items || '').split(',').map(s => s.trim()).filter(Boolean);
  return items.map(item => {
    return t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('li'), [], false),
      t.jsxClosingElement(t.jsxIdentifier('li')),
      [t.jsxText(item)],
      false
    );
  });
}

/**
 * Recursively generate a JSX AST node from a Craft.js serialized node.
 */
function generateJSX(nodes, nodeId) {
  const node = nodes[nodeId];
  if (!node) return null;

  const typeName = node.type.resolvedName || node.type.name || node.type;
  const def = registry[typeName] || { tagName: 'div', propBehaviors: {}, baseClasses: '', variantClasses: {} };

  // Resolve tag name — may be overridden by a prop (e.g. Heading's `level`)
  let tagName = def.tagName;
  if (def.dynamicTag && node.props && node.props[def.dynamicTag]) {
    tagName = node.props[def.dynamicTag];
  }

  // For ListComponent: use <ol> if ordered=true
  if (def.isList && node.props && node.props.ordered) {
    tagName = 'ol';
  }

  const children = [];
  const jsxProps = [];
  const styleEntries = [];

  // ---------- Process props via registry behaviors ----------

  for (const [key, value] of Object.entries(node.props || {})) {
    const behavior = (def.propBehaviors || {})[key];

    if (!behavior || behavior.type === 'skip') {
      continue;
    }

    if (behavior.type === 'content') {
      children.push(t.jsxText(String(value)));
      continue;
    }

    if (behavior.type === 'style') {
      styleEntries.push({
        cssProp: behavior.cssProp,
        value,
        suffix: behavior.suffix || '',
      });
      continue;
    }

    if (behavior.type === 'attribute') {
      if (typeof value === 'boolean') {
        if (value) {
          jsxProps.push(t.jsxAttribute(t.jsxIdentifier(key), null));
        }
      } else {
        jsxProps.push(t.jsxAttribute(
          t.jsxIdentifier(key),
          typeof value === 'string' ? t.stringLiteral(value) : t.jsxExpressionContainer(t.stringLiteral(String(value)))
        ));
      }
      continue;
    }

    if (behavior.type === 'className') {
      continue;
    }
  }

  // ---------- Build className from baseClasses + variantClasses + booleanClasses ----------

  let classNames = (def.baseClasses || '').trim();

  // Variant classes (select-based props like variant, size, shadow)
  if (def.variantClasses && node.props) {
    for (const [propName, variants] of Object.entries(def.variantClasses)) {
      const propValue = node.props[propName];
      if (propValue && variants[propValue]) {
        classNames += ' ' + variants[propValue];
      }
    }
  }

  // Boolean classes (boolean props that add a class when true)
  if (def.booleanClasses && node.props) {
    for (const [propName, className] of Object.entries(def.booleanClasses)) {
      if (node.props[propName]) {
        classNames += ' ' + className;
      }
    }
  }

  // For ListComponent: swap list-disc for list-decimal if ordered
  if (def.isList && node.props && node.props.ordered) {
    classNames = classNames.replace('list-disc', 'list-decimal');
  }

  if (classNames.trim()) {
    jsxProps.push(t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral(classNames.trim())));
  }

  // ---------- Build combined style attribute ----------

  const styleAttr = buildStyleAttribute(styleEntries);
  if (styleAttr) {
    jsxProps.push(styleAttr);
  }

  // ---------- Handle special component types ----------

  if (def.isFormField) {
    const formChildren = buildFormFieldChildren(def, node.props || {});
    children.push(...formChildren);
  }

  if (def.isAlert) {
    const alertChildren = buildAlertChildren(node.props || {});
    children.push(...alertChildren);
  }

  if (def.isAvatar) {
    const avatarChildren = buildAvatarChildren(node.props || {});
    children.push(...avatarChildren);
  }

  if (def.isList) {
    const listChildren = buildListChildren(node.props || {});
    children.push(...listChildren);
  }

  // ---------- Process Craft.js child nodes ----------

  if (node.nodes && node.nodes.length > 0) {
    node.nodes.forEach(childId => {
      const childJSX = generateJSX(nodes, childId);
      if (childJSX) children.push(childJSX);
    });
  }

  // Also check linkedNodes (used by some Craft.js canvas components)
  if (node.linkedNodes) {
    for (const linkedId of Object.values(node.linkedNodes)) {
      const linkedJSX = generateJSX(nodes, linkedId);
      if (linkedJSX) children.push(linkedJSX);
    }
  }

  // ---------- Build JSX element ----------

  const isSelfClosing = def.selfClosing || children.length === 0;
  const identifier = t.jsxIdentifier(tagName);
  const openingElement = t.jsxOpeningElement(identifier, jsxProps, isSelfClosing);
  const closingElement = isSelfClosing ? null : t.jsxClosingElement(identifier);

  return t.jsxElement(openingElement, closingElement, isSelfClosing ? [] : children, isSelfClosing);
}

// ============================================================
// API Routes
// ============================================================

app.post('/api/compile', (req, res) => {
  const craftAST = req.body;
  
  try {
    const rootJSX = generateJSX(craftAST, 'ROOT');
    
    const appFunction = t.functionDeclaration(
      t.identifier('ExportedApp'),
      [],
      t.blockStatement([
        t.returnStatement(rootJSX)
      ])
    );
    
    const file = t.file(t.program([
      t.importDeclaration([t.importDefaultSpecifier(t.identifier('React'))], t.stringLiteral('react')),
      appFunction,
      t.exportDefaultDeclaration(t.identifier('ExportedApp'))
    ]));
    
    const output = generate(file, {}, '').code;
    
    res.json({ code: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Compiler API running on port 3001'));
