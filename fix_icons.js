const fs = require('fs');
const files = [
  { f: 'src/app/(dashboard)/schema/[tableId]/page.tsx', o: 'Lock', n: 'RiLockLine' },
  { f: 'src/app/apps/[slug]/[tableId]/page.tsx', o: 'Lock', n: 'RiLockLine' },
  { f: 'src/app/apps/[slug]/pages/[pageId]/page.tsx', o: 'Calendar', n: 'RiCalendarLine' },
  { f: 'src/components/blocks/FilterBar.tsx', o: 'Filter', n: 'RiFilter3Line' },
  { f: 'src/components/blocks/FilterBarView.tsx', o: 'Filter', n: 'RiFilter3Line' },
  { f: 'src/components/blocks/ImageBlock.tsx', o: 'Image', n: 'RiImageLine' },
  { f: 'src/components/landing/HowItWorks.tsx', o: 'Table', n: 'RiTableLine' },
  { f: 'src/components/layout/CommandPalette.tsx', o: 'Delete', n: 'RiDeleteBinLine' },
  { f: 'src/components/workspace/WorkspaceSkeleton.tsx', o: 'Activity', n: 'RiPulseLine' }
];
files.forEach(({ f, o, n }) => {
  try {
    let text = fs.readFileSync(f, 'utf8');
    text = text.replace(new RegExp('\\b' + o + '\\b', 'g'), n);
    fs.writeFileSync(f, text);
    console.log('Fixed', f);
  } catch (e) {
    console.error(e);
  }
});
