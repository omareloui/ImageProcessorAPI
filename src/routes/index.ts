import { Router } from "express";

import resizeRoutes from "./resize.routes";
import placeholderRoutes from "./placeholder.routes";

const routes = Router();

routes.use("/resize", resizeRoutes);
routes.use("/placeholder", placeholderRoutes);

export default routes;
