const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend/src/components/Encargos.jsx');
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Helper: find line index containing exact text
function findLine(text, startFrom = 0) {
    for (let i = startFrom; i < lines.length; i++) {
        if (lines[i].includes(text)) return i;
    }
    return -1;
}

// 1. Fix PedidosTab: remove wrapper function, keep content
let pedidosStart = findLine('// === TAB: PEDIDOS ===');
let pedidosArrow = findLine('const PedidosTab = () => {', pedidosStart);
let pedidosReturn = findLine('return (', pedidosArrow);
let pedidosDiv = findLine('<div>', pedidosReturn);

// Replace lines from "// === TAB: PEDIDOS ===" to the opening <div>
// We want to keep the filter logic but remove the function wrapper
lines[pedidosStart] = '    // === TAB: PEDIDOS ===';
lines[pedidosArrow] = '    // (filter logic for pedidos search)';
// Keep the filter lines as-is (they're just variable declarations)
// Remove "return (" and the opening <div> - we'll add them in the render section
lines[pedidosReturn] = '';
lines[pedidosDiv] = '';

// Find end of PedidosTab: "    };" after the closing </div>
let pedidosEndDiv = findLine('            </div>', pedidosReturn); // first </div> closes the inner content div
// Actually let's find the closing pattern: "    };" after ArchivoTab comment
let archivoComment = findLine('// === TAB: ARCHIVO ===');
// The "    };" before ArchivoTab closes PedidosTab
let pedidosClose = archivoComment - 1;
while (pedidosClose > 0 && lines[pedidosClose].trim() === '') pedidosClose--;
// pedidosClose should be "    };"
if (lines[pedidosClose].trim() === '};') {
    lines[pedidosClose] = ''; // remove closing };
}
// Also remove the ");" before that
let pedidosCloseParen = pedidosClose - 1;
while (pedidosCloseParen > 0 && lines[pedidosCloseParen].trim() === '') pedidosCloseParen--;
if (lines[pedidosCloseParen].trim() === ');') {
    lines[pedidosCloseParen] = ''; // remove );
}

// 2. Fix ArchivoTab similarly
let archivoArrow = findLine('const ArchivoTab = () => {', archivoComment);
let archivoReturn = findLine('return (', archivoArrow);
let archivoDiv = findLine('<div>', archivoReturn);

lines[archivoComment] = '    // === TAB: ARCHIVO ===';
lines[archivoArrow] = '    // (filter logic for archivo search)';
lines[archivoReturn] = '';
lines[archivoDiv] = '';

// Find end of ArchivoTab
let catalogoComment = findLine('// === TAB: CATÁLOGO ===');
let archivoClose = catalogoComment - 1;
while (archivoClose > 0 && lines[archivoClose].trim() === '') archivoClose--;
if (lines[archivoClose].trim() === '};') {
    lines[archivoClose] = '';
}
let archivoCloseParen = archivoClose - 1;
while (archivoCloseParen > 0 && lines[archivoCloseParen].trim() === '') archivoCloseParen--;
if (lines[archivoCloseParen].trim() === ');') {
    lines[archivoCloseParen] = '';
}

// 3. Now fix the render section: replace <PedidosTab /> with inline JSX
let renderPedidos = findLine("{tab === 'pedidos' && <PedidosTab />");
if (renderPedidos >= 0) {
    lines[renderPedidos] = "            {tab === 'pedidos' && (<div>";
    // We need to find where to close it. After rendering all pedidos content.
    // The content is between the filter and the closing </div>
    // Let's insert closing tags after the pedidos content
}

let renderCatalogo = findLine("{tab === 'catalogo' && <CatalogoTab />");
let renderStock = findLine("{tab === 'stock' && <StockTab />");
let renderArchivo = findLine("{tab === 'archivo' && <ArchivoTab />");

// Actually, let's take a simpler approach. Let me just do targeted string replacements.
let content = lines.join('\n');

// Replace PedidosTab definition wrapper
content = content.replace(
    '    // === TAB: PEDIDOS ===\n    // (filter logic for pedidos search)\n',
    '    // === TAB: PEDIDOS ===\n'
);

content = content.replace(
    '    // === TAB: ARCHIVO ===\n    // (filter logic for archivo search)\n',
    '    // === TAB: ARCHIVO ===\n'
);

// Replace render calls
content = content.replace(
    "{tab === 'pedidos' && <PedidosTab />}",
    "{tab === 'pedidos' && (\n            <div>\n                {/* Pedidos search + list rendered inline */}\n                {(() => {\n                    const filteredPedidos2 = pedidos.filter(p => {\n                        if (!searchQuery) return true;\n                        const term = searchQuery.toLowerCase();\n                        return (p.cliente && p.cliente.toLowerCase().includes(term)) ||\n                            (p.telefono && p.telefono.includes(term));\n                    });\n                    return null;\n                })()}\n            </div>\n            )}"
);

// Hmm this approach is getting too complex. Let me just do the simplest possible fix.
// Revert everything and just do ONE thing: add React.memo or useMemo.

console.log("Aborting complex approach - will use simpler fix");
process.exit(0);
