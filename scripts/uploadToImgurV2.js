import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMGS_DIR = path.join(__dirname, "../public/images-v2");
const OUTPUT_JSON = path.join(__dirname, "../src/image-urls-v2.json");
const API_KEY = "d9050a81c0ade6ec1d842d8429068566";

async function uploadImage(filePath) {
    const fileData = fs.readFileSync(filePath);
    const base64Image = fileData.toString('base64');

    const formData = new URLSearchParams();
    formData.append('image', base64Image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    if (!response.ok) {
        throw new Error(`ImgBB API responded with status ${response.status}`);
    }

    const json = await response.json();
    return json.data.url;
}

async function main() {
    if (!fs.existsSync(IMGS_DIR)) {
        console.error("Images directory not found!");
        process.exit(1);
    }

    const files = fs.readdirSync(IMGS_DIR).filter(file => file.endsWith('.jpg'));
    console.log(`Found ${files.length} images to upload.`);

    let urlMap = {};
    if (fs.existsSync(OUTPUT_JSON)) {
        urlMap = JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf8'));
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const tokenId = path.basename(file, '.jpg');

        if (urlMap[tokenId]) {
            console.log(`[${i + 1}/${files.length}] ${file} already uploaded. Skipping.`);
            continue;
        }

        console.log(`[${i + 1}/${files.length}] Uploading ${file}...`);
        const filePath = path.join(IMGS_DIR, file);

        let attempts = 4;
        while (attempts > 0) {
            try {
                const url = await uploadImage(filePath);
                urlMap[tokenId] = url;
                console.log(`  Uploaded successfully: ${url}`);
                fs.writeFileSync(OUTPUT_JSON, JSON.stringify(urlMap, null, 2));
                
                // Rate limit delay: wait 3 seconds after every successful upload
                await new Promise(r => setTimeout(r, 3000));
                break;
            } catch (err) {
                attempts--;
                console.error(`  Error uploading (attempts left: ${attempts}):`, err.message);
                if (attempts > 0) {
                    console.log("  Waiting 12 seconds before retry...");
                    await new Promise(r => setTimeout(r, 12000)); // Backoff delay
                } else {
                    console.error(`  Skipping ${file} after failed attempts.`);
                }
            }
        }
    }

    console.log("ImgBB CDN upload completed!");
}

main().catch(console.error);
