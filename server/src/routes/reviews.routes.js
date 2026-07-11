import { Router } from "express";
import { listReviews } from "../controllers/reviews.controller.js";

const router = Router();

router.get("/reviews", listReviews);

export default router;
