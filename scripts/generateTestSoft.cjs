const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SEEDS_PATH = path.join(__dirname, "../../motor-contracts/curated_seeds.json");
const OUTPUT_DIR = path.join(__dirname, "../public/images-test");
const HTML_PATH = `file://${path.join(__dirname, "../../motor/index.html")}`;

async function main() {
    if (!fs.existsSync(SEEDS_PATH)) {
        console.error("Error: curated_seeds.json not found!");
        process.exit(1);
    }

    const seeds = JSON.parse(fs.readFileSync(SEEDS_PATH, "utf8"));
    console.log(`Found seeds. Running 5 test renders at 177.7px x 237px (deviceScaleFactor = 1)`);

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();
    
    // Set viewport to produce a 2x Retina scale (600x800px)
    await page.setViewport({
        width: 300,
        height: 400,
        deviceScaleFactor: 2
    });

    // Run first 5 seeds for the test
    for (let i = 0; i < 5; i++) {
        const item = seeds[i];
        const index = item.index; // 1 to 5
        const seed = item.seed;
        const traits = item.traits;

        console.log(`[${index}/5] Generating soft test image for seed: ${seed}...`);

        // Inject seed
        await page.evaluateOnNewDocument((injectedSeed) => {
            window.HASH = Number(injectedSeed);
        }, seed);

        await page.goto(HTML_PATH);

        // Wait for canvas animations to draw
        await new Promise(r => setTimeout(r, 2200));

        const canvasSelector = 'canvas';
        const canvas = await page.$(canvasSelector);
        
        if (canvas) {
            const imagePath = path.join(OUTPUT_DIR, `${index}.jpg`);
            await canvas.screenshot({
                path: imagePath,
                type: 'jpeg',
                quality: 78 // softer edge compression
            });
            console.log(`  Saved soft test rendering: ${imagePath}`);
        } else {
            console.error(`  ❌ Failed to find canvas for seed ${seed}`);
        }
    }

    await browser.close();
    console.log(`\n🎉 Test generation complete! 5 test images saved inside: ${OUTPUT_DIR}`);
}

main().catch(console.error);
