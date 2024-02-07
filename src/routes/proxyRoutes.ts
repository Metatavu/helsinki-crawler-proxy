import express, { Request, Response } from 'express';
import httpProxy, { ServerOptions } from 'http-proxy';
import { config } from '../config';
import http from 'http';
import { modifyResponseBodyAddElasticName, modifyResponseHeaders } from '../middleware/responseModifier';

const router = express.Router();

router.head('/', (req: Request, res: Response) => {
    // Send an HTTP 200 response with additional headers
    res.set('Content-Type', 'text/html');
    // res.set('Content-Length', '42337');
    res.set('Accept-Ranges', 'bytes');
    // res.set('Server', 'nginx/1.14.2');
    res.set('Date', new Date().toUTCString());
    res.set('Last-Modified', new Date().toUTCString());
    // res.set('ETag', '"61a66613-a561"');
    // res.set('Age', '4');
    // res.set('X-Cache', 'HIT from test-proxy');
    // res.set('X-Cache-Lookup', 'HIT from test-proxy:3128');
    // res.set('Via', '1.1 test-proxy (squid/4.6)');
    res.set('Connection', 'keep-alive');

    res.status(200).end();
});

router.get('/', (req: Request, res: Response) => {
    const targetUrl: string = req.headers['proxy'] as string;
    console.log('Proxying to:', targetUrl);
  
    if (!targetUrl) {
      return res.status(400).send('Proxy header is missing');
    }
  
    // Parse the target URL to extract hostname and path
    const { hostname, pathname } = new URL(targetUrl);

    console.log('Hostname is ', hostname);
    console.log('Pathname is ', pathname);

    const proxyRequest = http.get(targetUrl, (response) => {
        let responseBody = '';

        response.on('data', (chunk) => {
            responseBody += chunk;
        });

        response.on('end', () => {
            // Forward the response from the target server to the client
            res.status(response.statusCode || 200).send(responseBody);
        });
    }).on('error', (error) => {
        // Handle any errors that occur during the request
        console.error('Proxy error:', error);
        res.status(500).send('Proxy error');
    });
  
    // Handle errors that occur during the proxy request
    proxyRequest.on('error', (error) => {
      console.error('Proxy error:', error);
      res.status(500).send('Proxy error');
    });
  
    // End the proxy request
    proxyRequest.end();
  });

export default router;
