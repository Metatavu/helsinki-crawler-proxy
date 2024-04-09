import BreadcrumbsRequestInterceptor from "./breadcrumbs-request-interceptor";
import DocumentCategoryRequestInterceptor from "./document-category-request-interceptor";
// import DocumentLanguageRequestInterceptor from "./document-language-request-interceptor";
import NewsPublishedRequestInterceptor from "./news-published-request-interceptor";

export default [
  new DocumentCategoryRequestInterceptor(),
  new NewsPublishedRequestInterceptor(),
  // new DocumentLanguageRequestInterceptor(),
  new BreadcrumbsRequestInterceptor(),
];
