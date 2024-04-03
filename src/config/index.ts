import dotenv from "dotenv";
import { cleanEnv, num, str } from "envalid";

dotenv.config();

const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  SSL_KEY: str(),
  SSL_CERT: str(),
});

export default {
  http: {
    port: env.PORT,
    ssl: {
      key: env.SSL_KEY,
      cert: env.SSL_CERT,
    },
  },
};
