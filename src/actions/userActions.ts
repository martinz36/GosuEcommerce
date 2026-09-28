"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function changePassword(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId || !session?.user?.email) {
      return { success: false, error: "Debes iniciar sesión para cambiar tu contraseña." };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword) {
      return { success: false, error: "Todos los campos de contraseña son obligatorios." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return { success: false, error: "La confirmación de la nueva contraseña no coincide." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado en la base de datos." };
    }

    // Si el usuario tiene una contraseña previa, validar la contraseña actual
    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return { success: false, error: "La contraseña actual es incorrecta." };
      }
    }

    // Hashear la nueva contraseña y actualizar en Neon DB
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return { success: true, message: "Contraseña actualizada exitosamente." };
  } catch (error: any) {
    console.error("Error al cambiar contraseña:", error);
    return { success: false, error: error.message || "Error al procesar el cambio de contraseña." };
  }
}
