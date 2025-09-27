const express = require('express');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Disable X-Powered-By header
app.disable('x-powered-by');

// Custom middleware to force correct MIME types
app.use((req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    
    // Force correct MIME types
    switch (ext) {
        case '.css':
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
            break;
        case '.js':
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            break;
        case '.html':
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            break;
        case '.svg':
            res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
            break;
        case '.png':
            res.setHeader('Content-Type', 'image/png');
            break;
        case '.jpg':
        case '.jpeg':
            res.setHeader('Content-Type', 'image/jpeg');
            break;
        case '.mp3':
            res.setHeader('Content-Type', 'audio/mpeg');
            break;
        case '.json':
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            break;
    }
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Cache control
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
});

// Decode URL-encoded characters middleware
app.use((req, res, next) => {
    let decodedUrl = req.url;
    
    // Decode common URL encodings
    decodedUrl = decodedUrl.replace(/%2540/g, '@');
    decodedUrl = decodedUrl.replace(/%253D/g, '=');
    decodedUrl = decodedUrl.replace(/%40/g, '@');
    decodedUrl = decodedUrl.replace(/%3D/g, '=');
    
    if (decodedUrl !== req.url) {
        console.log(`Redirecting: ${req.url} -> ${decodedUrl}`);
        return res.redirect(301, decodedUrl);
    }
    
    next();
});

// Serve static files
app.use(express.static('.', {
    index: false, // Don't serve index.html automatically
    setHeaders: (res, path, stat) => {
        const ext = path.split('.').pop().toLowerCase();
        
        // Force MIME types again in static middleware
        switch (ext) {
            case 'css':
                res.setHeader('Content-Type', 'text/css; charset=utf-8');
                break;
            case 'js':
                res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                break;
            case 'html':
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                break;
            case 'svg':
                res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
                break;
        }
    }
}));

// Route for root - serve main index.html
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Routes for numbered pages
for (let i = 1; i <= 11; i++) {
    app.get(`/${i}`, (req, res) => {
        const filePath = path.join(__dirname, `${i}`, 'index.html');
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.sendFile(filePath);
        } else {
            res.status(404).send('Page not found');
        }
    });
}

// Routes for other directories
const directories = ['back', 'saque', 'iof', 'up1', 'up2', 'up3', 'up4', 'up5'];
directories.forEach(dir => {
    app.get(`/${dir}`, (req, res) => {
        const filePath = path.join(__dirname, dir, 'index.html');
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.sendFile(filePath);
        } else {
            res.status(404).send('Page not found');
        }
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`404 - File not found: ${req.url}`);
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Page Not Found</title>
            <meta charset="UTF-8">
        </head>
        <body>
            <h1>404 - Page Not Found</h1>
            <p>The requested file <strong>${req.url}</strong> was not found.</p>
            <p><a href="/">Go back to home</a></p>
        </body>
        </html>
    `);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`PixTurbinado server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('MIME types will be correctly set for all static files');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
