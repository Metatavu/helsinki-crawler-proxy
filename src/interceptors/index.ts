import DocumentCategoryRequestInterceptor from "./document-category-request-interceptor";
import NewsPublishedRequestInterceptor from "./news-published-request-interceptor";

export default [new DocumentCategoryRequestInterceptor(), new NewsPublishedRequestInterceptor()];
