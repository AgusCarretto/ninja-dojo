const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Referenced icon/relic/artifact/mat images (small UI elements, need alpha preserved)
const iconFiles = [
    'public/shop/artifacts/artifact_bonsai-modified.png',
    'public/shop/artifacts/artifact_incense.png',
    'public/shop/artifacts/artifact_lantern-modified.png',
    'public/shop/mats/mat_jade-modified.png',
    'public/shop/mats/mat_obsidian-modified (1).png',
    'public/shop/mats/mat_wood-modified.png',
    'public/shop/relics/relic_dragon-modified.png',
    'public/shop/relics/relic_katanas-modified.png',
    'public/shop/relics/relic_katana_onehand-modified.png',
    'public/shop/relics/relic_mask-modified.png',
];

const MAX_DIM = 800;

async function run() {
    let totalBefore = 0;
    let totalAfter = 0;

    for (const rel of iconFiles) {
        const before = fs.statSync(rel).size;
        const buffer = await sharp(rel)
            .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
            .png({ quality: 85, effort: 10, palette: true })
            .toBuffer();

        fs.writeFileSync(rel, buffer);
        const after = fs.statSync(rel).size;
        totalBefore += before;
        totalAfter += after;
        console.log(`${rel}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
    }

    console.log(`\nTOTAL: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`);
}

run();
