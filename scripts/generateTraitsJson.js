import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEEDS_PATH = path.join(__dirname, "../../motor-contracts/curated_seeds.json");
const OUTPUT_PATH = path.join(__dirname, "../public/all-traits.json");

const paletteNames = [
  "Classic Sand",
  "Warm Wood",
  "Deep Oceanic",
  "Autumn Terracotta",
  "Forest Gold",
  "Teal Emerald",
  "Monochrome Orange",
  "Ocean Sunset",
  "Golden Bronze",
  "Solid Golden",
  "Teal Harmony",
  "Sand Teal Accent",
  "Vibrant Green-Gold"
];

function main() {
    if (!fs.existsSync(SEEDS_PATH)) {
        console.error("Error: curated_seeds.json not found!");
        process.exit(1);
    }

    const curated = JSON.parse(fs.readFileSync(SEEDS_PATH, "utf8"));
    const allTraits = curated.map(item => {
        // Map numeric Palette to a readable name
        const paletteIdx = Number(item.traits.Palette);
        const paletteName = paletteNames[paletteIdx] || `Palette ${paletteIdx}`;

        // Standardize Art Mode names for presentation
        let artMode = item.traits["Art Mode"] || "Standard";
        if (artMode === "l") artMode = "Linework";
        if (artMode === "paper") artMode = "Textured Paper";
        if (artMode === "straight") artMode = "Mechanical Straight";

        return {
            inscriptionId: String(item.index), // Use index as the identifier for local asset serving
            seed: Number(item.seed),
            traits: {
                "Palette": paletteName,
                "Art Mode": artMode,
                "Gear Layout Mode": item.traits["Gear Layout Mode"] || "Layout 1"
            }
        };
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allTraits, null, 2));
    console.log(`Successfully generated ${allTraits.length} entries in ${OUTPUT_PATH}`);
}

main();
