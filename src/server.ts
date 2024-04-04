import * as cheerio from "cheerio";
import { IContext, MaybeError, Proxy } from 'http-mitm-proxy';
import interceptors from "./interceptors";
import config from "./config";

const proxy = new Proxy();

proxy.onError((_ctx: IContext | null, err?: MaybeError, errorKind?: string) => {
  console.error('proxy error:', err, errorKind);
});

proxy.onRequest((ctx, callback) => {
  const { clientToProxyRequest } = ctx;
  const { headers } = clientToProxyRequest;
  const requestInterceptors = interceptors.filter((interceptor) => interceptor.shouldIntercept(headers));

  const chunks: Buffer[] = [];
      
  ctx.onResponseData((_ctx, chunk, callback) => {
    chunks.push(chunk);
    return callback(null, undefined);
  });

  ctx.onResponseEnd((ctx, callback) => {
    const body = Buffer.concat(chunks);
    const $ = cheerio.load(body);

    for (const interceptor of requestInterceptors) {
      interceptor.intercept(headers, $);
    }

    const bodyHtml = $.html();

    ctx.proxyToClientResponse.write(bodyHtml);
    return callback();
  });

  callback();
});

proxy.listen({
  host: '::',
  port: config.http.port,
  httpsPort: config.https.port
});

console.log(`HTTP Proxy listening on port ${config.http.port}, HTTPS Proxy listening on port ${config.https.port}`);
