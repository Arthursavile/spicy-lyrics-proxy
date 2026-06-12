const http = require('http');
const https = require('https');
const port = 3000;

const server = http.createServer((req, res) => {
    // 1. Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // 2. Extract full target URL from the request path
    // Removes the leading slash to get the full "http://..." string
    const targetUrlString = req.url.startsWith('/') ? req.url.slice(1) : req.url;

    let targetUrl;
    try {
        targetUrl = new URL(targetUrlString);
    } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('Error: Invalid target URL. Format should be http://localhost:3000/http://example.com');
    }

    // 3. Dynamically choose protocol module and port
    const isHttps = targetUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    const defaultPort = isHttps ? 443 : 80;

    // 4. Configure the forwarding request options
    const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || defaultPort,
        path: targetUrl.pathname + targetUrl.search,
        method: req.method,
        headers: {
            ...req.headers,
            host: targetUrl.hostname, // Avoids SSL/routing mismatches
        }
    };

    // 5. Forward the request
    const proxyReq = client.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    // Handle network errors gracefully
    proxyReq.on('error', (err) => {
        console.error('Proxy Error:', err.message);
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Bad Gateway: ${err.message}`);
    });

    // Forward incoming request body if any
    req.pipe(proxyReq);
});

server.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
