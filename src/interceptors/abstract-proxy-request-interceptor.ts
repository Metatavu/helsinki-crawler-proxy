import * as cheerio from "cheerio";

/**
 * Interface for proxy request interceptors
 */
export default interface AbstractProxyRequestInterceptor {

  /**
   * Returns true if the interceptor should intercept the request
   * 
   * @param targetUrl target url
   */
  shouldIntercept(targetUrl: string): boolean;

  /**
   * Intercepts the target url. The interceptor should modifies directly the $ instance.
   * 
   * @param targetUrl target url
   * @param $ cheerio instance
   */
  intercept(targetUrl: string, $: cheerio.CheerioAPI): Promise<void>;
};