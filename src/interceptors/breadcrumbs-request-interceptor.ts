import type { IncomingHttpHeaders } from "node:http";
import { env } from "node:process";
import type cheerio from "cheerio";
import type { Element } from "domhandler";
import type AbstractProxyRequestInterceptor from "./abstract-proxy-request-interceptor";

/**
 * Breadcrumbs request interceptor
 */
export default class BreadcrumbsRequestInterceptor implements AbstractProxyRequestInterceptor {
  /**
   * Breadcrumb request interceptor should intercept all www.hel.fi requests but not other domains
   *
   * @param headers request headers
   * @param requestUrl request url
   * @returns whether the interceptor should intercept the request
   */
  public shouldIntercept = (headers: IncomingHttpHeaders, requestUrl: URL): boolean => {
    if (env.NODE_ENV === "e2e") {
      return requestUrl.pathname.startsWith("www.hel.fi");
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
    const breadcrumbs = this.detectBreadcrumbs($);
    for (const breadcrumb of breadcrumbs) {
      $("<meta>").attr("name", "breadcrumbs").attr("content", breadcrumb).addClass("elastic").appendTo("head");
    }
  };

  /**
   * Detects breadcrumbs for given URL
   *
   * @param $ CheerioAPI
   * @returns breadcrumbs or null if not detected
   */
  private detectBreadcrumbs = ($: cheerio.CheerioAPI): string[] => {
    const helBreadcrumpsOld = $(".long-breadcrumb");
    if (helBreadcrumpsOld.length) {
      return this.detectBreadcrumbsFromHelOld($, helBreadcrumpsOld);
    }

    const helBreadcrumpsNew = $(".breadcrumb");
    if (helBreadcrumpsNew.length) {
      return this.detectBreadcrumbsFromHelNew($, helBreadcrumpsNew);
    }

    return [];
  };

  /**
   * Detects breadcrumbs from old hel.fi format
   *
   * @param $ CheerioAPI
   * @param helBreadcrumbsOld selector for breadcrumbs
   * @returns list of breadcrumbs
   */
  private detectBreadcrumbsFromHelOld = ($: cheerio.CheerioAPI, helBreadcrumbsOld: cheerio.Cheerio<Element>) => {
    const result = [];

    helBreadcrumbsOld.children(".breadcrump-frontpage-link,a").each((_index, a) => {
      result.push($(a).text().replaceAll("»", "").trim());
    });

    result.push(helBreadcrumbsOld.contents().last().text().replaceAll("»", "").trim());

    return result.filter((i) => !!i);
  };

  /**
   * Detects breadcrumbs from new hel.fi format
   *
   * @param $ CheerioAPI
   * @param helBreadcrumbsNew selector for breadcrumbs
   * @returns list of breadcrumbs
   */
  private detectBreadcrumbsFromHelNew = ($: cheerio.CheerioAPI, helBreadcrumbsNew: cheerio.Cheerio<Element>) => {
    const result = [];

    helBreadcrumbsNew.children("a").each((_index, a) => {
      result.push($(a).text().trim());
    });

    result.push(helBreadcrumbsNew.children("span:last-child").text().trim());

    return result.filter((i) => !!i);
  };
}
