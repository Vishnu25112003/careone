import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import requestsRoutes from "./routes/requests.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Required when hosted behind a reverse proxy so the rate limiter sees each
// visitor's real IP instead of the proxy's. A value of 1 means "read the
// rightmost X-Forwarded-For entry", so every proxy in front of this app must
// forward the visitor's address as that last entry rather than appending its
// own. See docs/HOSTING.md, "Forwarded headers are passed through".
app.set("trust proxy", 1);

// CLIENT_ORIGIN accepts a comma-separated list, e.g.
// "https://careone.example.com,http://localhost:5173"
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api", authRoutes);
app.use("/api", requestsRoutes);
app.use("/api", galleryRoutes);
app.use("/api", reviewsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
