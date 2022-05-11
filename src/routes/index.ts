import { Router } from "express";

import resizeRoutes from "./api/resize.routes";
import placeholderRoutes from "./api/placeholder.routes";
import imagesRoutes from "./api/images.routes";
import viewsRoutes from "./views.routes";

const router = Router();

router.use("/api", imagesRoutes, placeholderRoutes, resizeRoutes);
router.use(viewsRoutes);

export default router;
