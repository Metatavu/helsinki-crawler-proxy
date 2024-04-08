import { DateTime } from "luxon";
import NewsPublishedRequestInterceptor from "../src/interceptors/news-published-request-interceptor";
import ResourceUtils from "./utils/resource-utils";
import { expect, test, describe } from "vitest";

describe("News published request interceptor test suite", () => {
  test("Should intercept urls in hel.fi domain", async () => {
    const interceptor = new NewsPublishedRequestInterceptor();

    for (const url of ResourceUtils.getTestHelFiUrls()) {
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      expect(interceptor.shouldIntercept(headers)).toBe(true);
    }
  });

  test("Should not intercept urls outside hel.fi domain", async () => {
    const interceptor = new NewsPublishedRequestInterceptor();

    for (const url of ResourceUtils.getOtherTestUrls()) {
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      expect(interceptor.shouldIntercept(headers)).toBe(false);
    }
  });

  test("Should add news publish date meta tag to pages news pages", async () => {
    const interceptor = new NewsPublishedRequestInterceptor();
    const testNewsUrls = ResourceUtils.getTestHelFiNewsArticleUrls();

    const results = await Promise.all(
      testNewsUrls.map(async (url) => {
        const $ = ResourceUtils.getTestResourceForUrl(url);
        const headers = ResourceUtils.getRequestHeadersForUrl(url);
        await interceptor.intercept(headers, url, $);
        expect($('head>meta[name="news_published"]').attr("content")).toBe(
          DateTime.fromISO("2024-03-20T11:45:36.000+02:00").toISO(),
        );
        expect($('head>meta[name="news_published"]').attr("class")).toBe("elastic");
      }),
    );

    expect(results.length).toBe(testNewsUrls.length);
  });

  test("Should not add publish date meta tag to service pages", async () => {
    const interceptor = new NewsPublishedRequestInterceptor();
    const testServiceUrls = ResourceUtils.getTestHelFiServiceUrls();

    const results = await Promise.all(
      testServiceUrls.map(async (url) => {
        const $ = ResourceUtils.getTestResourceForUrl(url);
        const headers = ResourceUtils.getRequestHeadersForUrl(url);
        await interceptor.intercept(headers, url, $);
        expect($('head>meta[name="news_published"]').length).toBe(0);
      }),
    );

    expect(results.length).toBe(testServiceUrls.length);
  });

  test("Should not add publish meta tag to unit pages", async () => {
    const interceptor = new NewsPublishedRequestInterceptor();
    const testUnitUrls = ResourceUtils.getTestHelFiUnitUrls();

    const results = await Promise.all(
      testUnitUrls.map(async (url) => {
        const $ = ResourceUtils.getTestResourceForUrl(url);
        const headers = ResourceUtils.getRequestHeadersForUrl(url);
        await interceptor.intercept(headers, url, $);
        expect($('head>meta[name="news_published"]').length).toBe(0);
      }),
    );

    expect(results.length).toBe(testUnitUrls.length);
  });

  test("Should not add publish meta tag to landing pages", async () => {
    const interceptor = new NewsPublishedRequestInterceptor();
    const testLandingUrls = ResourceUtils.getTestHelFiLandingPageUrls();

    const results = await Promise.all(
      testLandingUrls.map(async (url) => {
        const $ = ResourceUtils.getTestResourceForUrl(url);
        const headers = ResourceUtils.getRequestHeadersForUrl(url);
        await interceptor.intercept(headers, url, $);
        expect($('head>meta[name="news_published"]').length).toBe(0);
      }),
    );

    expect(results.length).toBe(testLandingUrls.length);
  });
});
