import type { RequestHandler } from "express";

import { APIError, ImageHelper } from "../lib";

export class ResizeController {
  public static resize: RequestHandler = async (req, res, next) => {
    const options = req.query;
    try {
      const { image, filetype } = await ImageHelper.resize(options);
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

  public static clearCache: RequestHandler = async (req, res, next) => {
    try {
      await ImageHelper.removeCache();
      res.end({ ok: true });
    } catch (e) {
      const error = e as Error;
      next(new APIError(error.message));
    }
  };
}
