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

const hash = await bcrypt.hash(password, 10);

// Upsert with empty update: never overwrites a password the admin
// may have changed after first login.
await prisma.admin.upsert({
  where: { username },
  update: {},
  create: { username, password: hash },
});

console.log(`Admin user "${username}" is ready.`);
await prisma.$disconnect();
