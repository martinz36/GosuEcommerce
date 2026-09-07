"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { awardLoyaltyPoints } from "@/lib/loyalty";
import { revalidatePath } from "next/cache";

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

    // Crear cliente en Neon Postgres
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName ? firstName.trim() : null,
        lastName: lastName ? lastName.trim() : null,
        name: `${firstName || ''} ${lastName || ''}`.trim() || email.split("@")[0],
        role: "CUSTOMER",
        loyaltyPoints: 0,
      },
    });

    // Asignar puntos dinámicos por Misión de Bienvenida (ACCOUNT_CREATION) desde la BD
    await awardLoyaltyPoints(newUser.id, "ACCOUNT_CREATION");

    return { success: true, message: "¡Cuenta creada exitosamente! Ahora puedes iniciar sesión." };
  } catch (error: any) {
    console.error("Error al registrar usuario en Neon DB:", error);
    return { success: false, error: error?.message || "Error al crear la cuenta de usuario." };
  }
}

export async function completeUserProfileMissionAction(
  userId: string,
  birthdateStr: string,
  phoneStr?: string,
  acceptsMarketing?: boolean
) {
  try {
    if (!userId) {
      return { success: false, error: "Usuario no autenticado." };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Usuario no encontrado." };
    }

    const birthdate = birthdateStr ? new Date(birthdateStr) : null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        birthdate,
        phone: phoneStr ? phoneStr.trim() : user.phone,
        isProfileCompleted: true,
        acceptsMarketing: acceptsMarketing !== undefined ? acceptsMarketing : user.acceptsMarketing,
      },
    });

    // Asignar puntos dinámicos por Misión de Perfil Completo (PROFILE_COMPLETION)
    const result = await awardLoyaltyPoints(userId, "PROFILE_COMPLETION");

    revalidatePath("/account/dashboard");
    revalidatePath("/dashboard/customers");

    return {
      success: true,
      message: result.message || "¡Perfil completado exitosamente!",
    };
  } catch (error: any) {
    console.error("Error al completar misión de perfil:", error);
    return { success: false, error: error.message || "Error al actualizar perfil" };
  }
}

export async function addUserAddressAction(
  userId: string,
  data: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }
) {
  try {
    if (!userId) return { success: false, error: "Usuario no autenticado." };
    if (!data.street || !data.city || !data.state || !data.country) {
      return { success: false, error: "Todos los campos de la dirección son requeridos." };
    }

    // Contar direcciones existentes del usuario
    const existingCount = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = data.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      // Desmarcar predeterminadas previas
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const formattedAddressString = `${data.street.trim()}, ${data.city.trim()}, ${data.state.trim()} ${data.postalCode.trim()}, ${data.country.trim()}`;

    const newAddress = await prisma.address.create({
      data: {
        userId,
        street: data.street.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country.trim(),
        isDefault: shouldBeDefault,
      },
    });

    if (shouldBeDefault) {
      await prisma.user.update({
        where: { id: userId },
        data: { defaultShippingAddress: formattedAddressString },
      });
    }

    revalidatePath("/account/dashboard");
    revalidatePath(`/dashboard/customers/${userId}`);

    return { success: true, address: newAddress };
  } catch (error: any) {
    console.error("Error al agregar dirección:", error);
    return { success: false, error: error.message || "Error al guardar la dirección." };
  }
}

export async function deleteUserAddressAction(addressId: string, userId: string) {
  try {
    if (!userId || !addressId) return { success: false, error: "Parámetros inválidos." };

    const targetAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!targetAddress || targetAddress.userId !== userId) {
      return { success: false, error: "Dirección no encontrada." };
    }

    await prisma.address.delete({ where: { id: addressId } });

    // Si era la predeterminada, hacer predeterminada la siguiente dirección (si existe)
    if (targetAddress.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
        const formatted = `${nextAddress.street}, ${nextAddress.city}, ${nextAddress.state} ${nextAddress.postalCode}, ${nextAddress.country}`;
        await prisma.user.update({
          where: { id: userId },
          data: { defaultShippingAddress: formatted },
        });
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { defaultShippingAddress: null },
        });
      }
    }

    revalidatePath("/account/dashboard");
    revalidatePath(`/dashboard/customers/${userId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar dirección:", error);
    return { success: false, error: error.message || "Error al eliminar la dirección." };
  }
}

export async function setDefaultUserAddressAction(addressId: string, userId: string) {
  try {
    if (!userId || !addressId) return { success: false, error: "Parámetros inválidos." };

    const targetAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!targetAddress || targetAddress.userId !== userId) {
      return { success: false, error: "Dirección no encontrada." };
    }

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    const formatted = `${updatedAddress.street}, ${updatedAddress.city}, ${updatedAddress.state} ${updatedAddress.postalCode}, ${updatedAddress.country}`;
    await prisma.user.update({
      where: { id: userId },
      data: { defaultShippingAddress: formatted },
    });

    revalidatePath("/account/dashboard");
    revalidatePath(`/dashboard/customers/${userId}`);

    return { success: true, address: updatedAddress };
  } catch (error: any) {
    console.error("Error al marcar dirección por defecto:", error);
    return { success: false, error: error.message || "Error al actualizar dirección predeterminada." };
  }
}

export async function updateUserMarketingToggleAction(userId: string, acceptsMarketing: boolean) {
  try {
    if (!userId) return { success: false, error: "Usuario no autenticado." };

    await prisma.user.update({
      where: { id: userId },
      data: { acceptsMarketing },
    });

    revalidatePath("/account/dashboard");
    revalidatePath(`/dashboard/customers/${userId}`);
    revalidatePath("/dashboard/customers");

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar preferencia de marketing:", error);
    return { success: false, error: error.message || "Error al actualizar preferencias de correo." };
  }
}
