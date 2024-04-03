import express from "express";
import proxyRoutes from "./routes/proxy-routes";

const app = express();

app.use("/", proxyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
