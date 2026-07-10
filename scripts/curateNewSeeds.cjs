const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TOTAL_SUPPLY = 456;
const HTML_FILE = `file://${path.join(__dirname, "../../motor/index.html")}`;
const OUTPUT_PATH = path.join(__dirname, "../src/curated_seeds_v2.json");

async function run() {
    console.log("Launching Puppeteer browser...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // We only need to retrieve traits, so set a tiny viewport for speed
    await page.setViewport({ width: 100, height: 100, deviceScaleFactor: 1 });

    const newCuratedSeeds = [];

    for (let i = 1; i <= TOTAL_SUPPLY; i++) {
        // Generate random seed
        const seed = Math.floor(Math.random() * 999999999999);
        console.log(`[${i}/${TOTAL_SUPPLY}] Evaluating seed: ${seed}...`);

        // Inject seed
        await page.evaluateOnNewDocument((injectedSeed) => {
            window.HASH = Number(injectedSeed);
        }, seed);

        // Load the page
        await page.goto(HTML_FILE, { waitUntil: 'domcontentloaded' });

        // Wait 300ms for p5 setup() to execute and calculate window.traits
        await new Promise(r => setTimeout(r, 300));

        // Extract traits
        const traits = await page.evaluate(() => {
            return window.traits || {};
        });

        console.log(`  Traits extracted:`, traits);

        newCuratedSeeds.push({
            index: i,
            seed: String(seed),
            traits: traits
        });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newCuratedSeeds, null, 2));
    console.log(`\n🎉 Curated seeds generation complete! Saved ${newCuratedSeeds.length} seeds to: ${OUTPUT_PATH}`);
    
    await browser.close();
}

run().catch(console.error);
