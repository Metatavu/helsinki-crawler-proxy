import Docker from "dockerode";

const docker = new Docker();

/**
 * Docker utility functions
 */
namespace DockerUtils {
  /**
   * Run a curl command in a container
   *
   * @param options options
   * @returns The output of the curl command
   */
  export const runCurl = async (options: {
    insecure: boolean;
    proxyUrl: URL;
    url: URL;
    network: string;
  }): Promise<string> => {
    const params = ["-x", options.proxyUrl.toString(), "-sS", "--insecure", options.url.toString()];

    return new Promise((resolve, reject) => {
      docker
        .createContainer({
          Image: "quay.io/curl/curl:8.7.1",
          Cmd: ["sh", "-c", `curl ${params.join(" ")} > /tmp/output`],
          AttachStdout: true,
          AttachStderr: true,
          HostConfig: {
            NetworkMode: options.network,
          },
        })
        .then((container) => {
          return container
            .start()
            .then(() => container)
            .catch((error) => {
              container.remove();
              throw error;
            });
        })
        .then((container) => {
          return container.wait().then(() => container);
        })
        .then((container) => {
          return container.getArchive({ path: "/tmp/output" });
        })
        .then((stream) => {
          const chunks: string[] = [];
          stream.on("data", (chunk: Buffer) => {
            chunks.push(chunk.toString());
          });

          stream.on("end", () => {
            const output = chunks.join("");
            const start = output.indexOf("<");
            const end = output.lastIndexOf(">");
            resolve(output.substring(start, end + 1));
          });
        })
        .catch(reject);
    });
  };
}

export default DockerUtils;
