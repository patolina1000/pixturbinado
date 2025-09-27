// Cloudflare/Render Worker to fix MIME types
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Get the original response
  const response = await fetch(request)
  
  // Clone the response so we can modify headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })
  
  // Set correct MIME types based on file extension
  if (url.pathname.endsWith('.css')) {
    newResponse.headers.set('Content-Type', 'text/css; charset=utf-8')
    newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  } else if (url.pathname.endsWith('.js')) {
    newResponse.headers.set('Content-Type', 'application/javascript; charset=utf-8')
    newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  } else if (url.pathname.endsWith('.svg')) {
    newResponse.headers.set('Content-Type', 'image/svg+xml; charset=utf-8')
  } else if (url.pathname.endsWith('.html')) {
    newResponse.headers.set('Content-Type', 'text/html; charset=utf-8')
  }
  
  // Add cache control
  newResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  
  return newResponse
}
