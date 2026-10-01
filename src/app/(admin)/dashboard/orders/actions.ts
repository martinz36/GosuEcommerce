"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(orderId: string, status: string): Promise<void> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/account/orders");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al actualizar estado del pedido en Neon DB:", error);
  }
}

export async function setOrderStatusProcessingAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "PROCESSING");
}

export async function setOrderStatusShippedAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "SHIPPED");
}

export async function setOrderStatusDeliveredAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "DELIVERED");
}

export async function setOrderStatusCancelledAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "CANCELLED");
}

export async function setOrderStatusRefundedAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "REFUNDED");
}

export async function updateOrderTrackingAction(orderId: string, formData: FormData): Promise<void> {
  try {
    const trackingNumber = (formData.get("trackingNumber") as string || "").trim();
    const trackingUrl = (formData.get("trackingUrl") as string || "").trim();
    const newStatus = (formData.get("status") as string || "").trim();

    const updateData: any = {};
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl || null;
    
    if (newStatus) {
      updateData.status = newStatus;
    } else if (trackingNumber && !newStatus) {
      updateData.status = "SHIPPED";
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/account/orders");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al asignar código de seguimiento:", error);
  }
}

// ======================================================
// SERVER ACTIONS PARA CREACIÓN DE ÓRDENES MANUALES
// ======================================================

export async function searchProductsAction(query: string) {
  try {
    const q = (query || "").trim();
    if (!q) return [];

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        images: true,
      },
      take: 10,
    });

    return products.map((p) => {
      const priceUSD = Number(p.priceUSD || p.basePrice || 0);
      const pricePEN = Number(p.pricePEN || (priceUSD > 0 ? (priceUSD * 3.75).toFixed(2) : 0));
      return {
        id: p.id,
        title: p.title,
        sku: p.sku,
        stock: p.stock,
        pricePEN,
        priceUSD,
        imageUrl: p.images[0]?.url || null,
      };
    });
  } catch (err) {
    console.error("Error buscando productos:", err);
    return [];
  }
}

export async function searchCustomersAction(query: string) {
  try {
    const q = (query || "").trim();
    if (!q) return [];

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        addresses: true,
      },
      take: 10,
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      address: u.addresses[0]
        ? {
            street: u.addresses[0].street,
            city: u.addresses[0].city,
            state: u.addresses[0].state,
            country: u.addresses[0].country,
            postalCode: u.addresses[0].postalCode,
          }
        : null,
    }));
  } catch (err) {
    console.error("Error buscando clientes:", err);
    return [];
  }
}

export async function createCustomerAction(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}) {
  try {
    const email = data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email },
      include: { addresses: true },
    });

    if (existing) {
      return {
        success: true,
        user: {
          id: existing.id,
          name: existing.name || `${existing.firstName || ""} ${existing.lastName || ""}`.trim() || existing.email,
          email: existing.email,
          firstName: existing.firstName,
          lastName: existing.lastName,
          phone: existing.phone,
          address: existing.addresses[0] || null,
        },
      };
    }

    const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    const newUser = await prisma.user.create({
      data: {
        email,
        name: fullName || email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: "CUSTOMER",
      },
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name || newUser.email,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        address: null,
      },
    };
  } catch (err: any) {
    console.error("Error al crear cliente:", err);
    return { success: false, error: err.message || "No se pudo crear el cliente." };
  }
}

export interface CreateManualOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateManualOrderInput {
  userId?: string;
  newCustomer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  guestEmail?: string;
  items: CreateManualOrderItemInput[];
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency?: string;
  paymentGateway?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  shippingAddress?: {
    fullName?: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    phone?: string;
  };
}

export async function createManualOrderAction(input: CreateManualOrderInput) {
  try {
    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Debe agregar al menos 1 producto a la orden." };
    }

    const result = await prisma.$transaction(async (tx) => {
      let targetUserId = input.userId || null;
      let targetGuestEmail = input.guestEmail || null;

      // Si se envió cliente nuevo
      if (input.newCustomer && input.newCustomer.email) {
        const cleanEmail = input.newCustomer.email.trim().toLowerCase();
        const existingUser = await tx.user.findUnique({
          where: { email: cleanEmail },
        });

        if (existingUser) {
          targetUserId = existingUser.id;
        } else {
          const fullName = `${input.newCustomer.firstName || ""} ${input.newCustomer.lastName || ""}`.trim();
          const newUser = await tx.user.create({
            data: {
              email: cleanEmail,
              name: fullName || cleanEmail,
              firstName: input.newCustomer.firstName,
              lastName: input.newCustomer.lastName,
              phone: input.newCustomer.phone,
              role: "CUSTOMER",
            },
          });
          targetUserId = newUser.id;
        }
        targetGuestEmail = cleanEmail;
      }

      // Generar correlativo de orden único
      const count = await tx.order.count();
      const orderNumber = `GOSU-M${10001 + count}`;

      const status = (input.fulfillmentStatus || input.paymentStatus || "PENDING") as any;

      // Guardar dirección por defecto si no tiene
      if (targetUserId && input.shippingAddress && input.shippingAddress.street) {
        const existingAddress = await tx.address.findFirst({
          where: { userId: targetUserId },
        });
        if (!existingAddress) {
          await tx.address.create({
            data: {
              userId: targetUserId,
              street: input.shippingAddress.street,
              city: input.shippingAddress.city || "Lima",
              state: input.shippingAddress.state || "Lima",
              postalCode: input.shippingAddress.postalCode || "15001",
              country: input.shippingAddress.country || "PE",
              isDefault: true,
            },
          });
        }
      }

      // Crear orden
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: targetUserId,
          guestEmail: targetGuestEmail,
          status: status,
          currency: (input.currency || "PEN").toUpperCase(),
          paymentGateway: input.paymentGateway || "manual",
          subtotal: input.subtotal,
          discountAmount: input.discountAmount || 0,
          shippingAmount: input.shippingAmount || 0,
          taxAmount: 0,
          totalAmount: input.totalAmount,
          shippingAddressJson: input.shippingAddress ? JSON.parse(JSON.stringify(input.shippingAddress)) : undefined,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: Number((item.quantity * item.unitPrice).toFixed(2)),
            })),
          },
        },
      });

      // Descontar stock
      for (const item of input.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return order;
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
    revalidatePath("/");

    return { success: true, orderId: result.id, orderNumber: result.orderNumber };
  } catch (err: any) {
    console.error("Error al crear orden manual:", err);
    return { success: false, error: err.message || "Error al procesar la orden manual." };
  }
}
