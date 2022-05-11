import { Router } from "express";
import { ImagesController } from "../controllers";

const routes = Router();

routes.get("/", ImagesController.getAll);

export default routes;
