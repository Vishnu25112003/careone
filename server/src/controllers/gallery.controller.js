import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { uploadImage, destroyImage, isCloudinaryConfigured } from "../services/cloudinary.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files are allowed")),
}).single("image");

export function handleUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

export async function listGallery(req, res, next) {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    res.json(images);
  } catch (err) {
    next(err);
  }
}

export async function createGalleryImage(req, res, next) {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ error: "Image uploads are not configured yet (Cloudinary credentials missing)" });
    }
    if (!req.file) return res.status(400).json({ error: "An image file is required" });

    const { title, category } = req.body;
    const sortOrder = req.body.sortOrder ? Number(req.body.sortOrder) : 0;
    if (!Number.isInteger(sortOrder)) return res.status(400).json({ error: "sortOrder must be an integer" });

    let uploaded;
    try {
      uploaded = await uploadImage(req.file.buffer);
    } catch (err) {
      // Surface Cloudinary rejections (bad/limited API key, quota, etc.)
      // instead of a generic 500 — the admin can act on this.
      const detail = err?.error?.message || err?.message || "unknown error";
      console.error("Cloudinary upload failed:", detail);
      return res.status(502).json({ error: `Cloudinary rejected the upload: ${detail}` });
    }
    const image = await prisma.galleryImage.create({
      data: {
        title: title?.trim() || null,
        category: category?.trim() || null,
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        sortOrder,
      },
    });
    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
}

export async function updateGalleryImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid image id" });

    const data = {};
    if ("title" in req.body) data.title = req.body.title?.trim() || null;
    if ("category" in req.body) data.category = req.body.category?.trim() || null;
    if ("sortOrder" in req.body) {
      const sortOrder = Number(req.body.sortOrder);
      if (!Number.isInteger(sortOrder)) return res.status(400).json({ error: "sortOrder must be an integer" });
      data.sortOrder = sortOrder;
    }
    if (!Object.keys(data).length) return res.status(400).json({ error: "Nothing to update" });

    const image = await prisma.galleryImage.update({ where: { id }, data });
    res.json(image);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Image not found" });
    next(err);
  }
}

export async function deleteGalleryImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid image id" });

    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) return res.status(404).json({ error: "Image not found" });

    // Best-effort Cloudinary cleanup — the DB row is removed either way so
    // the public gallery never shows a broken entry.
    try {
      await destroyImage(image.publicId);
    } catch (err) {
      console.warn(`Cloudinary destroy failed for ${image.publicId}:`, err.message);
    }

    await prisma.galleryImage.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
