import express, { Request, Response } from 'express';
import httpProxy from 'http-proxy';
import * as cheerio from "cheerio";
import interceptors from '../interceptors'; '../interceptors';

const router = express.Router();
const proxy = httpProxy.createProxyServer({});

router.get('/', (req: Request, res: Response) => {
  const { protocol, hostname, pathname, search, hash } = new URL(req.url);
  const targetUrl = `${protocol}//${hostname}${pathname}${search}${hash}`;

  console.log('Proxying to:', targetUrl);

  if (!targetUrl) {
    return res.status(400).send('Proxy target URL is missing');
  }

  const requestInterceptors = interceptors.filter(interceptor => interceptor.shouldIntercept(targetUrl));
  if (requestInterceptors.length === 0) {
    proxy.web(req, res, {
      target: targetUrl
    });
  } else {
    proxy.on('proxyRes', (proxyRes, _req, res) => {
      const chunks: Buffer[] = [];
      proxyRes.on('data', (chunk: Buffer) => chunks.push(chunk));

      proxyRes.on('end', () => {
        const body = Buffer.concat(chunks);
        const $ = cheerio.load(body);
        requestInterceptors.forEach(interceptor => interceptor.intercept(targetUrl, $));
        const bodyHtml = $.html();
        res.end(bodyHtml);
      });
    });

    proxy.web(req, res, {
      target: targetUrl as string,
      selfHandleResponse: true
    });
  }
});

export default router;
