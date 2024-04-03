import dotenv from 'dotenv';
import { cleanEnv, str, num } from 'envalid';

dotenv.config();

const env = cleanEnv(process.env, {
  PROXY_HOST: str({"default": "test-proxy.metatavu.io"}),
  PROXY_PORT: num({"default": 3128}),
  PROXY_USERNAME: str({"default": "proxyuser"}),
  PROXY_PASSWORD: str({"default": "proxypass"})
});

export const config = {
  proxy: {
    host: env.PROXY_HOST,
    port: env.PROXY_PORT,
    username: env.PROXY_USERNAME,
    password: env.PROXY_PASSWORD
  },
};