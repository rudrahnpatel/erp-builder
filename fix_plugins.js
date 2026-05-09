const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/(dashboard)/plugins/page.tsx');
let content = fs.readFileSync(file, 'utf-8');

// 1. Add DynamicIcon import
content = content.replace(
  'import { RiMessage3Line',
  'import { DynamicIcon } from "@/components/ui/DynamicIcon";\nimport { RiMessage3Line'
);

// 2. Replace the accentColor ternary to include whatsapp
content = content.replace(
  /plugin\.icon === "message-circle" \? "emerald" :/g,
  'plugin.icon === "whatsapp" ? "emerald" :\n            plugin.icon === "message-circle" ? "emerald" :'
);

// 3. Replace iconMap reference with DynamicIcon
content = content.replace(
  /\{iconMap\[plugin\.icon\] \|\| <RiEqualizerLine className="h-5 w-5" \/>\}/g,
  '<DynamicIcon name={plugin.icon} className="h-5 w-5" />'
);

fs.writeFileSync(file, content);
console.log('Fixed plugins page');
