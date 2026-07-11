import { prisma } from "../lib/prisma.js";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function getReviews() {
  const cached = await prisma.cachedReview.findMany({ orderBy: { reviewTime: "desc" } });

  const newestFetch = cached.reduce(
    (max, r) => (r.fetchedAt > max ? r.fetchedAt : max),
    new Date(0)
  );
  const stale = cached.length === 0 || Date.now() - newestFetch.getTime() > CACHE_TTL_MS;
  if (!stale) return cached;

  const fresh = await fetchFromGoogle().catch((err) => {
    console.warn("Google reviews refresh failed, serving cached:", err.message);
    return null;
  });
  if (!fresh || fresh.length === 0) return cached;

  await prisma.$transaction([
    prisma.cachedReview.deleteMany(),
    prisma.cachedReview.createMany({ data: fresh }),
  ]);
  return prisma.cachedReview.findMany({ orderBy: { reviewTime: "desc" } });
}

async function fetchFromGoogle() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) throw new Error("Google Places credentials not configured");

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "reviews" },
  });
  if (!res.ok) throw new Error(`Places API responded ${res.status}`);

  const data = await res.json();
  return (data.reviews || [])
    .filter((r) => r.text?.text)
    .map((r) => ({
      authorName: r.authorAttribution?.displayName || "Google user",
      rating: r.rating ?? 5,
      text: r.text.text,
      photoUrl: r.authorAttribution?.photoUri || null,
      reviewTime: r.publishTime ? new Date(r.publishTime) : new Date(),
    }));
}
