import config from "../config";

const { isProd } = config;

export class APIError extends Error {
  public statusMessage: string;

  constructor(public message: string, public statusCode: number = 500) {
    super(message);

    this.stack = isProd ? "" : this.stack;
    this.statusCode = statusCode;

    switch (statusCode) {
      case 304:
        this.statusMessage = "Not Modified";
        break;
      case 400:
        this.statusMessage = "Bad Request";
        break;
      case 401:
        this.statusMessage = "Unauthorized";
        break;
      case 403:
        this.statusMessage = "Forbidden";
        break;
      case 404:
        this.statusMessage = "Not Found";
        break;
      case 409:
        this.statusMessage = "Conflict";
        break;
      default:
        this.statusMessage = "Internal Server Error";
    }
  }
}
