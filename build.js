const fs = require('fs');
const https = require('https');

const CDN_URL = "https://jsdelivr.net";
const OUT_FILE = "patched-entrypoint.mjs";

console.log("Fetching original script structure from unblocked CDN...");

https.get(CDN_URL, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        // Scan the script contents and swap the blocked URL references to point to your proxy
        const patchedData = data.replace(/https:\/\/status\.spicylyrics\.org/g, 'http://localhost:3000');
        
        fs.writeFileSync(OUT_FILE, patchedData);
        console.log(`Successfully generated your local mirror target file: ${OUT_FILE}`);
    });
}).on('error', (err) => {
    console.error("Failed to extract data stream: " + err.message);
});
