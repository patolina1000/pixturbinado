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

// Rewrite encoded asset URLs to actual file names on disk
app.use((req, res, next) => {
    const originalUrl = req.url;
    const candidates = new Set([originalUrl]);

    const addCandidate = (pattern, replacer) => {
        if (originalUrl.includes(pattern)) {
            const candidate = originalUrl.replace(new RegExp(pattern, 'g'), replacer);
            candidates.add(candidate);
        }
    };

    // Handle common encodings used in the mirrored assets
    addCandidate('%2540', '%40');
    addCandidate('%253D', '%3D');
    addCandidate('@ver=', '%40ver%3D');
    addCandidate('@', '%40');
    addCandidate('=','%3D');

    // Find the first candidate that exists on disk
    let selectedUrl = originalUrl;
    for (const candidate of candidates) {
        const normalized = candidate.split('?')[0].replace(/^\/+/g, '');
        if (!normalized) {
            continue;
        }

        const candidatePath = path.join(__dirname, normalized);
        if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
            selectedUrl = candidate;
            break;
        }
    }

    if (selectedUrl !== originalUrl) {
        console.log(`Rewriting ${originalUrl} -> ${selectedUrl}`);
        req.url = selectedUrl;
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

// Health check route for Render
app.get('/health-basic', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'PixTurbinado'
    });
});

// Serve back redirect page
app.get('/back', (req, res) => {
    const filePath = path.join(__dirname, 'back', 'index.html');
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.sendFile(filePath);
    } else {
        res.status(404).send('Back page not found');
    }
});

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
