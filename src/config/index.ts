import dotenv from "dotenv";
import { cleanEnv, num, str } from "envalid";

dotenv.config();

const env = cleanEnv(process.env, {
  HTTP_PORT: num({ default: 3000 }),
  HTTPS_PORT: num({ default: 3443 }),
  SSL_KEY: str(),
  SSL_CERT: str(),
  LOGGING_LEVEL: str({ default: "info" })
});

export default {
  logging: {
    level: env.LOGGING_LEVEL
  },
  http: {
    port: env.HTTP_PORT
  },
  https: {
    port: env.HTTPS_PORT,
    sslKey: env.SSL_KEY,
    sslCert: env.SSL_CERT
  }
};
