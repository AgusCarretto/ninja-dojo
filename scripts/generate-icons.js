const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Renders public/icons/app-icon-source.svg into every raster size the PWA
// manifest and Next.js icon file conventions need. Re-run after editing the
// source SVG (e.g. once real branding replaces the placeholder flame).
const SOURCE = path.join(__dirname, '..', 'public', 'icons', 'app-icon-source.svg');

const targets = [
    // manifest.ts icons (public/, referenced by URL)
    { out: 'public/icons/icon-192.png', size: 192 },
    { out: 'public/icons/icon-512.png', size: 512 },
    // Next.js file-convention icons (auto-injected <link> tags)
    { out: 'app/icon.png', size: 512 },
    { out: 'app/apple-icon.png', size: 180 },
];

async function run() {
    const svg = fs.readFileSync(SOURCE);

    for (const { out, size } of targets) {
        const dest = path.join(__dirname, '..', out);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        await sharp(svg, { density: 384 })
            .resize(size, size)
            .png()
            .toFile(dest);
        console.log(`${out} (${size}x${size})`);
    }
}

run();
