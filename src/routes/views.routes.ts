import { Router } from "express";
import { ImageHelper } from "../lib";

const router = Router();

router.route("/").get((_req, res) => res.render("index"));

router.route("/:image").get((req, res) => {
  const { image } = req.params;
  res.render("image", { image, link: `${ImageHelper.IMAGES_DIR}/${image}` });
});

export default router;
