require('dotenv').config();
const express = require('express');
const cors = require('cors');
const t = require('@babel/types');
const generate = require('@babel/generator').default;
const registry = require('./component-registry');
const { processAiChat, processAiChatStream } = require('./aiHandler');

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

  // Label is now handled via linkedNodes in Craft.js

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

// Table builder removed since Table is now composable

function buildCarouselChildren(props) {
  const children = [];
  const imagesProp = props.images;
  let images = [];
  try {
    images = typeof imagesProp === 'string' ? JSON.parse(imagesProp) : (Array.isArray(imagesProp) ? imagesProp : []);
  } catch(e) {}

  const objectFit = props.objectFit || 'fill';
  const showDots = props.showDots !== false;
  
  if (images.length === 0) return children;

  // The carousel is output as a CSS scroll-snap container so it functions without JS.
  const containerStyle = t.objectExpression([
    t.objectProperty(t.identifier('display'), t.stringLiteral('flex')),
    t.objectProperty(t.identifier('overflowX'), t.stringLiteral('auto')),
    t.objectProperty(t.identifier('scrollSnapType'), t.stringLiteral('x mandatory')),
    t.objectProperty(t.identifier('scrollBehavior'), t.stringLiteral('smooth')),
    t.objectProperty(t.identifier('height'), t.stringLiteral('100%')),
    t.objectProperty(t.identifier('width'), t.stringLiteral('100%')),
    t.objectProperty(t.identifier('scrollbarWidth'), t.stringLiteral('none')) // Hide scrollbar in firefox
  ]);

  const slideStyle = t.objectExpression([
    t.objectProperty(t.identifier('flex'), t.stringLiteral('0 0 100%')),
    t.objectProperty(t.identifier('scrollSnapAlign'), t.stringLiteral('start')),
    t.objectProperty(t.identifier('width'), t.stringLiteral('100%')),
    t.objectProperty(t.identifier('height'), t.stringLiteral('100%'))
  ]);

  const imgStyle = t.objectExpression([
    t.objectProperty(t.identifier('width'), t.stringLiteral('100%')),
    t.objectProperty(t.identifier('height'), t.stringLiteral('100%')),
    t.objectProperty(t.identifier('objectFit'), t.stringLiteral(objectFit))
  ]);

  const slides = images.map((img, idx) => {
    return t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('div'), [
        t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral(`carousel-slide-${img.id || idx}`)),
        t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(slideStyle))
      ]),
      t.jsxClosingElement(t.jsxIdentifier('div')),
      [
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier('img'), [
            t.jsxAttribute(t.jsxIdentifier('src'), t.stringLiteral(img.url)),
            t.jsxAttribute(t.jsxIdentifier('alt'), t.stringLiteral(img.alt || '')),
            t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(imgStyle))
          ], true),
          null,
          [],
          true
        )
      ]
    );
  });

  const track = t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier('div'), [
      t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(containerStyle)),
      t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('hide-scrollbar'))
    ]),
    t.jsxClosingElement(t.jsxIdentifier('div')),
    slides
  );
  
  children.push(track);

  // Dots
  if (showDots && images.length > 1) {
    const dotsContainerStyle = t.objectExpression([
      t.objectProperty(t.identifier('position'), t.stringLiteral('absolute')),
      t.objectProperty(t.identifier('bottom'), t.stringLiteral('12px')),
      t.objectProperty(t.identifier('left'), t.stringLiteral('50%')),
      t.objectProperty(t.identifier('transform'), t.stringLiteral('translateX(-50%)')),
      t.objectProperty(t.identifier('display'), t.stringLiteral('flex')),
      t.objectProperty(t.identifier('gap'), t.stringLiteral('6px'))
    ]);

    const dotElements = images.map((img, idx) => {
      const dotStyle = t.objectExpression([
        t.objectProperty(t.identifier('width'), t.stringLiteral('8px')),
        t.objectProperty(t.identifier('height'), t.stringLiteral('8px')),
        t.objectProperty(t.identifier('borderRadius'), t.stringLiteral('50%')),
        t.objectProperty(t.identifier('backgroundColor'), t.stringLiteral('rgba(255,255,255,0.7)'))
      ]);

      return t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('a'), [
          t.jsxAttribute(t.jsxIdentifier('href'), t.stringLiteral(`#carousel-slide-${img.id || idx}`)),
          t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(dotStyle))
        ]),
        t.jsxClosingElement(t.jsxIdentifier('a')),
        []
      );
    });

    const dotsWrapper = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('div'), [
        t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(dotsContainerStyle))
      ]),
      t.jsxClosingElement(t.jsxIdentifier('div')),
      dotElements
    );
    children.push(dotsWrapper);
  }

  // Add global style for hiding scrollbar if it doesn't exist
  children.push(
    t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('style'), [
        t.jsxAttribute(
          t.jsxIdentifier('dangerouslySetInnerHTML'),
          t.jsxExpressionContainer(
            t.objectExpression([
              t.objectProperty(
                t.identifier('__html'),
                t.stringLiteral('.hide-scrollbar::-webkit-scrollbar { display: none; }')
              )
            ])
          )
        )
      ], true),
      null,
      [],
      true
    )
  );

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
      const textValue = String(value);
      const hasHTML = /<[a-z][\s\S]*>/i.test(textValue);

      if (def.richText && hasHTML) {
        // Rich text: output dangerouslySetInnerHTML={{ __html: "..." }}
        jsxProps.push(
          t.jsxAttribute(
            t.jsxIdentifier('dangerouslySetInnerHTML'),
            t.jsxExpressionContainer(
              t.objectExpression([
                t.objectProperty(
                  t.identifier('__html'),
                  t.stringLiteral(textValue)
                )
              ])
            )
          )
        );
      } else {
        // Plain text: output as JSX text child
        children.push(t.jsxText(textValue));
      }
      continue;
    }

    if (behavior.type === 'style') {
      let finalValue = value;
      // Special case: TableCell borders
      if (typeName === 'TableCell' && behavior.cssProp === 'borderWidth') {
        continue; // Handled below
      }
      if (typeName === 'TableCell' && behavior.cssProp === 'borderColor') {
        continue; // Handled below
      }

      styleEntries.push({
        cssProp: behavior.cssProp,
        value: finalValue,
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

  // TableCell specific styling combining borderWidth and borderColor
  if (typeName === 'TableCell' && node.props) {
    const width = node.props.borderWidth !== undefined ? node.props.borderWidth : 1;
    const color = node.props.borderColor || '#e5e7eb';
    styleEntries.push({
      cssProp: 'border',
      value: `${width}px solid ${color}`,
      suffix: ''
    });
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

  // ---------- Process Craft.js child nodes ----------

  if (node.nodes && node.nodes.length > 0) {
    node.nodes.forEach(childId => {
      const childJSX = generateJSX(nodes, childId);
      if (childJSX) children.push(childJSX);
    });
  }

  // Also check linkedNodes (used by some Craft.js canvas components)
  // We process linkedNodes BEFORE form fields so labels appear above inputs
  if (node.linkedNodes) {
    for (const linkedId of Object.values(node.linkedNodes)) {
      const linkedJSX = generateJSX(nodes, linkedId);
      if (linkedJSX) children.push(linkedJSX);
    }
  }

  // ---------- Handle special component types ----------

  if (def.isFormField) {
    const formChildren = buildFormFieldChildren(def, node.props || {});
    children.push(...formChildren);
  }

  if (def.isAlert) {
    // Alert children are now handled via linkedNodes
  }

  if (def.isAvatar) {
    const avatarChildren = buildAvatarChildren(node.props || {});
    children.push(...avatarChildren);
  }

  if (def.isList) {
    const listChildren = buildListChildren(node.props || {});
    children.push(...listChildren);
  }

  if (def.isCarousel) {
    const carouselChildren = buildCarouselChildren(node.props || {});
    children.push(...carouselChildren);
  }

  // If table is responsive, wrap it in overflow-x-auto
  if (typeName === 'Table' && node.props && node.props.responsive !== false) {
    const wrapper = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('div'), [
        t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('overflow-x-auto max-w-full w-full'))
      ]),
      t.jsxClosingElement(t.jsxIdentifier('div')),
      [
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier(tagName), jsxProps),
          t.jsxClosingElement(t.jsxIdentifier(tagName)),
          children
        )
      ]
    );
    return wrapper;
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

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, currentState, selectedNodeId, selectedNodeName } = req.body;
    if (!prompt || !currentState) {
      return res.status(400).json({ error: "Missing prompt or currentState" });
    }

    // Detect undo/redo intent on the server so the frontend can handle it locally
    const lower = prompt.toLowerCase().trim();
    const undoPatterns = ['undo', 'undo that', 'go back', 'revert', 'reverse that', 'ctrl+z', 'ctrl z'];
    const redoPatterns = ['redo', 'redo that', 'go forward', 'ctrl+y', 'ctrl y'];
    if (undoPatterns.includes(lower)) {
      return res.json({ action: 'undo', message: "Done! I've undone the last change." });
    }
    if (redoPatterns.includes(lower)) {
      return res.json({ action: 'redo', message: "Done! I've redone the last change." });
    }

    const currentStateStr = typeof currentState === 'string' ? currentState : JSON.stringify(currentState);
    const result = await processAiChat(prompt, currentStateStr, selectedNodeId, selectedNodeName);
    res.json(result);
  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// SSE streaming endpoint
