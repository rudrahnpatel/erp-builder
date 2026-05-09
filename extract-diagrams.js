const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputFilePath = path.join(__dirname, '.notes', 'SYSTEM-DIAGRAMS.md');
const outputDir = path.join(__dirname, '.notes', 'diagrams');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const content = fs.readFileSync(inputFilePath, 'utf8');

// Regex to find mermaid code blocks and the preceding heading for naming
const blockRegex = /## (\d+\.\s+.*?)\n[\s\S]*?```mermaid\n([\s\S]*?)```/g;

let match;
let count = 0;

console.log('Extracting and rendering Mermaid diagrams...');

while ((match = blockRegex.exec(content)) !== null) {
  count++;
  const title = match[1].replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
  const mermaidCode = match[2].trim();
  
  const mmdFileName = `${title}.mmd`;
  const pngFileName = `${title}.png`;
  const mmdFilePath = path.join(outputDir, mmdFileName);
  const pngFilePath = path.join(outputDir, pngFileName);
  
  // Write the .mmd file
  fs.writeFileSync(mmdFilePath, mermaidCode);
  console.log(`Created ${mmdFileName}`);
  
  // Render using mermaid-cli
  try {
    console.log(`Rendering ${pngFileName}...`);
    // use a white background for better visibility if required, or transparent
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdFilePath}" -o "${pngFilePath}" -b white`, { stdio: 'inherit' });
    console.log(`Successfully generated ${pngFileName}`);
  } catch (err) {
    console.error(`Failed to generate ${pngFileName}:`, err.message);
  }
}

console.log(`\nFinished processing ${count} diagrams. You can find the PNGs in ${outputDir}`);
