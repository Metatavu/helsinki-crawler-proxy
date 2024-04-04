import type * as cheerio from "cheerio";
import { IncomingHttpHeaders } from "http";

/**
 * Interface for proxy request interceptors
 */
export default interface AbstractProxyRequestInterceptor {
  /**
   * Returns true if the interceptor should intercept the request
   *
   * @param headers request headers
   */
  shouldIntercept(headers: IncomingHttpHeaders): boolean;

  /**
   * Intercepts the target url. The interceptor should modifies directly the $ instance.
   *
   * @param headers request headers
   * @param $ cheerio instance
   */
  intercept(headers: IncomingHttpHeaders, $: cheerio.CheerioAPI): Promise<void>;
}
