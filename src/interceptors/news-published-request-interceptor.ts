import type { IncomingHttpHeaders } from "node:http";
import type * as cheerio from "cheerio";
import { DateTime } from "luxon";
import Logging from "../logging";
import HtmlUtils from "../utils/html-utils";
import type AbstractProxyRequestInterceptor from "./abstract-proxy-request-interceptor";

/**
 * News published request interceptor.
 *
 * This interceptor is responsible for setting the publish date for all news items in www.hel.fi.
 */
export default class NewsPublishedRequestInterceptor implements AbstractProxyRequestInterceptor {
  /**
   * News published request interceptor should intercept all www.hel.fi requests but not other domains
   *
   * @param headers request headers
   * @returns whether the interceptor should intercept the request
   */
  public shouldIntercept = (headers: IncomingHttpHeaders): boolean => {
    try {
      return headers.host === "www.hel.fi";
    } catch (error) {
      return false;
    }
  };

  /**
   * Intercept and modify the body of the response
   *
   * @param _headers request headers
   * @param $ cheerio instance
   */
  public intercept = async (_headers: IncomingHttpHeaders, $: cheerio.CheerioAPI) => {
    const contentCategory = HtmlUtils.getMetaTag($, "helfi_content_type");
    if (contentCategory === "news_item") {
      const publishDate = this.getNewsPublished($);
      if (publishDate?.isValid) {
        const publishDateISO = publishDate.toISO();
        if (publishDateISO) {
          HtmlUtils.setMetaTag($, "news_published", publishDateISO, "elastic");
        }
      } else {
        Logging.log("error", "Failed to parse publish date from news item.");
      }
    }
  };

  /**
   * Returns the publish date from page content
   *
   * @param $ cheerio instance
   * @returns publish date or null if not found
   */
  private getNewsPublished = ($: cheerio.CheerioAPI): DateTime | null => {
    const dateString = $("meta[property='article:published_time']")?.attr("content");
    return dateString ? DateTime.fromISO(dateString) : null;
  };
}
