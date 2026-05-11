const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/(dashboard)/plugins/[id]/page.tsx');
let lines = fs.readFileSync(file, 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('import { UPIExecutor, PDFExecutor, TallyExecutor, SimulatedExecutor }'));
const endIndex = lines.findIndex(l => l.includes('// ── Main Plugin Config Page ──'));

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex + 1, endIndex - startIndex - 1);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Done cleaning up dashboard page.tsx');
} else {
  console.log('Could not find markers');
}
