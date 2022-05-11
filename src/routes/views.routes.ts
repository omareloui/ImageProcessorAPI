import { Router } from "express";
import { ImageHelper } from "../lib";

const router = Router();

router.route("/").get((_req, res) => res.render("index"));

router.route("/*").get((_req, res) => res.render("image"));

export default router;
