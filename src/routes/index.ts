import { Router } from "express";

import resizeRoutes from "./resize";
import placeholderRoutes from "./placeholder";

const routes = Router();

routes.use("/resize", resizeRoutes);
routes.use("/placeholder", placeholderRoutes);

export default routes;
