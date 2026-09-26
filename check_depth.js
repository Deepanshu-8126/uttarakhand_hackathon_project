const fs = require('fs');
const content = fs.readFileSync('mobile_app/lib/services/api_service.dart', 'utf8');
const lines = content.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let inString = false;
  let stringChar = '';
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '/' && line[j+1] === '/') break;
    if ((ch === '\'' || ch === '"') && (j === 0 || line[j-1] !== '\\')) {
      if (!inString) { inString = true; stringChar = ch; }
      else if (stringChar === ch) { inString = false; }
    }
    if (!inString) {
      if (ch === '{') { depth++; }
      if (ch === '}') { depth--; }
    }
  }
  if (depth <= 0 && i > 5) {
    console.log(`Depth <= 0 at line ${i+1}: ${line.trim()}`);
  }
}
console.log('Final depth:', depth);
