import fs from 'fs';

const destFile = './src/data/destinations.js';
const destContent = fs.readFileSync(destFile, 'utf-8');

const slugRegex = /"slug":\s*"([^"]+)"/;
let modified = destContent;

const blocks = modified.split(/(?=\s*{\s*"id":)/);
for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const slugMatch = block.match(slugRegex);
    if (slugMatch) {
        const slug = slugMatch[1];
        const newGallery = `"gallery": [
      "/assets/destinations/${slug}/gallery-1.jpg",
      "/assets/destinations/${slug}/gallery-2.jpg",
      "/assets/destinations/${slug}/gallery-3.jpg",
      "/assets/destinations/${slug}/gallery-4.jpg"
    ],`;
        blocks[i] = block.replace(/"gallery":\s*\[[\s\S]*?\],/, newGallery);
    }
}

fs.writeFileSync(destFile, blocks.join(''));
console.log('Fixed gallery paths in destinations.js');
