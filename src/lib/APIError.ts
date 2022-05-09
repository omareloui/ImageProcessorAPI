import config from "../config";
const { isProd } = config;

export class APIError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);

    this.stack = isProd ? "🥞" : this.stack;
    this.statusCode = statusCode;
  }
}
