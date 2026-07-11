import { getReviews } from "../services/googleReviews.service.js";

export async function listReviews(req, res, next) {
  try {
    res.json(await getReviews());
  } catch (err) {
    next(err);
  }
}
