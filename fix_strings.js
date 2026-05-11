const fs = require('fs');
const path = require('path');
const mappings = {
  'RiSearchLine': 'Search',
  'RiFilter3Line': 'Filter',
  'RiHome4Line': 'Home',
  'RiPulseLine': 'Activity',
  'RiLockLine': 'Lock',
  'RiCodeLine': 'Code',
  'RiTableLine': 'Table',
  'RiCalendarLine': 'Calendar',
  'RiImageLine': 'Image',
  'RiText': 'Type',
  'RiCameraLine': 'Camera',
  'RiLinkLine': 'Link',
  'RiSaveLine': 'Save',
  'RiInformationLine': 'Info',
  'RiRocketLine': 'Rocket',
  'RiDeleteBinLine': 'Delete'
};

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      let content = fs.readFileSync(dirPath, 'utf-8');
      let changed = false;
      
      for (const [bad, good] of Object.entries(mappings)) {
        // Fix plain text inside strings, comments, JSX text
        
        const regex1 = new RegExp('([\\"\'' + '\\`\\\\]|placeholder=)' + bad, 'g');
        content = content.replace(regex1, '$1' + good);
        
        const regex2 = new RegExp(bad + '([\\"\'' + '\\`\\\\.])', 'g');
        content = content.replace(regex2, good + '$1');
        
        // Also inside generic english sentences: ' RiSearchLine ' -> ' Search '
        const regex3 = new RegExp(' ' + bad + ' ', 'g');
        content = content.replace(regex3, ' ' + good + ' ');

        // 'RiSearchLine ' at the start of string
        const regex4 = new RegExp('([\\"\'' + '\\`>])' + bad + ' ', 'g');
        content = content.replace(regex4, '$1' + good + ' ');

        const regex5 = new RegExp(' ' + bad + '([\\"\'' + '\\`<])', 'g');
        content = content.replace(regex5, ' ' + good + '$1');
        
        const regex6 = new RegExp('([>])' + bad + '([<])', 'g');
        content = content.replace(regex6, '$1' + good + '$2');
        
        // Clear RiSearchLine
        const regex7 = new RegExp('Clear ' + bad, 'g');
        content = content.replace(regex7, 'Clear ' + good);
      }
      
      if (fs.readFileSync(dirPath, 'utf-8') !== content) {
        fs.writeFileSync(dirPath, content, 'utf-8');
        console.log('Fixed', f);
      }
    }
  });
}
walkDir(path.join(__dirname, 'src'));
