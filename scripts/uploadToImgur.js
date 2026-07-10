import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const GALLERY_DIR = '/Users/APPLE/newp5js.project/purrbang-gallery';
const IMAGES_DIR = path.join(GALLERY_DIR, 'public/images');
const OUTPUT_FILE = path.join(GALLERY_DIR, 'src/image-urls.json');

// Free API Key for ImgBB
const API_KEY = 'd9050a81c0ade6ec1d842d8429068566';

async function uploadImage(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append('image', fileStream);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: 'POST',
        body: form
    });

    const data = await response.json();
    if (data.success && data.data && data.data.url) {
        return data.data.url;
    } else {
        throw new Error(data.error ? data.error.message : 'Unknown error');
    }
}

async function main() {
    let urls = {};
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            urls = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
            console.log(`Loaded ${Object.keys(urls).length} existing image URLs.`);
        } catch (e) {
            urls = {};
        }
    }

    const files = fs.readdirSync(IMAGES_DIR)
        .filter(file => file.endsWith('.jpg'));

    console.log(`Found ${files.length} images to upload.`);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const inscriptionId = path.basename(file, '.jpg');

        if (urls[inscriptionId]) {
            console.log(`[${i+1}/${files.length}] Skipping ${file} (already uploaded)`);
            continue;
        }

        const filePath = path.join(IMAGES_DIR, file);
        console.log(`[${i+1}/${files.length}] Uploading ${file}...`);

        let attempts = 0;
        let success = false;

        while (attempts < 3 && !success) {
            try {
                const url = await uploadImage(filePath);
                urls[inscriptionId] = url;
                success = true;
                console.log(`  Uploaded successfully: ${url}`);
                fs.writeFileSync(OUTPUT_FILE, JSON.stringify(urls, null, 2));
                // 1 second delay to respect rate limit guidelines
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                attempts++;
                console.error(`  Error uploading ${file} (Attempt ${attempts}):`, err.message);
                if (attempts < 3) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        }

        if (!success) {
            console.error(`❌ Failed to upload ${file} after 3 attempts.`);
            break;
        }
    }

    console.log('ImgBB CDN upload completed!');
}

main();
