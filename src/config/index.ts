const isProd = process.env.NODE_ENV === "production";
const isTestEnv = process.env.NODE_ENV === "test";

const config = {
  isProd,
  isTestEnv,
  port: isTestEnv ? process.env.TEST_PORT || 4000 : process.env.PORT || 3000,
};

export default config;
