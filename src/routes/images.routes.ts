import { Router } from "express";
import { ImagesController } from "../controllers";

import { upload } from "../utils";

const routes = Router();

routes.get("/", ImagesController.getAll);

routes.post("/", upload.single("image"), ImagesController.saveImage);

export default routes;
