const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.argv[2] || 4173);
const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mp3': 'audio/mpeg',
    '.png': 'image/png',
    '.xml': 'application/xml; charset=utf-8',
};

http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const requestedPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.resolve(root, `.${requestedPath}`);
    const relativePath = path.relative(root, filePath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(error.code === 'ENOENT' ? 404 : 500);
            response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
            return;
        }

        response.writeHead(200, {
            'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        });
        response.end(content);
    });
}).listen(port, '127.0.0.1', () => {
    console.log(`Songlist is running at http://127.0.0.1:${port}`);
    console.log('Press Ctrl+C to stop the server.');
});
