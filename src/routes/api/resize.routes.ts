import { Router } from "express";
import { ResizeController } from "../../controllers";

const routes = Router();

routes.route("/resize").get(ResizeController.resize);

routes.route("/resize/cache").delete(ResizeController.clearCache);

export default routes;
