const fs = require('fs');
const path = require('path');

const dir = 'C:/Markaz Abdullah Bin Mubarak/markaz-portal/src/app/[locale]/admin';
const files = [];

function readDir(d) {
  const items = fs.readdirSync(d, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(d, item.name);
    if (item.isDirectory()) readDir(fullPath);
    else if (item.name.endsWith('.tsx')) files.push(fullPath);
  }
}

readDir(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  const queryLimitRegex = /query\(\s*collection\(db,\s*("[^"]+")\s*\)\s*,\s*orderBy\([^)]+\)\s*,\s*limit\([^)]+\)\s*\)/g;
  content = content.replace(queryLimitRegex, 'collection(db, $1)');

  const queryRegex = /query\(\s*collection\(db,\s*("[^"]+")\s*\)\s*,\s*orderBy\([^)]+\)\s*\)/g;
  content = content.replace(queryRegex, 'collection(db, $1)');

  const mapRegex = /\.map\(\(doc:\s*any\)\s*=>\s*\(\{\s*id:\s*doc\.id,\s*\.\.\.doc\.data\(\)\s*\}\)\)/g;
  const sortedMap = `.map((doc: any) => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => {
    const timeA = a.createdAt?.seconds || a.submittedAt?.seconds || a.date || 0;
    const timeB = b.createdAt?.seconds || b.submittedAt?.seconds || b.date || 0;
    if (typeof timeA === 'string' && typeof timeB === 'string') return timeB.localeCompare(timeA);
    return timeB - timeA;
  })`;
  
  if (content !== original) {
    content = content.replace(mapRegex, sortedMap);
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
