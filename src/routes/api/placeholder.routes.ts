import { Router } from "express";
import { PlaceholderController } from "../../controllers";

const routes = Router();

routes.route("/placeholder").get(PlaceholderController.createPlaceholder);

export default routes;
