import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gumroadRouter from "./gumroad";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gumroadRouter);

export default router;
