const express = require('express');
const cors = require('cors');
const t = require('@babel/types');
const generate = require('@babel/generator').default;
const registry = require('./component-registry');

const app = express();
app.use(cors());
app.use(express.json());

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
 */
function buildFormFieldChildren(def, nodeProps) {
  const children = [];
  const fieldTag = def.formFieldTag; // 'input', 'textarea', or 'select'

  // Label
  if (nodeProps.label) {
    const labelEl = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('label'), [
        t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('text-sm font-medium text-gray-700')),
      ], false),
      t.jsxClosingElement(t.jsxIdentifier('label')),
      [t.jsxText(nodeProps.label)],
      false
    );
    children.push(labelEl);
  }

  // Build field attributes
  const fieldAttrs = [
    t.jsxAttribute(t.jsxIdentifier('className'),
      t.stringLiteral('w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500')),
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
    // Build <select> with <option> children
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
    // Self-closing <input />
    const inputEl = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('input'), fieldAttrs, true),
      null,
      [],
      true
    );
    children.push(inputEl);
  } else {
    // <textarea>...</textarea>
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
      // Will be merged into the main className below
      continue;
    }
  }

  // ---------- Build className from baseClasses + variantClasses ----------

  let classNames = (def.baseClasses || '').trim();

  if (def.variantClasses && node.props) {
    for (const [propName, variants] of Object.entries(def.variantClasses)) {
      const propValue = node.props[propName];
      if (propValue && variants[propValue]) {
        classNames += ' ' + variants[propValue];
      }
    }
  }

  // Handle fullWidth for Button
  if (typeName === 'Button' && node.props && node.props.fullWidth) {
    classNames += ' w-full';
  }

  // Handle shadow for Container/Card (Tailwind shadow classes)
  if (node.props && node.props.shadow && node.props.shadow !== 'none') {
    const shadowMap = { sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl' };
    classNames += ' ' + (shadowMap[node.props.shadow] || '');
  }

  if (classNames.trim()) {
    jsxProps.push(t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral(classNames.trim())));
  }

  // ---------- Build combined style attribute ----------

  const styleAttr = buildStyleAttribute(styleEntries);
  if (styleAttr) {
    jsxProps.push(styleAttr);
  }

  // ---------- Handle form field components ----------

  if (def.isFormField) {
    const formChildren = buildFormFieldChildren(def, node.props || {});
    children.push(...formChildren);
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
