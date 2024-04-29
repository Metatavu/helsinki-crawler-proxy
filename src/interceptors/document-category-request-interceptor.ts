import type { IncomingHttpHeaders } from "node:http";
import { env } from "node:process";
import type * as cheerio from "cheerio";
import { ContentCategory } from "../constants";
import HtmlUtils from "../utils/html-utils";
import type AbstractProxyRequestInterceptor from "./abstract-proxy-request-interceptor";

/**
 * Document category request interceptor.
 *
 * This interceptor is responsible for setting the content category for all documents in www.hel.fi.
 */
export default class DocumentCategoryRequestInterceptor implements AbstractProxyRequestInterceptor {
  /**
   * Document category request interceptor should intercept all www.hel.fi requests but not other domains
   *
   * @param headers request headers
   * @param requestUrl request url
   * @returns whether the interceptor should intercept the request
   */
  public shouldIntercept = (headers: IncomingHttpHeaders, requestUrl: URL): boolean => {
    if (env.NODE_ENV === "e2e") {
      return requestUrl.pathname.startsWith("/www.hel.fi");
    }

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
   * @param _requestUrl request url
   * @param $ cheerio instance
   */
  public intercept = async (_headers: IncomingHttpHeaders, _requestUrl: URL, $: cheerio.CheerioAPI) => {
    const helfiContentType = HtmlUtils.getMetaTag($, "helfi_content_type");
    const contentCategory = this.getContentCategory(helfiContentType);

    HtmlUtils.setMetaTag($, "category", contentCategory, "elastic");
  };

  /**
   * Returns content category type from given category string
   *
   * @param helfiContentType content type from www.hel.fi -domain meta tag
   * @returns content category type
   */
  private getContentCategory = (helfiContentType: string | null) => {
    switch (helfiContentType) {
      case "news_item":
        return ContentCategory.NEWS;
      case "tpr_unit":
        return ContentCategory.UNIT;
      case "tpr_service":
        return ContentCategory.SERVICE;
      default:
        return ContentCategory.UNCATEGORIZED;
    }
  };
}
