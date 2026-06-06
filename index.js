const http = require('http');
const https = require('https');

const PORT = 3000;
const BLOCKED_HOST = 'status.spicylyrics.org';

const server = http.createServer((req, res) => {
    // Add permissive headers to avoid CORS validation errors in the browser environment
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    const options = {
        hostname: BLOCKED_HOST,
        port: 443,
        path: req.url,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': '*/*'
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Proxy Failed to reach server: ${err.message}`);
    });

    proxyReq.end();
});

server.listen(PORT, () => {
    console.log(`Cloud endpoint proxy online at http://localhost:${PORT}`);
});