app.post('/api/ai/chat/stream', async (req, res) => {
  try {
    const { prompt, currentState, selectedNodeId, selectedNodeName } = req.body;
    if (!prompt || !currentState) {
      res.status(400).json({ error: "Missing prompt or currentState" });
      return;
    }

    // Detect undo/redo intent — respond immediately, no AI call needed
    const lower = prompt.toLowerCase().trim();
    const undoPatterns = ['undo', 'undo that', 'go back', 'revert', 'reverse that', 'ctrl+z', 'ctrl z'];
    const redoPatterns = ['redo', 'redo that', 'go forward', 'ctrl+y', 'ctrl y'];
    if (undoPatterns.includes(lower)) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*' });
      res.write(`data: ${JSON.stringify({ type: 'done', action: 'undo', message: "Done! I've undone the last change." })}\n\n`);
      res.end();
      return;
    }
    if (redoPatterns.includes(lower)) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*' });
      res.write(`data: ${JSON.stringify({ type: 'done', action: 'redo', message: "Done! I've redone the last change." })}\n\n`);
      res.end();
      return;
    }

    const currentStateStr = typeof currentState === 'string' ? currentState : JSON.stringify(currentState);
    await processAiChatStream(prompt, currentStateStr, selectedNodeId, selectedNodeName, res);
  } catch (err) {
    console.error("AI Chat Stream Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.listen(3001, () => console.log('Compiler API running on port 3001'));

