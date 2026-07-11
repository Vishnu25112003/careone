import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createRequest,
  listRequests,
  updateRequestStatus,
  deleteRequest,
  getStats,
} from "../controllers/requests.controller.js";

// Spam protection on the public enquiry endpoint
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later or call us directly." },
});

const router = Router();

router.post("/requests", enquiryLimiter, createRequest);

router.get("/admin/stats", requireAuth, getStats);
router.get("/admin/requests", requireAuth, listRequests);
router.patch("/admin/requests/:id", requireAuth, updateRequestStatus);
router.delete("/admin/requests/:id", requireAuth, deleteRequest);

export default router;
