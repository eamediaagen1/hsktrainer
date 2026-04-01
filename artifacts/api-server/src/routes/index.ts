import { Router, type IRouter } from "express";
import healthRouter  from "./health.js";
import meRouter      from "./me.js";
import lessonsRouter from "./lessons.js";
import progressRouter from "./progress.js";
import webhookRouter from "./webhook.js";
import adminRouter   from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(lessonsRouter);
router.use(progressRouter);
router.use(webhookRouter);
router.use(adminRouter);

export default router;
