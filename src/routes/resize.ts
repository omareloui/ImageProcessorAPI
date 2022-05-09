import { Router } from "express";
import { ResizeArguments } from "../@types";

import { APIError } from "../lib";

const routes = Router();

function validateResizeOptions(
  options: any
): asserts options is ResizeArguments {
  if (!options.filename)
    throw new APIError("You have to provide a filename.", 400);
  if (!options.h && !options.w)
    throw new APIError("You have to provide a size.", 400);
}

routes.get("/", async (req, res, next) => {
  const options = req.query;
  try {
    validateResizeOptions(options);

    console.log("options", options);

    res.send("resized");
  } catch (e) {
    next(e);
  }
});

export default routes;
