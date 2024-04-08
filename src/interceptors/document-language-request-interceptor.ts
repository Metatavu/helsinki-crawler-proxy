import type { IncomingHttpHeaders } from "node:http";
import type * as cheerio from "cheerio";
import { franc } from "franc";
import { iso6393To1 } from "iso-639-3";
import { SUPPORTED_LANGUAGES } from "../constants";
import type { DrupalSettingsJson } from "../types";
import HtmlUtils from "../utils/html-utils";
import type AbstractProxyRequestInterceptor from "./abstract-proxy-request-interceptor";

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
   * @param requestUrl request url
   * @param $ cheerio instance
   */
  public intercept = async (_headers: IncomingHttpHeaders, requestUrl: URL, $: cheerio.CheerioAPI) => {
    const language = this.resolveLanguage(requestUrl, $);
    HtmlUtils.setMetaTag($, "language", language, "elastic");
  };

  /**
   * Resolves the language of the document. The language is resolved in the following order:
   *
   * 1. Drupal settings JSON
   * 2. URL
   * 3. Body content
   * 4. html lang attribute
   * 5. Default to "fi"
   *
   * @param requestUrl request url
   * @param $ cheerio instance
   * @returns language
   */
  private resolveLanguage = (requestUrl: URL, $: cheerio.CheerioAPI): string => {
    const languageFromDrupalSettingsJson = this.detectLanguageFromDrupalSettingsJson($);
    if (languageFromDrupalSettingsJson) {
      return languageFromDrupalSettingsJson;
    }

    const languageFromUrl = this.getLanguageFromUrl(requestUrl);
    if (languageFromUrl) {
      return languageFromUrl;
    }

    const bodyContent = $("body").text();
    const languageFromBodyContent = this.detectLanguageFromContents(bodyContent);
    if (languageFromBodyContent) {
      return languageFromBodyContent;
    }

    const lowerCaseBodyContent = bodyContent.toLowerCase();
    if ("ipsum".indexOf(lowerCaseBodyContent) || "lorem".indexOf(lowerCaseBodyContent)) {
      // lorem ipsum is interpret as "latin", this is necessary because there actually is lorem ipsum in target sites
      return "la";
    }

    return $("html").attr("lang") || "fi";
  };

  /**
   * Parse the language from the URL. The language can be in the first or second part (/fi/ or /something/fi/) of the URL.
   *
   * @param requestUrl request url
   * @returns language from the URL or null if not detected
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

  /**
   * Detects language from Drupal settings JSON. If the document contains Drupal settings JSON, the current language is extracted from it.
   *
   * @param $ cheerio instance
   * @returns language or null if not detected
   */
  private detectLanguageFromDrupalSettingsJson = ($: cheerio.CheerioAPI) => {
    const element = $("script[data-drupal-selector=drupal-settings-json]");
    if (!element.length) return;

    const jsonString = element.html();
    if (!jsonString?.length) return;

    const drupalSettingJson: DrupalSettingsJson = JSON.parse(jsonString);

    return drupalSettingJson.path?.currentLanguage || null;
  };

  /**
   * Detects language for given contents
   *
   * @param bodyContent contents
   * @returns language or null if not detected
   */
  private detectLanguageFromContents = (bodyContent: string): string | null => {
    const result = franc(bodyContent);
    if (result === "und") {
      return null;
    }

    return iso6393To1[result];
  };
}
