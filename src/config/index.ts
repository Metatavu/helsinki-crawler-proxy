import dotenv from "dotenv";
import { cleanEnv, num, str } from "envalid";

dotenv.config();

const env = cleanEnv(process.env, {
  HTTP_PORT: num({ default: 3000 }),
  HTTPS_PORT: num({ default: 3443 }),
  LOGGING_LEVEL: str({ default: "info" }),
  CA_CACHE_DIR: str(),
  CA_CERTIFICATE: str(),
  CA_PRIVATE_KEY: str(),
  CA_PUBLIC_KEY: str(),
  USERNAME: str(),
  PASSWORD: str()
});

export default {
  logging: {
    level: env.LOGGING_LEVEL
  },
  http: {
    port: env.HTTP_PORT
  },
  https: {
    port: env.HTTPS_PORT
  },
  ca: {
    cacheDir: env.CA_CACHE_DIR,
    certificate: env.CA_CERTIFICATE,
    privateKey: env.CA_PRIVATE_KEY,
    publicKey: env.CA_PUBLIC_KEY
  },
  security: {
    username: env.USERNAME,
    password: env.PASSWORD
  }
};
