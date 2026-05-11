const fs = require('fs');
const file = 'src/app/(dashboard)/plugins/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldBlock = /const accentColor = `var\(--accent-\$\{[\s\S]*?\}\)`;/;

const newBlock = `const accentColor = \`var(--accent-\${
            plugin.icon === "whatsapp"        ? "emerald" :
            plugin.icon === "message-circle"  ? "emerald" :
            plugin.icon === "message-square"  ? "blue"    :
            plugin.icon === "fingerprint"     ? "blue"    :
            plugin.icon === "file-check"      ? "violet"  :
            plugin.icon === "file-text"       ? "amber"   :
            plugin.icon === "mail"            ? "amber"   :
            plugin.icon === "calendar-off"    ? "rose"    :
            plugin.icon === "credit-card"     ? "cyan"    :
            plugin.icon === "smartphone"      ? "cyan"    :
            plugin.icon === "table"           ? "emerald" :
            plugin.icon === "database"        ? "violet"  :
            plugin.icon === "truck"           ? "amber"   :
            "primary"
          })\``;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(file, content);
console.log('Done!');
