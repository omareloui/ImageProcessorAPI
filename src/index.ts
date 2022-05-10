import "dotenv/config";

import Express from "express";
import morgan from "morgan";
import helmet from "helmet";

import routes from "./routes";
import { errorHandler } from "./utils";

import config from "./config";
const { port, isProd, isTestEnv } = config;

const app = Express();

app.use(helmet());
if (!isTestEnv) app.use(morgan(isProd ? "combined" : "dev"));

app.use(Express.static("./public"));

app.use("/api", routes);
app.use(errorHandler);

function init() {
  app.listen(port, () => {
    console.info(`Listening on http://127.0.0.1:${port}`);
  });
}

if (!isTestEnv) init();

export { app };
