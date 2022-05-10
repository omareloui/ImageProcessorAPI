import { Router } from "express";
import { PlaceholderController } from "../controllers";

const routes = Router();

routes.get("/", PlaceholderController.createPlaceholder);

export default routes;
