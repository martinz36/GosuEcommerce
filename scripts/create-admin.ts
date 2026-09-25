import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "martin@myv-investments.com";
  const rawPassword = "Password123";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      passwordHash,
      name: "Martín Admin",
    },
    create: {
      email,
      name: "Martín Admin",
      passwordHash,
      role: "ADMIN",
      loyaltyPoints: 1000,
    },
  });

  console.log("SUCCESFULLY CREATED / UPDATED ADMIN USER:");
  console.log({
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
  });
}

main()
  .catch((e) => {
    console.error("Error creating admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
