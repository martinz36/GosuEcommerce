import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "martin@myv-investments.com";
  const password = "Password123";
  const passwordHash = await bcrypt.hash(password, 10);

  console.log(`Buscando usuario ${email} en Neon DB...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`Usuario existente encontrado (${existingUser.id}). Actualizando contraseña y rol a ADMIN...`);
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
        passwordHash: passwordHash,
        name: existingUser.name || "Martín Admin",
      },
    });
    console.log(`✅ Usuario actualizado exitosamente:`, updatedUser.email, `Rol:`, updatedUser.role);
  } else {
    console.log(`Creando nuevo usuario ADMIN con correo ${email}...`);
    const newUser = await prisma.user.create({
      data: {
        email,
        name: "Martín Admin",
        firstName: "Martín",
        role: "ADMIN",
        passwordHash,
        isProfileCompleted: true,
      },
    });
    console.log(`✅ Usuario ADMIN creado exitosamente:`, newUser.email, `Rol:`, newUser.role);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error en script de seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
