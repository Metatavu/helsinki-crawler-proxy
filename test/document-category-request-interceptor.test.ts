import DocumentCategoryRequestInterceptor from "../src/interceptors/document-category-request-interceptor";
import ResourceUtils from "./utils/resource-utils";
import { expect, test, describe } from "vitest";

describe("Document category request interceptor test suite", () => {
  test("Should intercept urls in hel.fi domain", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();

    for (const url of ResourceUtils.getTestHelFiUrls()) {
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      expect(interceptor.shouldIntercept(headers, url)).toBe(true);
    }
  });

  test("Should not intercept urls outside hel.fi domain", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();

    for (const url of ResourceUtils.getOtherTestUrls()) {
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      expect(interceptor.shouldIntercept(headers, url)).toBe(false);
    }
  });

  test("Should add news category meta tag to pages news pages", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    const testNewsUrls = ResourceUtils.getTestHelFiNewsArticleUrls();

    const results = await Promise.all(
      testNewsUrls.map(async (url) => {
        const $ = ResourceUtils.getTestResourceForUrl(url);
        const headers = ResourceUtils.getRequestHeadersForUrl(url);
        await interceptor.intercept(headers, url, $);
        expect($('head>meta[name="category"]').attr("content")).toBe("news");
        expect($('head>meta[name="category"]').attr("class")).toBe("elastic");
      }),
    );

    expect(results.length).toBe(testNewsUrls.length);
  });

  test("Should add service category meta tag to service pages", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    const testServiceUrls = ResourceUtils.getTestHelFiServiceUrls();

    const results = await Promise.all(
      testServiceUrls.map(async (url) => {
        const $ = ResourceUtils.getTestResourceForUrl(url);
        const headers = ResourceUtils.getRequestHeadersForUrl(url);
        await interceptor.intercept(headers, url, $);
        expect($('head>meta[name="category"]').attr("content")).toBe("service");
        expect($('head>meta[name="category"]').attr("class")).toBe("elastic");
      }),
    );

    expect(results.length).toBe(testServiceUrls.length);
  });

  test("Should add unit category meta tag to unit pages", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    const testUnitUrls = ResourceUtils.getTestHelFiUnitUrls();

    const results = await Promise.all(
      testUnitUrls.map(async (url) => {
        const $ = ResourceUtils.getTestResourceForUrl(url);
        const headers = ResourceUtils.getRequestHeadersForUrl(url);
        await interceptor.intercept(headers, url, $);
        expect($('head>meta[name="category"]').attr("content")).toBe("unit");
        expect($('head>meta[name="category"]').attr("class")).toBe("elastic");
      }),
    );

    expect(results.length).toBe(testUnitUrls.length);
  });

  test("Should add uncategorized category meta tag to unit pages", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    const testLandingUrls = ResourceUtils.getTestHelFiLandingPageUrls();

    const results = await Promise.all(
      testLandingUrls.map(async (url) => {
        const $ = ResourceUtils.getTestResourceForUrl(url);
        const headers = ResourceUtils.getRequestHeadersForUrl(url);
        await interceptor.intercept(headers, url, $);
        expect($('head>meta[name="category"]').attr("content")).toBe("uncategorized");
        expect($('head>meta[name="category"]').attr("class")).toBe("elastic");
      }),
    );

    expect(results.length).toBe(testLandingUrls.length);
  });
});
