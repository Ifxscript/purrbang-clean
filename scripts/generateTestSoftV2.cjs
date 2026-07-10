const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SEEDS_PATH = path.join(__dirname, "../src/curated_seeds_v2.json");
const OUTPUT_DIR = path.join(__dirname, "../public/images-v2");
const HTML_PATH = `file://${path.join(__dirname, "../../motor/index.html")}`;

async function main() {
    if (!fs.existsSync(SEEDS_PATH)) {
        console.error("Error: curated_seeds_v2.json not found!");
        process.exit(1);
    }

    const seeds = JSON.parse(fs.readFileSync(SEEDS_PATH, "utf8"));
    console.log(`Generating first 30 images of v2 curation at 2x Retina + 78q...`);

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();
    
    await page.setViewport({
        width: 300,
        height: 400,
        deviceScaleFactor: 2
    });

    for (let i = 0; i < 30; i++) {
        const item = seeds[i];
        const index = item.index;
        const seed = item.seed;

        console.log(`[${i + 1}/30] Generating v2 image for seed: ${seed}...`);

        await page.evaluateOnNewDocument((injectedSeed) => {
            window.HASH = Number(injectedSeed);
        }, seed);

        await page.goto(HTML_PATH);

        // Wait 2.2s for layout animation
        await new Promise(r => setTimeout(r, 2200));

        const canvasSelector = 'canvas';
        const canvas = await page.$(canvasSelector);
        
        if (canvas) {
            const imagePath = path.join(OUTPUT_DIR, `${index}.jpg`);
            await canvas.screenshot({
                path: imagePath,
                type: 'jpeg',
                quality: 78
            });
            console.log(`  Saved: ${imagePath}`);
        } else {
            console.error(`  ❌ Failed to find canvas for seed ${seed}`);
        }
    }

    await browser.close();
    console.log(`\n🎉 Generated first 30 v2 images inside: ${OUTPUT_DIR}`);
}

main().catch(console.error);
