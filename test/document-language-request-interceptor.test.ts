import DocumentLanguageRequestInterceptor from "../src/interceptors/document-language-request-interceptor";
import ResourceUtils from "./utils/resource-utils";
import { expect, test, describe } from "vitest";

describe("Document language request interceptor test suite", () => {
  test("Should intercept urls in hel.fi domain", async () => {
    const interceptor = new DocumentLanguageRequestInterceptor();

    for (const url of ResourceUtils.getTestHelFiUrls()) {
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      expect(interceptor.shouldIntercept(headers, url)).toBe(true);
    }
  });

  test("Should intercept urls outside hel.fi domain", async () => {
    const interceptor = new DocumentLanguageRequestInterceptor();

    for (const url of ResourceUtils.getOtherTestUrls()) {
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      expect(interceptor.shouldIntercept(headers, url)).toBe(true);
    }
  });

  test("Should detect language from Drupal settings JSON", async () => {
    const interceptor = new DocumentLanguageRequestInterceptor();
    const fiUrls = ResourceUtils.getTestHelFiLandingPageUrlsFi();
    const svUrls = ResourceUtils.getTestHelFiLandingPageUrlsSv();

    for (const url of fiUrls) {
      const $ = ResourceUtils.getTestResourceForUrl(url);
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      await interceptor.intercept(headers, url, $);
      expect($('head>meta[name="language"]').attr("content")).toBe("fi");
      expect($('head>meta[name="language"]').attr("class")).toBe("elastic");
    }

    for (const url of svUrls) {
      const $ = ResourceUtils.getTestResourceForUrl(url);
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      await interceptor.intercept(headers, url, $);
      expect($('head>meta[name="language"]').attr("content")).toBe("sv");
      expect($('head>meta[name="language"]').attr("class")).toBe("elastic");
    }
  });

  test("Should detect language from URL", async () => {
    const interceptor = new DocumentLanguageRequestInterceptor();
    const svUrls = ResourceUtils.getOtherTestUrlsSv();

    for (const url of svUrls) {
      const $ = ResourceUtils.getTestResourceForUrl(url);
      const headers = ResourceUtils.getRequestHeadersForUrl(url);
      await interceptor.intercept(headers, url, $);
      expect($('head>meta[name="language"]').attr("content")).toBe("sv");
      expect($('head>meta[name="language"]').attr("class")).toBe("elastic");
    }
  });

  test("Should detect language from body content", async () => {
    const interceptor = new DocumentLanguageRequestInterceptor();

    const url = new URL("https://www.example.com");
    const $ = ResourceUtils.getTestResourceForUrl(url);
    const headers = ResourceUtils.getRequestHeadersForUrl(url);
    await interceptor.intercept(headers, url, $);
    expect($('head>meta[name="language"]').attr("content")).toBe("en");
    expect($('head>meta[name="language"]').attr("class")).toBe("elastic");
  });

  test("Should detect language from html lang attribute", async () => {
    const interceptor = new DocumentLanguageRequestInterceptor();

    const url = new URL("https://www.example.com");
    const $ = ResourceUtils.getTestResourceForUrl(url);
    $("html").attr("lang", "no");
    $("body").html("<p/>");
    const headers = ResourceUtils.getRequestHeadersForUrl(url);
    await interceptor.intercept(headers, url, $);
    expect($('head>meta[name="language"]').attr("content")).toBe("no");
    expect($('head>meta[name="language"]').attr("class")).toBe("elastic");
  });

  test("Should default to fi if language cannot be detected", async () => {
    const interceptor = new DocumentLanguageRequestInterceptor();

    const url = new URL("https://www.example.com");
    const $ = ResourceUtils.getTestResourceForUrl(url);
    $("body").html("<p/>");
    const headers = ResourceUtils.getRequestHeadersForUrl(url);
    await interceptor.intercept(headers, url, $);
    expect($('head>meta[name="language"]').attr("content")).toBe("fi");
    expect($('head>meta[name="language"]').attr("class")).toBe("elastic");
  });
});
