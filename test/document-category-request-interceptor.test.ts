import ResourceUtils from "./utils/resource-utils";
import DocumentCategoryRequestInterceptor from "../src/interceptors/document-category-request-interceptor";

describe("Add  published request interceptor test suite", () => {

  test("Should intercept urls in hel.fi domain", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    ResourceUtils.getTestHelFiUrls().forEach(url => {
      expect(interceptor.shouldIntercept(url)).toBe(true)
    });
  });

  test("Should not intercept urls outside hel.fi domain", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    
    ResourceUtils.getOtherTestUrls().forEach(url => {
      expect(interceptor.shouldIntercept(url)).toBe(false)
    });
  });

  test("Should not intercept with malformed URLs", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();

    ResourceUtils.getMalformedUrls().forEach(url => {
      expect(interceptor.shouldIntercept(url)).toBe(false)
    });
  });
  
  test("Should add news category meta tag to pages news pages", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    const testNewsUrls = ResourceUtils.getTestHelFiNewsArticleUrls();

    const results = await Promise.all(testNewsUrls.map(async (url) => {
      const { $ } = ResourceUtils.getTestResourceForUrl(url);
      await interceptor.intercept(url, $);
      expect($('head>meta[name="elastic:category"]').attr('content')).toBe('news');
    }));

    expect(results.length).toBe(testNewsUrls.length);    
  });

  test("Should add service category meta tag to service pages", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    const testServiceUrls = ResourceUtils.getTestHelFiServiceUrls();

    const results = await Promise.all(testServiceUrls.map(async (url) => {
      const { $ } = ResourceUtils.getTestResourceForUrl(url);
      await interceptor.intercept(url, $);
      expect($('head>meta[name="elastic:category"]').attr('content')).toBe('service');
    }));

    expect(results.length).toBe(testServiceUrls.length);
  });

  test("Should add unit category meta tag to unit pages", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    const testUnitUrls = ResourceUtils.getTestHelFiUnitUrls();

    const results = await Promise.all(testUnitUrls.map(async (url) => {
      const { $ } = ResourceUtils.getTestResourceForUrl(url);
      await interceptor.intercept(url, $);
      expect($('head>meta[name="elastic:category"]').attr('content')).toBe('unit');
    }));

    expect(results.length).toBe(testUnitUrls.length);
  });

  test("Should add uncategorized category meta tag to unit pages", async () => {
    const interceptor = new DocumentCategoryRequestInterceptor();
    const testLandingUrls = ResourceUtils.getTestHelFiLandingPageUrls();

    const results = await Promise.all(testLandingUrls.map(async (url) => {
      const { $ } = ResourceUtils.getTestResourceForUrl(url);
      await interceptor.intercept(url, $);
      expect($('head>meta[name="elastic:category"]').attr('content')).toBe('uncategorized');
    }));

    expect(results.length).toBe(testLandingUrls.length);
  });

});