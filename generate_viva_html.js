const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const inputDir = path.join(__dirname, '.viva-notes');
const outputFile = path.join(__dirname, 'viva-notes.html');

// Read all markdown files
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.md')).sort();

let combinedMarkdown = '# ERP Builder - Comprehensive Viva Notes\n\n';

for (const file of files) {
  const content = fs.readFileSync(path.join(inputDir, file), 'utf8');
  combinedMarkdown += `\n<div class="page-break"></div>\n\n` + content + '\n\n';
}

// Custom renderer to pass mermaid blocks untouched
const renderer = new marked.Renderer();
renderer.code = function({text, lang}) {
  if (lang === 'mermaid') {
    return `<div class="mermaid">${text}</div>`;
  }
  return `<pre><code class="language-${lang}">${text}</code></pre>`;
};

marked.use({ renderer });

const bodyHtml = marked.parse(combinedMarkdown);

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERP Builder - Viva Notes</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        h1 { color: #111; border-bottom: 2px solid #eaecef; padding-bottom: .3em; }
        h2 { color: #222; margin-top: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em;}
        h3 { color: #333; margin-top: 1.5em; }
        p { margin-top: 0; margin-bottom: 16px; }
        code { background-color: rgba(27,31,35,.05); border-radius: 3px; font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace; font-size: 85%; margin: 0; padding: .2em .4em; }
        pre { background-color: #f6f8fa; border-radius: 3px; font-size: 85%; line-height: 1.45; overflow: auto; padding: 16px; }
        pre code { background-color: transparent; border: 0; display: inline; line-height: inherit; margin: 0; max-width: auto; overflow: visible; padding: 0; word-wrap: normal; }
        blockquote { border-left: .25em solid #dfe2e5; color: #6a737d; margin: 0 0 16px; padding: 0 1em; background-color: #f8f9fa; padding-top: 10px; padding-bottom: 10px; border-radius: 0 8px 8px 0;}
        .mermaid { margin: 20px 0; text-align: center; }
        @media print {
            .page-break { page-break-before: always; }
            body { max-width: 100%; padding: 0; margin: 0; }
            a { text-decoration: none; color: black; }
        }
    </style>
    <!-- Include Mermaid.js for rendering diagrams -->
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</head>
<body>
    ${bodyHtml}
</body>
</html>
`;

fs.writeFileSync(outputFile, htmlTemplate);
console.log(`Generated HTML at: ${outputFile}`);
