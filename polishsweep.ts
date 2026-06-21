import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else {
      if (p.endsWith('.tsx') || p.endsWith('.css')) {
        callback(p);
      }
    }
  }
}

function processContent(content: string, filepath: string): string {
  let c = content;
  
  if (filepath.endsWith('.css')) {
     c = c.replace(/border: 0\.5px solid rgba\(255, 255, 255, 0\.08\);/g, 'border: 0.5px solid rgba(255, 255, 255, 0.04);');
     c = c.replace(/border-radius: 16px;/g, 'border-radius: 20px;'); // more iOS-like card rounding
     c = c.replace(/filter: brightness\(1\.1\);/g, 'opacity: 0.9;'); 
     c = c.replace(/transform: scale\(1\.02\);/g, ''); // Remove scale hover for buttons, keep it flat
     c = c.replace(/0 4px 24px -4px rgba\(0, 0, 0, 0\.4\)/g, '0 10px 40px -10px rgba(0, 0, 0, 0.5)'); // softer wider shadow
     return c;
  }
  
  // TYPOGRAPHY ENHANCEMENTS
  // Change heavy bold titles to semibold for more Apple-like elegance
  c = c.replace(/font-bold text-3xl/g, 'font-semibold text-3xl tracking-tight');
  c = c.replace(/font-bold text-2xl/g, 'font-semibold text-2xl tracking-tight');
  c = c.replace(/font-bold text-xl/g, 'font-semibold text-xl tracking-tight');
  c = c.replace(/font-bold/g, 'font-semibold');
  
  // Soften text colors
  c = c.replace(/text-white\/60/g, 'text-zinc-400');
  c = c.replace(/text-gray-400/g, 'text-zinc-400');
  c = c.replace(/text-white\/80/g, 'text-zinc-200');
  
  // BADGES (make them pill shaped and very subtle)
  c = c.replace(/rounded-lg/g, 'rounded-xl'); // Standardize on slightly rounder inputs and standard cards
  
  // BUTTONS & HOVERS (remove extreme scales and transform classes where they occur bare)
  c = c.replace(/hover:scale-105/g, '');
  c = c.replace(/hover:-translate-y-1/g, 'hover:-translate-y-0.5'); // subtler motion
  c = c.replace(/transition-all/g, 'transition-all duration-300 ease-out'); // smooth ease

  // GLASS EFFECT REFINEMENT
  c = c.replace(/border-white\/10/g, 'border-white/5');
  
  return c;
}

let modifiedFiles = 0;

walk('./src', (filepath) => {
  const original = fs.readFileSync(filepath, 'utf-8');
  const modified = processContent(original, filepath);
  if (original !== modified) {
    fs.writeFileSync(filepath, modified, 'utf-8');
    console.log(`Polished UI for ${filepath}`);
    modifiedFiles++;
  }
});

console.log(`UI polish sweeping complete. Files modified: ${modifiedFiles}`);
