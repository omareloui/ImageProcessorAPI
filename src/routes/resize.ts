import { Router } from "express";
import { APIError, ImageHelper } from "../lib";

const routes = Router();

routes.get("/", async (req, res, next) => {
  const options = req.query;
  try {
    const newImage = await ImageHelper.resizeImage(options);
    res.writeHead(200, {
      "Content-Type": "image/jpeg",
      "Content-Length": newImage.length,
    });

    res.end(newImage);
  } catch (e) {
    const error = e as Error;
    next(new APIError(error.message, 400));
  }
});

routes.delete("/cache", async (_req, res, next) => {
  try {
    await ImageHelper.removeCache();
    res.end({ ok: true });
  } catch (e) {
    const error = e as Error;
    next(new APIError(error.message));
  }
});

export default routes;
