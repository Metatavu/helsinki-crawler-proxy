import * as path from "node:path";
import { GenericContainer, type StartedNetwork, type StartedTestContainer, type TestContainer } from "testcontainers";
import { LogWaitStrategy } from "testcontainers/build/wait-strategies/log-wait-strategy";

/**
 * ProxyTestContainer is a test container that runs a proxy server for testing purposes.
 */
export default class ProxyTestContainer {
  private proxyContainer: TestContainer | null = null;
  private startedProxyContainer: StartedTestContainer | null = null;

  /**
   * Starts the proxy container.
   *
   * @param network network to start the container on
   */
  public async start(network: StartedNetwork) {
    if (!this.proxyContainer) {
      await this.build();
    }

    if (!this.proxyContainer) {
      throw new Error("Proxy container not built");
    }

    this.startedProxyContainer = await this.proxyContainer
      .withNetwork(network)
      .withLogConsumer((stream) => {
        stream.on("data", (data) => {
          console.log(`Proxy: ${data.toString()}`);
        });
      })
      .withWaitStrategy(new LogWaitStrategy("HTTP Proxy listening on port 3000, HTTPS Proxy listening on port 3443", 1))
      .start();
  }

  /**
   * Stops the proxy container.
   */
  public async stop() {
    if (this.startedProxyContainer) {
      await this.startedProxyContainer.stop();
    }
  }

  /**
   * Returns the URL of the proxy server.
   *
   * @returns The URL of the proxy server.
   */
  public getProxyUrl() {
    if (!this.startedProxyContainer) {
      throw new Error("Proxy container not started");
    }

    return new URL("http://proxy:3000");
  }

  /**
   * Builds the proxy container.
   */
  private async build() {
    const context = path.join(__dirname, "..", "..");

    try {
      this.proxyContainer = (await GenericContainer.fromDockerfile(context).build())
        .withEnvironment({ NODE_ENV: "e2e", LOGGING_LEVEL: "debug" })
        .withExposedPorts(3000)
        .withNetworkAliases("proxy")
    } catch (error) {
      console.error("Error building proxy container Docker image:", error);
      throw error;
    }
  }
}
