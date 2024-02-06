import dotenv from 'dotenv';

dotenv.config();

export const config = {
  proxy: {
    host: process.env.PROXY_HOST || 'example-proxy.metatavu.io',
    port: process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT, 10) : 3128,
    protocol: process.env.PROXY_PROTOCOL || 'https',
    username: process.env.PROXY_USERNAME || 'proxyuser',
    password: process.env.PROXY_PASSWORD || 'proxypass',
  },
};
