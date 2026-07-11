import { prisma } from "../lib/prisma.js";

const SERVICE_OPTIONS = [
  "Elder Care",
  "Bedridden Patient Care",
  "Stroke Patient Care",
  "Tracheostomy Patient Care",
  "Post Operative Care",
  "Medical Equipment Rental",
  "Ambulance Services",
  "Palliative Care",
  "Not sure — need guidance",
  "Other",
];

const STATUSES = ["NEW", "CONTACTED", "CLOSED"];

function validateEnquiry(body = {}) {
  const errors = [];
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const { service, message } = body;

  if (name.length < 2 || name.length > 60) errors.push("Name must be 2-60 characters");
  if (!/^[6-9]\d{9}$/.test(phone)) errors.push("Phone must be a valid 10-digit Indian mobile number");
  if (!SERVICE_OPTIONS.includes(service)) errors.push("Service must be one of the listed options");
  if (message != null && (typeof message !== "string" || message.length > 500)) {
    errors.push("Message must be at most 500 characters");
  }

  return {
    errors,
    data: { name, phone, service, message: typeof message === "string" && message.trim() ? message.trim() : null },
  };
}

export async function createRequest(req, res, next) {
  try {
    const { errors, data } = validateEnquiry(req.body);
    if (errors.length) return res.status(400).json({ error: errors[0], errors });
    const request = await prisma.request.create({ data });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

export async function listRequests(req, res, next) {
  try {
    const { status } = req.query;
    const where = status && STATUSES.includes(status) ? { status } : {};
    const requests = await prisma.request.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

export async function updateRequestStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid request id" });
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status must be NEW, CONTACTED or CLOSED" });
    }
    const request = await prisma.request.update({ where: { id }, data: { status } });
    res.json(request);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Request not found" });
    next(err);
  }
}

export async function deleteRequest(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid request id" });
    await prisma.request.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Request not found" });
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const [newCount, totalCount, galleryCount, latest] = await Promise.all([
      prisma.request.count({ where: { status: "NEW" } }),
      prisma.request.count(),
      prisma.galleryImage.count(),
      prisma.request.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);
    res.json({ newCount, totalCount, galleryCount, latest });
  } catch (err) {
    next(err);
  }
}
