import { Router } from "express";
import { ResizeController } from "../controllers";

const routes = Router();

routes.get("/", ResizeController.resize);

routes.delete("/cache", ResizeController.clearCache);

export default routes;
