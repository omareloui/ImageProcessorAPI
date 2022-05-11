import { Router } from "express";

import operateRoutes from "./api/operate.routes";
import placeholderRoutes from "./api/placeholder.routes";
import imagesRoutes from "./api/images.routes";
import viewsRoutes from "./views.routes";

const router = Router();

router.use("/api", imagesRoutes, placeholderRoutes, operateRoutes);
router.use(viewsRoutes);

export default router;
