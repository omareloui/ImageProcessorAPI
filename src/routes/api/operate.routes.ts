import { Router } from "express";
import { OperateController } from "../../controllers";

const routes = Router();

routes.route("/operate").get(OperateController.operate);

routes.route("/operate/cache").delete(OperateController.clearCache);

export default routes;
