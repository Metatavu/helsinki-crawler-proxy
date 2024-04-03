import express from "express";
import proxyRoutes from "./routes/proxy-routes";
import https from "node:https";
import config from "./config";

const app = express();
const server = https.createServer(config.http.ssl, app);

app.use("/", proxyRoutes);

server.listen(config.http.port, () => {
  console.log(`Proxy server is running on port ${config.http.port}`);
});
