import * as cheerio from "cheerio";
import { IContext, MaybeError, Proxy } from 'http-mitm-proxy';
import interceptors from "./interceptors";
import config from "./config";

const proxy = new Proxy();

/**
 * Log a message to the console
 * 
 * @param level logging level
 * @param message message to log
 */
const log = (level: "error" | "info" | "debug", message: string) => {
  if (level === "debug" && config.logging.level !== "debug") {
    return;
  }

  if (level === "error") {
    console.error(`[${level}] ${message}`);
  } else {
    console.log(`[${level}] ${message}`);
  }
}

/**
 * Proxy error handler
 */
proxy.onError((_ctx: IContext | null, err?: MaybeError, errorKind?: string) => {
  log("error", `proxy error: ${err}, ${errorKind}`);
});

/**
 * Proxy request handler
 */
proxy.onRequest((ctx, callback) => {
  const host = ctx.clientToProxyRequest.headers.host;
  const url = ctx.clientToProxyRequest.url;

  log("debug", `Request to: ${host}${url}`);

  const { clientToProxyRequest } = ctx;
  const { headers } = clientToProxyRequest;
  const requestInterceptors = interceptors.filter((interceptor) => interceptor.shouldIntercept(headers));

  const chunks: Buffer[] = [];
      
  ctx.onResponseData((_ctx, chunk, callback) => {
    chunks.push(chunk);
    return callback(null, undefined);
  });

  ctx.onResponseEnd((ctx, callback) => {
    const responseHeaders = ctx.serverToProxyResponse?.headers;
    const responseBody =  Buffer.concat(chunks);
    const resnposeStatusCode: number = ctx.serverToProxyResponse?.statusCode || 500;
    const responseContentType = responseHeaders?.["content-type"];
    const responseIsOk = resnposeStatusCode >= 200 && resnposeStatusCode <= 299;
    const responseIsHtml = responseContentType && responseContentType.includes("text/html");

    log("debug", `Response from: ${host}${url}. Status code: ${resnposeStatusCode}, Content-Type: ${responseContentType}, Response Size (bytes): ${responseBody.length}`);

    if (responseIsOk && responseIsHtml) {
      const $ = cheerio.load(responseBody);

      for (const interceptor of requestInterceptors) {
        interceptor.intercept(headers, $);
      }

      const bodyHtml = $.html();

      ctx.proxyToClientResponse.write(bodyHtml);
    } else {
      ctx.proxyToClientResponse.write(responseBody);
    }

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
