import { Router } from "express";

import resizeRoutes from "./resize";

const routes = Router();

routes.use("/resize", resizeRoutes);

export default routes;
