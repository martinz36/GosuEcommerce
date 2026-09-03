"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUserAction(formData: FormData) {
  try {
    const emailInput = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!emailInput || !password) {
      return { success: false, error: "El correo electrónico y la contraseña son obligatorios." };
    }

    const email = emailInput.trim().toLowerCase();

    if (password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    // Verificar si el correo ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Ya existe una cuenta registrada con este correo electrónico." };
    }

    // Encriptar contraseña con bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear cliente en Neon Postgres con 50 Puntos de Bienvenida (Loyalty Points)
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName ? firstName.trim() : null,
        lastName: lastName ? lastName.trim() : null,
        name: `${firstName || ''} ${lastName || ''}`.trim() || email.split("@")[0],
        role: "CUSTOMER",
        loyaltyPoints: 50, // Bonus de Bienvenida
      },
    });

    return { success: true, message: "¡Cuenta creada exitosamente! Ahora puedes iniciar sesión." };
  } catch (error: any) {
    console.error("Error al registrar usuario en Neon DB:", error);
    return { success: false, error: error?.message || "Error al crear la cuenta de usuario." };
  }
}
