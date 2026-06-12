const http = require('http');
const https = require('https');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // 1. Handle CORS Preflight and Header injection
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // 2. Parse out the target domain and the target path
    // Format expected: /://domain.com
    const urlParts = req.url.split('/').filter(Boolean);
    
    if (urlParts.length === 0) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('Error: Missing target domain in URL path.');
    }

    // Strip out potential protocols if the client included them accidently
    const targetDomain = urlParts[0].replace(/^https?:\/\//, '');
    const targetPath = '/' + urlParts.slice(1).join('/');

    // 3. Configure the forwarding request options
    const options = {
        hostname: targetDomain,
        port: 443, // Defaulting to secure HTTPS for external targets
        path: targetPath,
        method: req.method,
        headers: {
            ...req.headers,
            host: targetDomain, // Critical to avoid SSL/Routing mismatches
        }
    };

    // 4. Forward the incoming request to the target website
    const proxyReq = https.request(options, (proxyRes) => {
        // Forward target's status and headers back to client
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    // Handle network errors gracefully
    proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Proxy Error: ${err.message}`);
    });

    // Pipe the client's incoming body data (for POST/PUT requests)
    req.pipe(proxyReq);
});

server.listen(PORT, () => {
    console.log(`Universal CORS proxy is live on http://localhost:${PORT}`);
});
