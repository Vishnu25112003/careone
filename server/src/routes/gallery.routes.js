import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  handleUpload,
  listGallery,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "../controllers/gallery.controller.js";

const router = Router();

router.get("/gallery", listGallery);

router.post("/admin/gallery", requireAuth, handleUpload, createGalleryImage);
router.patch("/admin/gallery/:id", requireAuth, updateGalleryImage);
router.delete("/admin/gallery/:id", requireAuth, deleteGalleryImage);

export default router;
