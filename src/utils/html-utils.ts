import type * as cheerio from "cheerio";

/**
 * Utility functions for HTML
 */
namespace HtmlUtils {
  /**
   * Returns meta tag content for given name or null if meta tag does not exist or content is empty.
   *
   * @param $ cheerio instance
   * @param name meta tag name
   * @returns meta tag content for given name
   */
  export const getMetaTag = ($: cheerio.CheerioAPI, name: string): string | null => {
    return $(`head>meta[name="${name}"]`).attr("content") || null;
  };

  /**
   * Sets meta tag content for given name. If meta tag does not exist, it will be created otherwise the content will be updated.
   *
   * @param $ cheerio instance
   * @param name meta tag name
   * @param content meta tag content
   * @param className optional class name for the meta tag
   */
  export const setMetaTag = ($: cheerio.CheerioAPI, name: string, content: string, className?: string) => {
    const metaTag = $(`head>meta[name="${name}"]`);
    let element = null;

    if (metaTag.length) {
      element = metaTag.attr("content", content);
    } else {
      element = $("<meta>").attr("name", name).attr("content", content).appendTo("head");
    }

    if (className) {
      element.addClass(className);
    }
  };
}

export default HtmlUtils;
