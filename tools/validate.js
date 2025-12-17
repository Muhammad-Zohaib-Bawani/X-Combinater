const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function walk(dir, cb) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) walk(res, cb);
    else cb(res);
  });
}

const voidElements = new Set([
  'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'
]);

const htmlFiles = [];
const jsFiles = [];

walk(root, file => {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.html') htmlFiles.push(file);
  if (ext === '.js') jsFiles.push(file);
});

let problems = [];

function checkHtml(file) {
  const content = fs.readFileSync(file, 'utf8');
  const tagRegex = /<!--([\s\S]*?)-->|<([\/?])\s*([a-zA-Z0-9-]+)([^>]*)>/g;
  const stack = [];
  let m;
  while ((m = tagRegex.exec(content)) !== null) {
    if (m[1] !== undefined) continue; // comment
    const slash = m[2];
    const tag = (m[3] || '').toLowerCase();
    const rest = m[4] || '';
    if (!tag) continue;
    const selfClosing = /\/$/.test(rest) || voidElements.has(tag);
    if (slash === '/') {
      // closing tag
      if (stack.length === 0) {
        problems.push({ file, type: 'HTML', msg: `Unexpected closing </${tag}>` });
      } else {
        const top = stack.pop();
        if (top !== tag) {
          problems.push({ file, type: 'HTML', msg: `Mismatched closing tag: expected </${top}> but found </${tag}>` });
        }
      }
    } else {
      if (!selfClosing) stack.push(tag);
    }
  }
  if (stack.length) {
    problems.push({ file, type: 'HTML', msg: `Unclosed tags: ${stack.join(', ')}` });
  }

  // Check local image refs
  const imgRegex = /<img[^>]*src=["']([^"']+)["']/g;
  while ((m = imgRegex.exec(content)) !== null) {
    const src = m[1];
    if (/^(https?:)?\/\//i.test(src)) continue;
    const imgPath = path.resolve(path.dirname(file), src);
    if (!fs.existsSync(imgPath)) {
      problems.push({ file, type: 'ASSET', msg: `Missing image file: ${src} (resolved ${imgPath})` });
    }
  }
}

function checkJs(file) {
  const content = fs.readFileSync(file, 'utf8');
  try {
    // quick syntax check by creating a new function
    // wrap in parentheses to allow top-level expression lists
    new Function(content);
  } catch (err) {
    problems.push({ file, type: 'JS', msg: err.message });
  }
}

console.log(`Scanning ${htmlFiles.length} HTML files and ${jsFiles.length} JS files...`);

const skipHtml = process.argv.includes('--skip-html');
if (!skipHtml) htmlFiles.forEach(checkHtml);
jsFiles.forEach(checkJs);

if (problems.length === 0) {
  console.log('No issues found.');
  process.exit(0);
}

console.log('\nProblems found:');
problems.forEach(p => {
  console.log(`- [${p.type}] ${p.file}: ${p.msg}`);
});
process.exit(1);
