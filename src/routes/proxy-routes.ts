import * as cheerio from "cheerio";
import express, { type Request, type Response } from "express";
import httpProxy from "http-proxy";
import interceptors from "../interceptors";
import fs from "node:fs";
import config from "../config";

const router = express.Router();
const proxy = httpProxy.createProxyServer({
  ssl: {
    cert: fs.readFileSync(config.http.ssl.cert, "utf8"),
    key: fs.readFileSync(config.http.ssl.key, "utf8"),
  },
  secure: true,
});

router.get("/", (req: Request, res: Response) => {
  const { protocol, hostname, pathname, search, hash } = new URL(req.url);
  const targetUrl = `${protocol}//${hostname}${pathname}${search}${hash}`;

  console.log("Proxying to:", targetUrl);

  if (!targetUrl) {
    return res.status(400).send("Proxy target URL is missing");
  }

  const requestInterceptors = interceptors.filter((interceptor) => interceptor.shouldIntercept(targetUrl));
  if (requestInterceptors.length === 0) {
    proxy.web(req, res, {
      target: targetUrl,
    });
  } else {
    proxy.on("proxyRes", (proxyRes, _req, res) => {
      const chunks: Buffer[] = [];
      proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));

      proxyRes.on("end", () => {
        const body = Buffer.concat(chunks);
        const $ = cheerio.load(body);

        for (const interceptor of requestInterceptors) {
          interceptor.intercept(targetUrl, $);
        }

        const bodyHtml = $.html();
        res.end(bodyHtml);
      });
    });

    proxy.web(req, res, {
      target: targetUrl as string,
      selfHandleResponse: true,
    });
  }
});

export default router;
