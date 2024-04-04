import * as fs from "node:fs";
import * as path from "node:path";
import * as cheerio from "cheerio";

/**
 * Test resource interface
 */
export interface TestResource {
  url: string;
  $: cheerio.CheerioAPI;
}

namespace ResourceUtils {
  /**
   * Returns test resource for given url
   *
   * @param url url
   * @returns test resource for given url
   */
  export const getTestResourceForUrl = (url: string): TestResource => {
    return {
      url: url,
      $: loadParsedHtmlResource(`${url.replace("https://", "")}.html`),
    };
  };

  /**
   * Loads html resource as string
   *
   * @param resourcePath resource path
   * @returns html resource as string
   */
  export const loadHtmlResource = (resourcePath: string): string => {
    return fs.readFileSync(path.join(__dirname, "..", "resources", resourcePath), "utf8");
  };

  /**
   * Loads and parses test html resource
   *
   * @param resourcePath resource path
   * @returns parsed html resource
   */
  export const loadParsedHtmlResource = (resourcePath: string): cheerio.CheerioAPI => {
    return cheerio.load(loadHtmlResource(resourcePath));
  };

  /**
   * Get request headers for given url
   * 
   * @param url url 
   * @returns request headers for given url
   */
  export const getRequestHeadersForUrl = (url: string) => {
    return {
      host: new URL(url).host,
    };
  };

  /**
   * Returns list of urls from hel.fi domain with content type tpr_unit
   *
   * @returns list of urls from hel.fi domain with content type tpr_unit
   */
  export const getTestHelFiUnitUrls = () => [
    "https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/tukea-lapselle-nuorelle-ja-perheelle/vanhemmuuden-ja-perhearjen-tuki/perheneuvola/perheneuvola-ruotsinkielinen-palvelu",
  ];

  /**
   * Returns list of urls from hel.fi domain with content type tpr_service
   *
   * @returns list of urls from hel.fi domain with content type tpr_service
   */
  export const getTestHelFiServiceUrls = () => [
    "https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/tukea-lapselle-nuorelle-ja-perheelle/vanhemmuuden-ja-perhearjen-tuki/lapsiperheiden-sosiaalineuvonta",
  ];

  /**
   * Returns list of urls from hel.fi domain with content type news_item
   *
   * @returns list of urls from hel.fi domain with content type news_item
   */
  export const getTestHelFiNewsArticleUrls = () => [
    "https://www.hel.fi/fi/uutiset/kaupunkipyorakausi-alkaa-huhtikuun-alussa-0",
  ];

  /**
   * Returns list of urls from hel.fi domain with content type landing page
   *
   * @returns list of urls from hel.fi domain with content type landing page
   */
  export const getTestHelFiLandingPageUrls = () => ["https://www.hel.fi/fi/asuminen/vuokra-asunnot"];

  /**
   * Returns list of urls from hel.fi domain
   *
   * @returns list of urls from hel.fi domain
   */
  export const getTestHelFiUrls = () => {
    return [
      ...getTestHelFiUnitUrls(),
      ...getTestHelFiServiceUrls(),
      ...getTestHelFiNewsArticleUrls(),
      ...getTestHelFiLandingPageUrls(),
    ];
  };

  /**
   * Returns list of domains outside hel.fi domain
   *
   * @returns list of domains outside hel.fi domain
   */
  export const getOtherTestUrls = () => [
    "https://helsinkipaiva.fi/info/",
    "https://nuorten.hel.fi/nuorisotalot/arabian-nuorisotalo/",
  ];

  /**
   * Returns list of malformed urls
   *
   * @returns list of malformed urls
   */
  export const getMalformedUrls = () => [
    "www.example.com",
    "htp://www.example.com",
    "http://example",
    "http://www.exam^ple.com",
    "http://www.exam ple.com",
    "http://",
    "http://:8080",
    "http://www.example.com:port",
    "ht tp://www.example.com",
    "http://#fragment",
    "http://?query=1",
    "http://[192.0.2.1]",
    "http://[::1:2:3:4:5:6:7]",
    "http://www...example.com",
    "HtTp://www.example.com",
    "http://www.example.com//path",
    "http://www.example.com/name&value",
    "http://www.example.com.",
    "http://",
    "",
  ];
}

export default ResourceUtils;
