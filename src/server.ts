import fs from "node:fs";
import http from "node:http";
import * as cheerio from "cheerio";
import HttpProxy from "http-proxy";
import config from "./config";
import interceptors from "./interceptors";

const sslCert = fs.readFileSync(config.http.ssl.cert, "utf8");
const sslKey = fs.readFileSync(config.http.ssl.key, "utf8");

const httpProxy = HttpProxy.createServer({
  ssl: {
    cert: sslCert,
    key: sslKey,
  },
  secure: true,
});

http
  .createServer({}, (req, res) => {
    console.log("Incoming request");

    const { url } = req;

    if (!url) {
      console.error("Request URL is missing");
      res.statusCode = 400;
      res.end("Request URL is missing");
      return;
    }

    const { protocol, hostname, pathname, search, hash } = new URL(url);
    const targetUrl = `${protocol}//${hostname}${pathname}${search}${hash}`;

    console.log("Proxying to:", targetUrl);

    if (!targetUrl) {
      console.error("Proxy target URL is missing");
      res.statusCode = 400;
      res.end("Proxy target URL is missing");
      return;
    }

    const requestInterceptors = interceptors.filter((interceptor) => interceptor.shouldIntercept(targetUrl));
    if (requestInterceptors.length === 0) {
      httpProxy.web(req, res, {
        target: targetUrl,
      });
    } else {
      httpProxy.on("proxyRes", (proxyRes, _req, res) => {
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

      httpProxy.web(req, res, {
        target: targetUrl as string,
        selfHandleResponse: true,
      });
    }
  })
  .listen(config.http.port, () => console.log(`Proxy server is running on port ${config.http.port}`));
