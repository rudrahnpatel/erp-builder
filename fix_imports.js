const fs = require('fs');
const path = require('path');

const additionalMapping = {
  "Lock": "RiLockLine",
  "Calendar": "RiCalendarLine",
  "CalendarIcon": "RiCalendarLine",
  "Image": "RiImageLine",
  "ImageIcon": "RiImageLine",
  "LucideProps": "null", // ignore
  
  "AlertCircle": "RiErrorWarningLine",
  "Check": "RiCheckLine",
  "Pencil": "RiPencilLine",
  "Phone": "RiPhoneLine",
  "ScrollText": "RiFileListLine", 
  "RotateCcw": "RiRestartLine",
  "Rocket": "RiRocketLine",
  "Settings2": "RiEqualizerLine",
  "MessageCircle": "RiMessage3Line",
  "Fingerprint": "RiFingerprintLine",
  "FileCheck": "RiFileCheckLine",
  "CalendarOff": "RiCalendarCloseLine",
  "CreditCard": "RiBankCardLine",
  "UserPlus": "RiUserAddLine",
  "Smartphone": "RiSmartphoneLine",
  "Table": "RiTableLine",
  "CalendarDays": "RiCalendarEventLine",
  "ShieldAlert": "RiShieldKeyholeLine",
  "SlidersHorizontal": "RiListSettingsLine",
  "Rows3": "RiLayoutRowLine",
  "CircleDot": "RiFocus3Line",
  "MessageSquare": "RiMessage2Line",
  "Copy": "RiFileCopyLine",
  "Edit": "RiEdit2Line",
  "XCircle": "RiCloseCircleLine",
  "Link2": "RiLinkLine",
  "Wrench": "RiToolsLine",
  "GitBranch": "RiGitBranchLine",
  "Info": "RiInformationLine",
  "Type": "RiText",
  "Code": "RiCodeLine",
  "PanelLeftClose": "RiLayoutLeft2Line",
  "PanelLeftOpen": "RiLayoutLeftLine",
  "PanelRightClose": "RiLayoutRight2Line",
  "PanelRightOpen": "RiLayoutRightLine",
  "Camera": "RiCameraLine",
  "GlobeLock": "RiEarthLockLine", 
  "UserX": "RiUserUnfollowLine",
  "UserCheck": "RiUserFollowLine",
  "CheckCircle": "RiCheckDoubleLine"
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = path.join(__dirname, 'src');

walkDir(targetDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace unmapped icons globally
    let modified = content;
    for (const [orig, riName] of Object.entries(additionalMapping)) {
      if (riName !== "null") {
        const regexUsage = new RegExp(`\\b${orig}\\b(?!\\s*as)`, 'g');
        const regexTagStart = new RegExp(`<${orig}(\\s|>)`, 'g');
        const regexTagEnd = new RegExp(`</${orig}>`, 'g');
        modified = modified.replace(regexTagStart, `<${riName}$1`);
        modified = modified.replace(regexTagEnd, `</${riName}>`);
        modified = modified.replace(regexUsage, riName);
      }
    }

    // Now fix the imports
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g;
    
    let finalContent = modified;
    let match;
    const replacements = [];

    while ((match = importRegex.exec(modified)) !== null) {
      const fullImport = match[0];
      const importsList = match[1].split(',').map(s => s.trim()).filter(Boolean);
      
      const riImports = new Set();
      const lucideImports = new Set();
      
      importsList.forEach(imp => {
        let cleanName = imp.split(/\s+as\s+/).pop().trim();
        
        if (cleanName.startsWith('Ri') && cleanName !== 'Right' && cleanName !== 'Ring') {
          riImports.add(cleanName);
        } else if (cleanName === 'LucideProps') {
          lucideImports.add(imp);
        } else {
          lucideImports.add(imp);
        }
      });
      
      let newImportStmt = '';
      if (riImports.size > 0) {
        newImportStmt += `import { ${Array.from(riImports).join(', ')} } from "react-icons/ri";\n`;
      }
      if (lucideImports.size > 0) {
        newImportStmt += `import { ${Array.from(lucideImports).join(', ')} } from "lucide-react";\n`;
      }
      
      replacements.push({
        fullImport,
        newImportStmt: newImportStmt.trim()
      });
    }
    
    replacements.forEach(rep => {
      finalContent = finalContent.replace(rep.fullImport, rep.newImportStmt);
    });

    if (finalContent !== content) {
      fs.writeFileSync(filePath, finalContent, 'utf-8');
      console.log(`Fixed imports in ${filePath}`);
    }
  }
});
