import "dotenv/config";

import Express from "express";
import morgan from "morgan";
import helmet from "helmet";

import routes from "./routes";
import { errorHandler, notFoundHandler } from "./utils";

import config from "./config";

const { port, isProd, isTestEnv } = config;

const app = Express();

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
if (!isTestEnv) app.use(morgan(isProd ? "combined" : "dev"));

app.use(Express.static("./public"));

app.use(routes);

app.use("*", notFoundHandler);
app.use(errorHandler);

function init() {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.info(`Listening on http://127.0.0.1:${port}`);
  });
}

if (!isTestEnv) init();

export { app };
