const fs = require('fs');
const path = require('path');

const mapping = {
  "Activity": "RiPulseLine",
  "ArrowLeft": "RiArrowLeftLine",
  "ArrowRight": "RiArrowRightLine",
  "ArrowLeftRight": "RiArrowLeftRightLine",
  "ArrowUpRight": "RiArrowRightUpLine",
  "ArrowUpDown": "RiArrowUpDownLine",
  "AlertTriangle": "RiAlertLine",
  "BarChart3": "RiBarChartLine",
  "Bell": "RiNotification3Line",
  "BellRing": "RiNotification3Line",
  "Blocks": "RiLayoutGridLine",
  "Box": "RiBox3Line",
  "Briefcase": "RiBriefcaseLine",
  "Building2": "RiBuilding4Line",
  "Calculator": "RiCalculatorLine",
  "CalendarIcon": "RiCalendarLine",
  "CheckCircle2": "RiCheckDoubleLine",
  "CheckIcon": "RiCheckLine",
  "ChevronDown": "RiArrowDownSLine",
  "ChevronDownIcon": "RiArrowDownSLine",
  "ChevronLeft": "RiArrowLeftSLine",
  "ChevronRight": "RiArrowRightSLine",
  "ChevronRightIcon": "RiArrowRightSLine",
  "ChevronUp": "RiArrowUpSLine",
  "ChevronUpIcon": "RiArrowUpSLine",
  "CircleCheckIcon": "RiCheckDoubleLine",
  "Clock": "RiTimeLine",
  "Code2": "RiCodeSSlashLine",
  "Command": "RiCommandFill",
  "Database": "RiDatabase2Line",
  "Download": "RiDownloadLine",
  "Eye": "RiEyeLine",
  "EyeOff": "RiEyeOffLine",
  "ExternalLink": "RiExternalLinkLine",
  "FilePlus": "RiFileAddLine",
  "FileText": "RiFileTextLine",
  "Filter": "RiFilter3Line",
  "FolderOpen": "RiFolderOpenLine",
  "Globe": "RiGlobalLine",
  "GripVertical": "RiDraggable",
  "Handshake": "RiHandCoinLine",
  "HeartHandshake": "RiHeartPulseLine",
  "Hash": "RiHashtag",
  "HelpCircle": "RiQuestionLine",
  "Home": "RiHome4Line",
  "ImageIcon": "RiImageLine",
  "IndianRupee": "RiMoneyRupeeCircleLine",
  "InfoIcon": "RiInformationLine",
  "KeyRound": "RiKeyLine",
  "Kanban": "RiKanbanView",
  "Languages": "RiTranslate2",
  "LayoutDashboard": "RiDashboardLine",
  "LayoutTemplate": "RiLayoutLine",
  "Layers": "RiStackLine",
  "List": "RiListUnordered",
  "Loader2": "RiLoader4Line",
  "Loader2Icon": "RiLoader4Line",
  "LogIn": "RiLoginBoxLine",
  "LogOut": "RiLogoutBoxRLine",
  "Mail": "RiMailLine",
  "MapPin": "RiMapPinLine",
  "Menu": "RiMenuLine",
  "Minus": "RiSubtractLine",
  "Monitor": "RiComputerLine",
  "Moon": "RiMoonLine",
  "MoreHorizontal": "RiMoreLine",
  "Network": "RiNodeTree",
  "OctagonXIcon": "RiCloseCircleLine",
  "Package": "RiArchiveLine",
  "PackageSearch": "RiArchiveLine",
  "PenLine": "RiPencilLine",
  "Play": "RiPlayFill",
  "Plus": "RiAddLine",
  "Printer": "RiPrinterLine",
  "Puzzle": "RiPlugLine",
  "Receipt": "RiReceiptLine",
  "Save": "RiSaveLine",
  "Search": "RiSearchLine",
  "Settings": "RiSettings4Line",
  "Share2": "RiShareLine",
  "Shield": "RiShieldLine",
  "ShieldCheck": "RiShieldCheckLine",
  "ShoppingCart": "RiShoppingCartLine",
  "Sparkles": "RiSparklingLine",
  "Sun": "RiSunLine",
  "Table2": "RiTableLine",
  "Terminal": "RiTerminalBoxLine",
  "ToggleLeft": "RiToggleLine",
  "ToggleRight": "RiToggleFill",
  "Trash2": "RiDeleteBinLine",
  "TrendingDown": "RiStockDownLine",
  "TrendingUp": "RiStockLine",
  "TriangleAlertIcon": "RiAlertLine",
  "Truck": "RiTruckLine",
  "User": "RiUserLine",
  "Users": "RiGroupLine",
  "Warehouse": "RiStore3Line",
  "X": "RiCloseLine",
  "XIcon": "RiCloseLine",
  "Zap": "RiFlashlightLine"
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
    
    // Check if it has lucide-react import
    if (content.includes('lucide-react')) {
      const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g;
      
      let modified = content;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const fullImport = match[0];
        const importsList = match[1].split(',').map(s => s.trim()).filter(Boolean);
        
        const riImports = new Set();
        const leftovers = [];
        
        let fileModifications = [];
        
        importsList.forEach(imp => {
          // Handle 'Icon as AliasedIcon'
          const parts = imp.split(/\s+as\s+/);
          const origName = parts[0];
          const alias = parts[1] || origName;
          
          const riName = mapping[origName];
          if (riName) {
            riImports.add(riName);
            // We need to replace <Alias ... with <RiName ...
            if (origName !== riName) {
              const regexTagStart = new RegExp(`<${alias}(\\s|>)`, 'g');
              const regexTagEnd = new RegExp(`</${alias}>`, 'g');
              const regexUsage = new RegExp(`\\b${alias}\\b(?!\\s*as)`, 'g');
              
              fileModifications.push({ alias, riName, regexTagStart, regexTagEnd, regexUsage });
            }
          } else {
            leftovers.push(imp);
          }
        });
        
        // Execute tag replacements
        fileModifications.forEach(mod => {
          // Skip if it's dynamically used like lucideIconMap without tags
          modified = modified.replace(mod.regexTagStart, `<${mod.riName}$1`);
          modified = modified.replace(mod.regexTagEnd, `</${mod.riName}>`);
          
          // Also replace general usage (e.g., in arrays or icon= props)
          // Lookbehind/lookahead can be tricky, so we just use word boundary.
          // Wait, replacing 'Search' with 'RiSearchLine' everywhere might break variables.
          // We'll restrict to { icon: Search } or <Search />. 
          // Since it's a component, it's usually PascalCase and unique enough.
          modified = modified.replace(mod.regexUsage, mod.riName);
        });
        
        let newImportStmt = '';
        if (riImports.size > 0) {
          newImportStmt += `import { ${Array.from(riImports).join(', ')} } from "react-icons/ri";\n`;
        }
        if (leftovers.length > 0) {
          newImportStmt += `import { ${leftovers.join(', ')} } from "lucide-react";\n`;
        }
        
        modified = modified.replace(fullImport, newImportStmt.trim());
      }
      
      // We also need to handle `import * as LucideIcons from "lucide-react"`
      if (modified.includes('import * as LucideIcons')) {
        // Special case, we'll leave it or user will fix it
        console.log(`Manual intervention needed for LucideIcons * import in ${filePath}`);
      } else {
        if (modified !== content) {
          fs.writeFileSync(filePath, modified, 'utf-8');
          console.log(`Updated ${filePath}`);
        }
      }
    }
  }
});
