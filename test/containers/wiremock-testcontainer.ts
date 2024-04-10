import { GenericContainer, type StartedNetwork, type StartedTestContainer, type TestContainer } from "testcontainers";
import { BodyType, WireMock, type IWireMockFeatures } from "wiremock-captain";
import ResourceUtils from "../utils/resource-utils";
import { HttpWaitStrategy } from "testcontainers/build/wait-strategies/http-wait-strategy";

/**
 * WiremockTestContainer is a test container that runs a Wiremock server for testing purposes.
 */
export default class WiremockTestContainer {
  private wiremockContainer: TestContainer;
  private startedWiremockContainer: StartedTestContainer | null = null;

  /**
   * Creates a new WiremockTestContainer.
   */
  constructor() {
    this.wiremockContainer = new GenericContainer("wiremock/wiremock:3.5.2")
      .withExposedPorts(8080)
      .withNetworkAliases("wiremock");
  }

  /**
   * Starts the Wiremock container.
   *
   * @param network network to start the container on
   */
  public async start(network: StartedNetwork) {
    this.startedWiremockContainer = await this.wiremockContainer.withNetwork(network).start();
  }

  /**
   * Stops the Wiremock container.
   */
  public async stop() {
    if (this.startedWiremockContainer) {
      await this.startedWiremockContainer.stop();
    }
  }

  /**
   * Returns the URL of the Wiremock server.
   *
   * @returns The URL of the Wiremock server.
   */
  public getWiremockUrl() {
    if (!this.startedWiremockContainer) {
      return null;
    }

    return `http://localhost:${this.startedWiremockContainer.getMappedPort(8080)}`;
  }

  /**
   * Returns the Wiremock client.
   *
   * @returns The Wiremock client.
   */
  public getWiremock() {
    const wiremockUrl = this.getWiremockUrl();
    if (!wiremockUrl) {
      throw new Error("Wiremock not started");
    }

    return new WireMock(wiremockUrl);
  }

  /**
   * Mocks a resource with Wiremock.
   *
   * @param url URL of the resource to mock
   * @returns The ID and URL of the mocked resource
   */
  public async mockResource(url: URL) {
    const wiremock = this.getWiremock();

    const mockPath = `/${url.toString().replace("https://", "")}`;
    const html = ResourceUtils.loadHtmlForUrl(url);

    const mocked = await wiremock.register(
      {
        method: "GET",
        endpoint: mockPath,
      },
      {
        body: html,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
        status: 200,
      },
      {
        responseBodyType: BodyType.Body,
      },
    );

    return {
      mockId: mocked.id,
      mockUrl: new URL(`http://wiremock:8080${mockPath}`),
    };
  }

  /**
   * Unmocks a resource with Wiremock.
   *
   * @param id ID of the resource to unmock
   */
  public async unmock(id: string) {
    const wiremock = this.getWiremock();

    await wiremock.deleteMapping(id);
  }
}
