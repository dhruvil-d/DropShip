const express = require('express');
const cors = require('cors');
const t = require('@babel/types');
const generate = require('@babel/generator').default;

const app = express();
app.use(cors());
app.use(express.json());

function generateJSX(nodes, nodeId) {
  const node = nodes[nodeId];
  if (!node) return null;

  const typeName = node.type.resolvedName || node.type.name || node.type;
  
  // Mapping Craft types to HTML/Tailwind for preview
  let tagName = 'div';
  if (typeName === 'Text') tagName = 'p';
  if (typeName === 'Button') tagName = 'button';
  
  const children = [];
  const props = [];

  // Handle props mapping
  for (const [key, value] of Object.entries(node.props || {})) {
    if (typeName === 'Text' && key === 'text') {
      // Text nodes have their content as children
      children.push(t.jsxText(value));
    } else if (key === 'background') {
      props.push(t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(
        t.objectExpression([t.objectProperty(t.identifier('backgroundColor'), t.stringLiteral(value))])
      )));
    } else if (key === 'padding') {
      // Tailwind classes or inline styles
      props.push(t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(
        t.objectExpression([t.objectProperty(t.identifier('padding'), t.stringLiteral(`${value}px`))])
      )));
    } else if (key === 'fontSize') {
      props.push(t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(
        t.objectExpression([t.objectProperty(t.identifier('fontSize'), t.stringLiteral(`${value}px`))])
      )));
    } else if (typeName === 'Button' && key === 'text') {
      children.push(t.jsxText(value));
    } else {
      props.push(t.jsxAttribute(
        t.jsxIdentifier(key),
        typeof value === 'string' ? t.stringLiteral(value) : t.jsxExpressionContainer(t.stringLiteral(String(value)))
      ));
    }
  }

  // Tailwind generic classes for preview
  if (typeName === 'Container') {
    props.push(t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('min-h-[50px]')));
  } else if (typeName === 'Button') {
    props.push(t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('px-4 py-2 rounded bg-blue-600 text-white font-medium')));
  }

  if (node.nodes && node.nodes.length > 0) {
    node.nodes.forEach(childId => {
      const childJSX = generateJSX(nodes, childId);
      if (childJSX) children.push(childJSX);
    });
  }

  const identifier = t.jsxIdentifier(tagName);
  const openingElement = t.jsxOpeningElement(identifier, props, children.length === 0);
  const closingElement = children.length === 0 ? null : t.jsxClosingElement(identifier);

  return t.jsxElement(openingElement, closingElement, children, children.length === 0);
}

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
