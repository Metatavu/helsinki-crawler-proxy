import config from "../config";

/**
 * Logging utility
 */
namespace Logging {
  /**
   * Logs a message
   *
   * @param level - The log level
   * @param message - The message to log
   */
  export const log = (level: "error" | "info" | "debug", message: string) => {
    if (level === "debug" && config.logging.level !== "debug") {
      return;
    }

    if (level === "error") {
      console.error(`[${level}] ${message}`);
    } else {
      console.log(`[${level}] ${message}`);
    }
  };

  /**
   * The log level
   */
  export const level = config.logging.level;
}

export default Logging;
