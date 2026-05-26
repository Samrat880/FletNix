import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import * as controller from "./oauth.controller.js";

const router = Router();

router.get("/authorize", authenticate, controller.authorize);
router.post("/token", controller.token);
router.get("/userinfo", authenticate, controller.userinfo);

export default router;
