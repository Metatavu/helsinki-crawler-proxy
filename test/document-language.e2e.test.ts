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

describe("Document language end to end test suite", () => {
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

  test("Should detect language from Drupal settings JSON", async () => {
    const fiUrls = ResourceUtils.getTestHelFiLandingPageUrlsFi();
    const svUrls = ResourceUtils.getTestHelFiLandingPageUrlsSv();

    for (const url of fiUrls) {
      const { mockId, mockUrl } = await wiremockTestContainer.mockResource(url);

      const responseHtml = await DockerUtils.runCurl({
        network: network.getId(),
        insecure: true,
        proxyUrl: proxyTestContainer.getProxyUrl(),
        url: mockUrl,
      });

      const $ = cheerio.load(responseHtml);

      expect($('head>meta[name="language"]').attr("content")).toBe("fi");
      expect($('head>meta[name="language"]').attr("class")).toBe("elastic");

      await wiremockTestContainer.unmock(mockId);
    }

    for (const url of svUrls) {
      const { mockId, mockUrl } = await wiremockTestContainer.mockResource(url);

      const responseHtml = await DockerUtils.runCurl({
        network: network.getId(),
        insecure: true,
        proxyUrl: proxyTestContainer.getProxyUrl(),
        url: mockUrl,
      });

      const $ = cheerio.load(responseHtml);

      expect($('head>meta[name="language"]').attr("content")).toBe("sv");
      expect($('head>meta[name="language"]').attr("class")).toBe("elastic");

      await wiremockTestContainer.unmock(mockId);
    }
  });

  test("Should detect language from URL", async () => {
    const svUrls = ResourceUtils.getOtherTestUrlsSv();

    for (const url of svUrls) {
      const { mockId, mockUrl } = await wiremockTestContainer.mockResource(url);

      const responseHtml = await DockerUtils.runCurl({
        network: network.getId(),
        insecure: true,
        proxyUrl: proxyTestContainer.getProxyUrl(),
        url: mockUrl,
      });

      const $ = cheerio.load(responseHtml);

      expect($('head>meta[name="language"]').attr("content")).toBe("sv");
      expect($('head>meta[name="language"]').attr("class")).toBe("elastic");

      await wiremockTestContainer.unmock(mockId);
    }
  });

  test("Should detect language from body content", async () => {
    const url = new URL("https://www.example.com");

    const { mockId, mockUrl } = await wiremockTestContainer.mockResource(url);

    const responseHtml = await DockerUtils.runCurl({
      network: network.getId(),
      insecure: true,
      proxyUrl: proxyTestContainer.getProxyUrl(),
      url: mockUrl,
    });

    const $ = cheerio.load(responseHtml);

    expect($('head>meta[name="language"]').attr("content")).toBe("en");
    expect($('head>meta[name="language"]').attr("class")).toBe("elastic");

    await wiremockTestContainer.unmock(mockId);
  });
});
