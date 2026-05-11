const fs = require('fs');
const path = require('path');

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() && !['node_modules', '.next'].includes(e.name)
      ? walk(path.join(d, e.name))
      : [path.join(d, e.name)]
  );
}

// Names that are NOT valid react-icons/ri exports but might appear as imports
const badNames = ['Lock', 'Rocket', 'Calendar', 'Delete', 'Activity', 'Filter', 'Image', 'Table', 'Search', 'Mail'];

walk('src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).forEach(f => {
  const text = fs.readFileSync(f, 'utf8');
  if (!text.includes('react-icons/ri')) return;
  // Match any import { ..., BadName, ... } from "react-icons/ri" pattern
  const importMatches = text.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']react-icons\/ri["']/g);
  for (const m of importMatches) {
    const names = m[1].split(',').map(n => n.trim());
    const found = names.filter(n => badNames.includes(n));
    if (found.length) {
      console.log(`BAD IMPORT in ${f}: ${found.join(', ')}`);
    }
  }
});
