import { describe, expect, test } from "vitest";
import BreadcrumbsRequestInterceptor from "../src/interceptors/breadcrumbs-request-interceptor";
import ResourceUtils from "./utils/resource-utils";

describe("Breadcrumbs request interceptor test suite", () => {
  test("Should intercept urls in hel.fi domain", async () => {
    const interceptor = new BreadcrumbsRequestInterceptor();

    for (const url of ResourceUtils.getTestHelFiUrls()) {
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      expect(interceptor.shouldIntercept(headers, url)).toBe(true);
    }
  });

  test("Should not intercept urls outside hel.fi domain", async () => {
    const interceptor = new BreadcrumbsRequestInterceptor();

    for (const url of ResourceUtils.getOtherTestUrls()) {
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      expect(interceptor.shouldIntercept(headers, url)).toBe(false);
    }
  });

  test("Should add breadcrumbs to news pages", async () => {
    const interceptor = new BreadcrumbsRequestInterceptor();
    const testNewsUrl = ResourceUtils.getTestHelFiNewsArticleUrls()[0];

    const $ = ResourceUtils.getTestResourceForUrl(testNewsUrl);
    const headers = ResourceUtils.getRequestHeadersForUrl(testNewsUrl);
    await interceptor.intercept(headers, testNewsUrl, $);
    const breadcrumbs = $('head>meta[name="breadcrumbs"]');
    const expectedBreadcrumbs = ["Etusivu", "Uutiset", "Kaupunkipyöräkausi alkaa huhtikuun alussa"];

    expect(breadcrumbs.length).toBe(expectedBreadcrumbs.length);
    breadcrumbs.each((index, element) => {
      expect($(element).attr("content")).toBe(expectedBreadcrumbs[index]);
    });
  });

  test("Should add breadcrumbs to service pages", async () => {
    const interceptor = new BreadcrumbsRequestInterceptor();
    const testUrl = ResourceUtils.getTestHelFiServiceUrls()[0];

    const $ = ResourceUtils.getTestResourceForUrl(testUrl);
    const headers = ResourceUtils.getRequestHeadersForUrl(testUrl);
    await interceptor.intercept(headers, testUrl, $);
    const breadcrumbs = $('head>meta[name="breadcrumbs"]');
    const expectedBreadcrumbs = [
      "Etusivu",
      "Sosiaali- ja terveyspalvelut",
      "Lasten ja perheiden palvelut",
      "Tukea lapselle, nuorelle ja perheelle",
      "Vanhemmuuden ja perhearjen tuki",
      "Lapsiperheiden sosiaalineuvonta",
    ];

    expect(breadcrumbs.length).toBe(expectedBreadcrumbs.length);
    breadcrumbs.each((index, element) => {
      expect($(element).attr("content")).toBe(expectedBreadcrumbs[index]);
    });
  });

  test("Should add breadcrumbs to unit pages", async () => {
    const interceptor = new BreadcrumbsRequestInterceptor();
    const testUrl = ResourceUtils.getTestHelFiUnitUrls()[0];

    const $ = ResourceUtils.getTestResourceForUrl(testUrl);
    const headers = ResourceUtils.getRequestHeadersForUrl(testUrl);
    await interceptor.intercept(headers, testUrl, $);
    const breadcrumbs = $('head>meta[name="breadcrumbs"]');
    const expectedBreadcrumbs = [
      "Etusivu",
      "Sosiaali- ja terveyspalvelut",
      "Lasten ja perheiden palvelut",
      "Tukea lapselle, nuorelle ja perheelle",
      "Vanhemmuuden ja perhearjen tuki",
      "Perheneuvola",
      "Perheneuvola, ruotsinkielinen palvelu",
    ];

    expect(breadcrumbs.length).toBe(expectedBreadcrumbs.length);
    breadcrumbs.each((index, element) => {
      expect($(element).attr("content")).toBe(expectedBreadcrumbs[index]);
    });
  });

  test("Should bor add breadcrumbs on example page", async () => {
    const interceptor = new BreadcrumbsRequestInterceptor();
    const testUrl = new URL("https://www.example.com");
    const $ = ResourceUtils.getTestResourceForUrl(testUrl);
    const headers = ResourceUtils.getRequestHeadersForUrl(testUrl);
    await interceptor.intercept(headers, testUrl, $);
    const breadcrumbs = $('head>meta[name="breadcrumbs"]');
    expect(breadcrumbs.length).toBe(0);
  });
});
