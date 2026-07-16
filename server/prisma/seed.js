import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const username = process.env.ADMIN_SEED_USERNAME || "admin";
const password = process.env.ADMIN_SEED_PASSWORD;

if (!password) {
  console.error("ADMIN_SEED_PASSWORD is not set in .env — aborting seed.");
  process.exit(1);
}

// Keep the admin credentials in sync with the env vars: creating the
// user on first run, and rehashing only when the password actually changed.
const existing = await prisma.admin.findUnique({ where: { username } });

if (!existing) {
  const hash = await bcrypt.hash(password, 10);
  await prisma.admin.create({ data: { username, password: hash } });
  console.log(`Admin user "${username}" created.`);
} else if (await bcrypt.compare(password, existing.password)) {
  console.log(`Admin user "${username}" is ready (password unchanged).`);
} else {
  const hash = await bcrypt.hash(password, 10);
  await prisma.admin.update({ where: { username }, data: { password: hash } });
  console.log(`Admin user "${username}" password updated from env.`);
}
await prisma.$disconnect();
