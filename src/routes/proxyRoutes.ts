import express, { Request, Response } from 'express';
import httpProxy from 'http-proxy';

const router = express.Router();
const proxy = httpProxy.createProxyServer({});

// After modification
router.get('/', (req: Request, res: Response) => {
    // Get proxy request URL as usually for the proxy app (not from the headers)
    const { protocol, hostname, pathname, search, hash } = new URL(req.url);
    const targetUrl = `${protocol}//${hostname}${pathname}${search}${hash}`;

    console.log('Proxying to:', targetUrl);

    if (!targetUrl) {
        return res.status(400).send('Proxy target URL is missing');
    }

    proxy.web(req, res, {
        target: targetUrl as string,
    });
});

export default router;
