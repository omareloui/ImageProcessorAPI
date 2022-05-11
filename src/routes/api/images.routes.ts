import { Router } from "express";
import { ImagesController } from "../../controllers";

import { upload } from "../../utils";

const routes = Router();

routes
  .route("/images")
  .get(ImagesController.getAll)
  .post(upload.single("image"), ImagesController.saveImage);

export default routes;
