import * as cheerio from "cheerio";
import { Network, type StartedNetwork } from "testcontainers";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import ProxyTestContainer from "./containers/proxy-testcontainer";
import WiremockTestContainer from "./containers/wiremock-testcontainer";
import DockerUtils from "./utils/docker-utils";
import ResourceUtils from "./utils/resource-utils";

const wiremockTestContainer: WiremockTestContainer = new WiremockTestContainer();
const proxyTestContainer: ProxyTestContainer = new ProxyTestContainer();
let network: StartedNetwork;

describe("Document category request end to end test suite", () => {
  beforeAll(async () => {
    network = await new Network().start();
    await wiremockTestContainer.start(network);
    await proxyTestContainer.start(network);
  });

  afterAll(async () => {
    await wiremockTestContainer.stop();
    await proxyTestContainer.stop();
    await network.stop();
  });

  test("Should add news category meta tag to pages news pages", async () => {
    const testNewsUrls = ResourceUtils.getTestHelFiNewsArticleUrls();
    for (const url of testNewsUrls) {
      const { mockId, mockUrl } = await wiremockTestContainer.mockResource(url);

      const responseHtml = await DockerUtils.runCurl({
        network: network.getId(),
        insecure: true,
        proxyUrl: proxyTestContainer.getProxyUrl(),
        url: mockUrl,
      });

      const $ = cheerio.load(responseHtml);

      expect($('head>meta[name="category"]').attr("content")).toBe("news");
      expect($('head>meta[name="category"]').attr("class")).toBe("elastic");

      await wiremockTestContainer.unmock(mockId);
    }
  });

  test("Should add unit category meta tag to service pages", async () => {
    const testUnitUrls = ResourceUtils.getTestHelFiServiceUrls();
    for (const url of testUnitUrls) {
      const { mockId, mockUrl } = await wiremockTestContainer.mockResource(url);

      const responseHtml = await DockerUtils.runCurl({
        network: network.getId(),
        insecure: true,
        proxyUrl: proxyTestContainer.getProxyUrl(),
        url: mockUrl,
      });

      const $ = cheerio.load(responseHtml);

      expect($('head>meta[name="category"]').attr("content")).toBe("service");
      expect($('head>meta[name="category"]').attr("class")).toBe("elastic");

      await wiremockTestContainer.unmock(mockId);
    }
  });

  test("Should add unit category meta tag to unit pages", async () => {
    const testUnitUrls = ResourceUtils.getTestHelFiUnitUrls();
    for (const url of testUnitUrls) {
      const { mockId, mockUrl } = await wiremockTestContainer.mockResource(url);

      const responseHtml = await DockerUtils.runCurl({
        network: network.getId(),
        insecure: true,
        proxyUrl: proxyTestContainer.getProxyUrl(),
        url: mockUrl,
      });

      const $ = cheerio.load(responseHtml);

      expect($('head>meta[name="category"]').attr("content")).toBe("unit");
      expect($('head>meta[name="category"]').attr("class")).toBe("elastic");

      await wiremockTestContainer.unmock(mockId);
    }
  });

  test("Should add unit category meta tag to landing pages", async () => {
    const testUnitUrls = ResourceUtils.getTestHelFiLandingPageUrls();
    for (const url of testUnitUrls) {
      const { mockId, mockUrl } = await wiremockTestContainer.mockResource(url);

      const responseHtml = await DockerUtils.runCurl({
        network: network.getId(),
        insecure: true,
        proxyUrl: proxyTestContainer.getProxyUrl(),
        url: mockUrl,
      });

      const $ = cheerio.load(responseHtml);

      expect($('head>meta[name="category"]').attr("content")).toBe("uncategorized");
      expect($('head>meta[name="category"]').attr("class")).toBe("elastic");

      await wiremockTestContainer.unmock(mockId);
    }
  });
});
