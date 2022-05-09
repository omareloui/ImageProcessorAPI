import Express from "express";

import config from "./config";

import routes from "./routes";

const { port, isTestEnv } = config;

const app = Express();

app.use(routes);

function init() {
  app.listen(port, () => {
    console.info(`Listening on http://127.0.0.1:${port}`);
  });
}

if (!isTestEnv) init();

export { app };
