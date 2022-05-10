import { Router } from "express";
import { APIError, ImageHelper } from "../lib";

const routes = Router();

routes.get("/", async (req, res, next) => {
  const options = req.query;
  try {
    const newImage = await ImageHelper.createPlaceholder(options);
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

export default routes;
