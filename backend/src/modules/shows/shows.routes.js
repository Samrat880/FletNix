import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import * as controller from "./shows.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", controller.listShows);
router.get("/meta", controller.getFilterMeta);
router.get("/:id", controller.getShow);

export default router;
