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

export async function convertGuestOrderToUserAction(data: {
  email: string;
  password: string;
  orderId?: string;
  name?: string;
  phone?: string;
  addressStr?: string;
}) {
  try {
    const { email, password, orderId, name, phone, addressStr } = data;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Correo electrónico no válido." };
    }

    if (!password || password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    let existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    if (existingUser) {
      if (!existingUser.passwordHash) {
        existingUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash },
        });
      }
    } else {
      existingUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name || "Cliente GOSU",
          passwordHash,
          phone: phone || null,
          role: "USER",
          defaultShippingAddress: addressStr || null,
        },
      });
    }

    if (orderId && existingUser) {
      const order = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderNumber: orderId }, { stripeCheckoutSessionId: orderId }] },
      });

      if (order && !order.userId) {
        await prisma.order.update({
          where: { id: order.id },
          data: { userId: existingUser.id },
        });
      }
    }

    return {
      success: true,
      user: { id: existingUser.id, email: existingUser.email, name: existingUser.name },
      message: "¡Cuenta creada exitosamente! Tu pedido y tus puntos han sido vinculados.",
    };
  } catch (error: any) {
    console.error("Error al convertir invitado a usuario:", error);
    return { success: false, error: error.message || "No se pudo crear la cuenta." };
  }
}
