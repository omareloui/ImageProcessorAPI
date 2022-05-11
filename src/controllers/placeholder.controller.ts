import type { RequestHandler } from "express";

import { APIError, ImageHelper } from "../lib";

export class PlaceholderController {
  public static createPlaceholder: RequestHandler = async (req, res, next) => {
    const options = req.query;
    try {
      const { image, filetype, isFromCache } =
        await ImageHelper.createPlaceholder(options);
      res.writeHead(200, {
        "Content-Type": `image/${filetype}`,
        "Content-Length": image.length,
      });
      res.end(image);
    } catch (e) {
      const error = e as Error;
      next(new APIError(error.message, 400));
    }
  };
}
