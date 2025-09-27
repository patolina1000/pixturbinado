// MIME Type Fix for Render.com - PixTurbinado
(function() {
    'use strict';
    
    console.log('Loading MIME fix for Render.com...');
    
    // Function to reload CSS with correct MIME type
    function fixCSSMimeType() {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(function(link) {
            if (link.href && !link.href.startsWith('https://fonts.googleapis.com') && !link.href.startsWith('https://cdn')) {
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.type = 'text/css';
                newLink.href = link.href + '?v=' + Date.now();
                newLink.onload = function() {
                    if (link.parentNode) {
                        link.parentNode.removeChild(link);
                    }
                };
                newLink.onerror = function() {
                    console.warn('Failed to reload CSS:', link.href);
                };
                document.head.appendChild(newLink);
            }
        });
    }
    
    // Function to reload JS with correct MIME type
    function fixJSMimeType() {
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(function(script) {
            if (script.src && 
                !script.src.startsWith('https://cdn') && 
                !script.src.startsWith('https://www.clarity.ms') &&
                !script.src.includes('utm-handler.js') &&
                script.src.includes(window.location.hostname)) {
                
                const newScript = document.createElement('script');
                newScript.type = 'application/javascript';
                newScript.src = script.src + '?v=' + Date.now();
                newScript.async = false;
                newScript.onload = function() {
                    console.log('Reloaded JS:', script.src);
                };
                newScript.onerror = function() {
                    console.warn('Failed to reload JS:', script.src);
                };
                
                // Insert after the original script
                if (script.parentNode) {
                    script.parentNode.insertBefore(newScript, script.nextSibling);
                }
            }
        });
    }
    
    // Add meta tag to force UTF-8
    function addCharsetMeta() {
        if (!document.querySelector('meta[charset]')) {
            const meta = document.createElement('meta');
            meta.setAttribute('charset', 'UTF-8');
            document.head.insertBefore(meta, document.head.firstChild);
        }
    }
    
    // Override fetch to add correct headers
    if (window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            options = options || {};
            options.headers = options.headers || {};
            
            // Add correct headers for CSS and JS files
            if (typeof url === 'string') {
                if (url.endsWith('.css')) {
                    options.headers['Accept'] = 'text/css,*/*;q=0.1';
                    options.headers['Content-Type'] = 'text/css; charset=utf-8';
                } else if (url.endsWith('.js')) {
                    options.headers['Accept'] = 'application/javascript,*/*;q=0.1';
                    options.headers['Content-Type'] = 'application/javascript; charset=utf-8';
                }
            }
            
            return originalFetch.call(this, url, options);
        };
    }
    
    // Execute fixes
    addCharsetMeta();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fixCSSMimeType, 100);
        });
    } else {
        setTimeout(fixCSSMimeType, 100);
    }
    
    console.log('MIME fix loaded successfully');
})();
