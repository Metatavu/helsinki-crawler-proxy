import type { IncomingHttpHeaders } from "node:http";
import type * as cheerio from "cheerio";

/**
 * Interface for proxy request interceptors
 */
export default interface AbstractProxyRequestInterceptor {
  /**
   * Returns true if the interceptor should intercept the request
   *
   * @param headers request headers
   * @param requestUrl request url
   */
  shouldIntercept(headers: IncomingHttpHeaders, requestUrl: URL): boolean;

  /**
   * Intercepts the target url. The interceptor should modifies directly the $ instance.
   *
   * @param headers request headers
   * @param $ cheerio instance
   * @param requestUrl request url
   */
  intercept(headers: IncomingHttpHeaders, requestUrl: URL, $: cheerio.CheerioAPI): Promise<void>;
}
