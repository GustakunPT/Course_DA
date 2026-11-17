import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');

const mockupsDir = path.resolve(webRoot, '..', 'docs', 'mockups');
const mockupsHtmlPath = path.join(mockupsDir, 'mockups.html');
const svgDir = mockupsDir;

console.log('Testing Mockups in:', mockupsDir);

// 1. Check HTML file exists
if (!fs.existsSync(mockupsHtmlPath)) {
  console.error('FAIL: docs/mockups/mockups.html missing');
  process.exit(1);
}

const html = fs.readFileSync(mockupsHtmlPath, 'utf8');

// 2. Syntax validation
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    new Function(scriptMatch[1]);
    console.log('✓ PASS: JavaScript syntax valid');
  } catch (err) {
    console.error('FAIL: JavaScript syntax error:', err.message);
    process.exit(1);
  }
} else {
  console.error('FAIL: No script tag in mockups.html');
  process.exit(1);
}

// 3. Structural checks
const checks = [
  ['Nordic Studio style present', html.includes('Nordic Studio')],
  ['Glassmorphic style present', html.includes('Glassmorphic')],
  ['Terminal Pro style present', html.includes('Terminal Pro')],
  ['Flow 1 (Roadmap) present', html.includes('view-roadmap')],
  ['Flow 2 (Theory) present', html.includes('view-theory')],
  ['Flow 3 (Workbench) present', html.includes('view-workbench')],
  ['Flow 4 (Explorer) present', html.includes('view-explorer')],
  ['6 Tracks represented', ['python', 'sql', 'pandas', 'git', 'bi', 'carreira'].every(t => html.includes(t))],
  ['Quick Symbol Touch Bar present', html.includes('m-symbol-bar')],
  ['Segmented View Switcher present', html.includes('m-segmented-switcher')],
  ['Dynamic Island present', html.includes('dynamic-island')],
  ['Realistic Status Bar present', html.includes('device-status-bar')],
  ['Device presets (SE, 15, Pro Max, Fluid)', ['iphone-se', 'iphone-15', 'iphone-16-promax', 'fluid'].every(p => html.includes(p))],
];

for (const [desc, ok] of checks) {
  if (ok) {
    console.log(`✓ PASS: ${desc}`);
  } else {
    console.error(`✗ FAIL: ${desc}`);
    process.exit(1);
  }
}

// 4. Verify 5 SVG mockups exist
const expectedSvgs = [
  '01_nordic_roadmap.svg',
  '02_nordic_theory_reader.svg',
  '03_glassmorphic_workbench.svg',
  '04_terminal_explorer.svg',
  '05_style_comparison_matrix.svg',
];

for (const svg of expectedSvgs) {
  const p = path.join(svgDir, svg);
  if (!fs.existsSync(p)) {
    console.error(`✗ FAIL: Missing SVG mockup: ${svg}`);
    process.exit(1);
  }
  const stat = fs.statSync(p);
  if (stat.size < 1000) {
    console.error(`✗ FAIL: SVG mockup ${svg} too small (${stat.size} bytes)`);
    process.exit(1);
  }
  console.log(`✓ PASS: SVG mockup ${svg} exists (${stat.size} bytes)`);
}

console.log('All mockups verification tests PASSED with 100% success.');
