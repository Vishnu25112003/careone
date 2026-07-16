import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Test-mode seed: ADDS a dummy admin and dummy gallery images for trying the
// app out. It never modifies or deletes existing rows, so it is safe to run
// on a database that already has real data. Run with: npm run seed:test
//
// Dummy rows are tagged with the "test-dummy/" publicId prefix so they can be
// removed later from the admin gallery manager (Cloudinary destroy for these
// fake ids fails silently — the DB row is still deleted).

const prisma = new PrismaClient();

const TEST_ADMIN_USERNAME = process.env.TEST_ADMIN_USERNAME || "testadmin";
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "Test@1234";

const existingAdmin = await prisma.admin.findUnique({
  where: { username: TEST_ADMIN_USERNAME },
});
if (existingAdmin) {
  console.log(`Test admin "${TEST_ADMIN_USERNAME}" already exists — left as is.`);
} else {
  const hash = await bcrypt.hash(TEST_ADMIN_PASSWORD, 10);
  await prisma.admin.create({
    data: { username: TEST_ADMIN_USERNAME, password: hash },
  });
  console.log(`Test admin created — username: "${TEST_ADMIN_USERNAME}", password: "${TEST_ADMIN_PASSWORD}"`);
}

const dummyImages = [
  { title: "Elder care at home", category: "Elder Care" },
  { title: "Post-surgery recovery support", category: "Nursing Care" },
  { title: "Physiotherapy session", category: "Physiotherapy" },
  { title: "Mother and baby care", category: "Mother & Baby Care" },
  { title: "Companionship visit", category: "Elder Care" },
  { title: "Home nursing check-up", category: "Nursing Care" },
  { title: "Daily living assistance", category: "Care Assistance" },
  { title: "Health monitoring at home", category: "Nursing Care" },
].map((img, i) => ({
  ...img,
  imageUrl: `https://picsum.photos/seed/careone-${i + 1}/800/600`,
  publicId: `test-dummy/${i + 1}`,
  sortOrder: i,
}));

let added = 0;
for (const img of dummyImages) {
  const exists = await prisma.galleryImage.findFirst({
    where: { publicId: img.publicId },
  });
  if (!exists) {
    await prisma.galleryImage.create({ data: img });
    added += 1;
  }
}
console.log(
  added
    ? `Added ${added} dummy gallery image(s).`
    : "Dummy gallery images already present — nothing added."
);

await prisma.$disconnect();
