import fs from "node:fs";
import type { IncomingHttpHeaders } from "node:http";
import path from "node:path";
import * as cheerio from "cheerio";
import { type IContext, type MaybeError, Proxy as MitmProxy } from "http-mitm-proxy";
import config from "./config";
import interceptors from "./interceptors";
import Logging from "./logging";

const ACTIVE_CONNECTIONS: URL[] = [];

/**
 * Load the CA certificate and keys
 */
const loadCaCertificate = () => {
  const caFolder = config.ca.cacheDir;
  if (!caFolder) {
    Logging.log("info", "CA cache directory not defined. Using generated certificates.");
    return;
  }

  const caCertificate = fs.readFileSync(config.ca.certificate, "utf8");
  const caPrivateKey = fs.readFileSync(config.ca.privateKey, "utf8");
  const caPublicKey = fs.readFileSync(config.ca.publicKey, "utf8");
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
};

loadCaCertificate();
const mitmProxy = new MitmProxy();

/**
 * Proxy error handler
 */
mitmProxy.onError((ctx: IContext | null, err?: MaybeError, errorKind?: string) => {
  if (!err) {
    return;
  }

  const host = ctx?.clientToProxyRequest.headers.host;
  const url = ctx?.clientToProxyRequest.url;
  const requestUrl = host && url ? `${host}${url}` : "unknown";

  const message = `proxy error: ${err} (${errorKind}) for ${requestUrl}`;

  Logging.log("error", message);

  if (Logging.level === "debug") {
    console.log(
      "active connections",
      ACTIVE_CONNECTIONS.map((url) => url.toString()),
    );
  }
});

/**
 * Authenticate the request using the proxy-authorization header
 *
 * @param headers the headers of the request
 * @returns true if the request is authenticated, false otherwise
 */
const proxyAuthenticate = (headers: IncomingHttpHeaders): boolean => {
  if (!config.security.username && !config.security.password) {
    return true;
  }

  const proxyAuth = headers["proxy-authorization"] || "";
  const [type, encoded] = proxyAuth.split(" ");

  if (type.toLowerCase() === "basic") {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const [username, password] = decoded.split(":");

    if (username === config.security.username && password === config.security.password) {
      return true;
    }
  }

  return false;
};

if (config.security.username && config.security.password) {
  /**
   * Proxy connect handler. Method is used to authenticate the user
   */
  mitmProxy.onConnect((req, socket, _head, callback) => {
    if (proxyAuthenticate(req.headers)) {
      return callback();
    }

    socket.write("HTTP/1.1 407 Proxy Authentication Required\r\n");
    socket.write('Proxy-Authenticate: Basic realm="Helsinki Crawler Proxy"\r\n');
    socket.write("\r\n");
    socket.end();
  });
}

if (!config.interceptors.disable) {
  /**
   * Proxy request handler
   */
  mitmProxy.onRequest((ctx, callback) => {
    const protocol = ctx.isSSL ? "https" : "http";
    const url = ctx.clientToProxyRequest.url;
    const { clientToProxyRequest } = ctx;
    const { headers } = clientToProxyRequest;
    const { host } = headers;

    if (!ctx.isSSL && !proxyAuthenticate(headers)) {
      return callback(new Error("Authentication required"));
    }

    ctx.use(MitmProxy.gunzip);

    const requestUrl = new URL(`${protocol}://${host}${url}`);

    Logging.log("debug", `Request to: ${requestUrl}`);

    ACTIVE_CONNECTIONS.push(requestUrl);

    const requestInterceptors = interceptors.filter((interceptor) => interceptor.shouldIntercept(headers, requestUrl));

    const chunks: Buffer[] = [];

    ctx.onResponseData((_ctx, chunk, callback) => {
      chunks.push(chunk);
      return callback(null, undefined);
    });

    ctx.onResponseEnd((ctx, callback) => {
      const responseHeaders = ctx.serverToProxyResponse?.headers;
      const responseBody = Buffer.concat(chunks);
      const responseStatusCode: number = ctx.serverToProxyResponse?.statusCode || 500;
      const responseContentType = responseHeaders?.["content-type"];
      const responseIsOk = responseStatusCode >= 200 && responseStatusCode <= 299;
      const responseIsHtml = responseContentType?.includes("text/html");

      Logging.log(
        "debug",
        `Response from: ${requestUrl}. Status code: ${responseStatusCode}, Content-Type: ${responseContentType}, Response Size (bytes): ${responseBody.length}`,
      );

      if (responseIsOk && responseIsHtml) {
        const $ = cheerio.load(responseBody);

        for (const interceptor of requestInterceptors) {
          interceptor.intercept(headers, requestUrl, $);
        }

        const bodyHtml = $.html();

        ctx.proxyToClientResponse.write(bodyHtml);
      } else {
        ctx.proxyToClientResponse.write(responseBody);
      }

      ACTIVE_CONNECTIONS.splice(ACTIVE_CONNECTIONS.indexOf(requestUrl), 1);

      return callback();
    });

    ctx.onError((_ctx, err) => {
      Logging.log("error", `Error: ${err} for ${requestUrl}`);
    });

    callback();
  });
} else {
  Logging.log("info", "Interceptors disabled");
}

mitmProxy.listen({
  host: "::",
  port: config.http.port,
  httpsPort: config.https.port,
  sslCaDir: config.ca.cacheDir,
});

console.log(`HTTP Proxy listening on port ${config.http.port}, HTTPS Proxy listening on port ${config.https.port}`);
