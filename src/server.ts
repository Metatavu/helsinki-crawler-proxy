import express from "express";
import proxyRoutes from "./routes/proxy-routes";
import https from "node:https";
import fs from "node:fs";
import config from "./config";

const app = express();
const server = https.createServer(
  {
    cert: fs.readFileSync(config.http.ssl.cert, "utf8"),
    key: fs.readFileSync(config.http.ssl.key, "utf8"),
  },
  app,
);

app.use("/", proxyRoutes);

server.listen(config.http.port, () => {
  console.log(`Proxy server is running on port ${config.http.port}`);
});
