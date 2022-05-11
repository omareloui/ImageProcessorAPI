import { Router } from "express";

import resizeRoutes from "./resize.routes";
import placeholderRoutes from "./placeholder.routes";
import imagesRoutes from "./images.routes";

const routes = Router();

routes.use("/images", imagesRoutes);
routes.use("/resize", resizeRoutes);
routes.use("/placeholder", placeholderRoutes);

export default routes;
