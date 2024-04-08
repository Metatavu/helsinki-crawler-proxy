import type { IncomingHttpHeaders } from "node:http";
import type * as cheerio from "cheerio";
import type AbstractProxyRequestInterceptor from "./abstract-proxy-request-interceptor";
import { SUPPORTED_LANGUAGES } from "../constants";

export default class DocumentLanguageRequestInterceptor implements AbstractProxyRequestInterceptor {
  /**
   * Document language request interceptor should intercept all requests
   *
   * @param _headers request headers
   * @param _requestUrl request url
   * @returns whether the interceptor should intercept the request
   */
  public shouldIntercept = (_headers: IncomingHttpHeaders, _requestUrl: URL): boolean => {
    return true;
  };

  /**
   * Intercept and modify the body of the response
   *
   * @param _headers request headers
   * @param _requestUrl request url
   * @param $ cheerio instance
   */
  public intercept = async (_headers: IncomingHttpHeaders, requestUrl: URL, $: cheerio.CheerioAPI) => {
    const language = this.getLanguageFromUrl(requestUrl);
  };

  /**
   * Parse the language from the URL
   *
   * @param requestUrl request url
   * @returns language from the URL
   */
  private getLanguageFromUrl = (requestUrl: URL): string | null => {
    const parts = requestUrl.pathname.split("/");
    const url_path_dir1 = parts.length > 0 ? parts[0] : null;
    const url_path_dir2 = parts.length > 1 ? parts[1] : null;

    if (url_path_dir1 && SUPPORTED_LANGUAGES.includes(url_path_dir1)) {
      return url_path_dir1;
    }

    if (url_path_dir2 && SUPPORTED_LANGUAGES.includes(url_path_dir2)) {
      return url_path_dir2;
    }

    return null;
  };
}
