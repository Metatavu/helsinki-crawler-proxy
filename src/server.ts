import * as cheerio from "cheerio";
import { IContext, MaybeError, Proxy } from 'http-mitm-proxy';
import interceptors from "./interceptors";
import config from "./config";
import fs from "node:fs";
import path from "node:path";

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
 * Load the CA certificate and keys
 */
const loadCaCertificate = () => {
  const caCertificate = fs.readFileSync(config.ca.certificate, "utf8");
  const caPrivateKey = fs.readFileSync(config.ca.privateKey, "utf8");
  const caPublicKey = fs.readFileSync(config.ca.publicKey, "utf8");
  const caFolder = config.ca.cacheDir;
  const certsFolder = path.join(caFolder, "certs");
  const keysFolder = path.join(caFolder, "keys");

  for (const folder of [caFolder, certsFolder, keysFolder]) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
  }

  fs.writeFileSync(`${certsFolder}/ca.pem`, caCertificate);
  fs.writeFileSync(`${keysFolder}/ca.private.key`, caPrivateKey);
  fs.writeFileSync(`${keysFolder}/ca.public.key`, caPublicKey);
}

loadCaCertificate();
const proxy = new Proxy();

/**
 * Proxy error handler
 */
proxy.onError((ctx: IContext | null, err?: MaybeError, errorKind?: string) => {
  if (!err) {
    return;
  }

  const host = ctx?.clientToProxyRequest.headers.host;
  const url = ctx?.clientToProxyRequest.url;
  const requestUrl = host && url ? `${host}${url}` : "unknown";

  log("error", `proxy error: ${err} (${errorKind}) for ${requestUrl}`);
});

/**
 * Proxy connect handler. Method is used to authenticate the user
 */
proxy.onConnect((req, socket, _head, callback) => {
  const proxyAuth = req.headers['proxy-authorization'] || '';
  const [type, encoded] = proxyAuth.split(' ');

  if (type.toLowerCase() === 'basic') {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const [username, password] = decoded.split(':');

    if (username === config.security.username && password === config.security.password) {
      return callback();
    }
  }

  socket.write('HTTP/1.1 407 Proxy Authentication Required\r\n');
  socket.write('Proxy-Authenticate: Basic realm="Helsinki Crawler Proxy"\r\n');
  socket.write('\r\n');
  socket.end();
});

/**
 * Proxy request handler
 */
proxy.onRequest((ctx, callback) => {
  const host = ctx.clientToProxyRequest.headers.host;
  const url = ctx.clientToProxyRequest.url;
  const requestUrl = `${host}${url}`;

  log("debug", `Request to: ${requestUrl}`);

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
  httpsPort: config.https.port,
  sslCaDir: config.ca.cacheDir,

});

console.log(`HTTP Proxy listening on port ${config.http.port}, HTTPS Proxy listening on port ${config.https.port}`);
