import { Router } from "express";
import { APIError, ImageOperatorValidator } from "../lib";

const router = Router();

router.route("/").get((_req, res) => res.render("index"));

router.route("/:image").get(async (req, res, next) => {
  try {
    await ImageOperatorValidator.validateImageExistenceByFilename(
      req.params.image
    );
    res.render("image");
  } catch (e) {
    const err = e as Error;
    next(new APIError(err.message, 404));
  }
});

export default router;
