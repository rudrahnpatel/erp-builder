const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Replacements specifically requested:
  const map = {
    'RiCheckLine': 'Check',
    'RiPhoneLine': 'Phone',
    'RiSettings4Line': 'Settings',
    'RiEdit2Line': 'Edit',
    'RiFilter3Line': 'Filter'
  };

  newContent = newContent.replace(/\b(RiCheckLine|RiPhoneLine|RiSettings4Line|RiEdit2Line|RiFilter3Line)\b/g, (match, p1, offset, string) => {
    const before = string.substring(Math.max(0, offset - 30), offset);
    const after = string.substring(offset + match.length, Math.min(string.length, offset + match.length + 30));
    
    // Ignore imports
    if (before.includes('import ') || after.includes('from ') || before.match(/\{\s*([^}]*,)?\s*$/)) {
      return match;
    }
    // Ignore JSX tags
    if (before.endsWith('<') || before.endsWith('</') || before.endsWith('< ') || before.endsWith('</ ')) {
      return match;
    }
    // Ignore icon: RiCheckLine pattern
    if (before.match(/(icon|fallback|component|Icon):\s*$/)) {
      return match;
    }
    // Ignore [RiCheckLine, ...] pattern
    if (before.match(/\[\s*$/) && after.match(/^\s*,/)) {
      return match;
    }
    if (before.match(/,\s*$/) && after.match(/^\s*(,|\])/)) {
      return match;
    }

    // Special cases where it is an object property key: RiPhoneLine: "..."
    if (after.match(/^\s*:/)) {
      return map[match];
    }
    
    // Inside strings or JSX text
    return map[match];
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${count} files.`);
