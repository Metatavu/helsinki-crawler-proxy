import type * as cheerio from "cheerio";
import { ContentCategory } from "../elastic/types";
import HtmlUtils from "../utils/html-utils";
import type AbstractProxyRequestInterceptor from "./abstract-proxy-request-interceptor";

export default class DocumentCategoryRequestInterceptor implements AbstractProxyRequestInterceptor {
  /**
   * Document category request interceptor should intercept all www.hel.fi requests but not other domains
   *
   * @param targetUrl target url
   * @returns whether the interceptor should intercept the request
   */
  public shouldIntercept = (targetUrl: string): boolean => {
    try {
      const url = new URL(targetUrl);
      return url.hostname === "www.hel.fi";
    } catch (error) {
      return false;
    }
  };

  /**
   * Intercept and modify the body of the response
   *
   * @param targetUrl target url
   * @param $ cheerio instance
   */
  public intercept = async (targetUrl: string, $: cheerio.CheerioAPI) => {
    const helfiContentType = HtmlUtils.getMetaTag($, "helfi_content_type");
    const contentCategory = this.getContentCategory(helfiContentType);

    HtmlUtils.setMetaTag($, "elastic:category", contentCategory);
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
