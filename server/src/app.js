import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import requestsRoutes from "./routes/requests.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api", authRoutes);
app.use("/api", requestsRoutes);
app.use("/api", galleryRoutes);
app.use("/api", reviewsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
