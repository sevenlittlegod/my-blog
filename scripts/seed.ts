import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seed() {
  const isProduction = process.env.NODE_ENV === "production";
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || "林葛由";

  if (isProduction && (!email || !password)) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD are required when seeding production."
    );
  }

  const adminEmail = email || "admin@example.com";
  const adminPassword = password || "admin123";
  const shouldResetPassword = process.env.ADMIN_RESET_PASSWORD === "true";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    if (shouldResetPassword) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: "ADMIN",
        },
      });
      console.log(`Admin password reset: ${adminEmail}`);
      return;
    }

    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: { name, email: adminEmail, passwordHash, role: "ADMIN" },
  });

  console.log("Admin user created:");
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
