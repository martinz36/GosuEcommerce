import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Falta session_id" }, { status: 400 });
    }

    // Obtener sesión del usuario si está logueado
    const authSession = await getServerSession(authOptions);
    const currentUserId = (authSession?.user as any)?.id;
    const currentUserEmail = authSession?.user?.email;

    // Consultar el estado real del checkout session en Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({ error: "El pago no ha sido completado." }, { status: 400 });
    }

    // Verificar si la orden ya fue creada previamente (por el webhook o por esta api)
    let order = await prisma.order.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
    });

    if (!order) {
      const paymentIntentId = checkoutSession.payment_intent as string;
      const metadata = checkoutSession.metadata || {};

      let parsedItems: any[] = [];
      if (metadata.itemsJson) {
        try {
          parsedItems = JSON.parse(metadata.itemsJson);
        } catch (e) {
          console.error("Error al parsear itemsJson en confirm route:", e);
        }
      }

      const subtotal = (checkoutSession.amount_subtotal || 0) / 100;
      const totalAmount = (checkoutSession.amount_total || 0) / 100;
      const orderNumber = `GOSU-${Math.floor(100000 + Math.random() * 900000)}`;

      // Determinar userId e email
      const targetUserId = currentUserId || metadata.userId || null;
      const targetEmail = currentUserEmail || checkoutSession.customer_details?.email || metadata.userEmail || null;

      // Crear la orden en la BD
      order = await prisma.order.create({
        data: {
          orderNumber,
          userId: targetUserId,
          guestEmail: targetEmail,
          status: "PAID",
          stripePaymentIntentId: paymentIntentId,
          stripeCheckoutSessionId: sessionId,
          subtotal,
          totalAmount,
          shippingAddressJson: checkoutSession.shipping_details ? (checkoutSession.shipping_details as any) : undefined,
          items: {
            create: parsedItems.map((item: any) => ({
              productId: item.productId || null,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: Number(item.price) * Number(item.quantity),
            })),
          },
        },
      });

      // Descontar stock
      for (const item of parsedItems) {
        if (item.productId) {
          await prisma.product
            .update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
            .catch(() => {});
        }
      }

      // Actualizar puntos de fidelidad si hay usuario
      if (targetUserId) {
        const usedPoints = parseInt(metadata.loyaltyPointsUsed || "0", 10);
        const earnedPoints = Math.floor(totalAmount);

        await prisma.user
          .update({
            where: { id: targetUserId },
            data: {
              loyaltyPoints: {
                increment: earnedPoints - usedPoints,
              },
            },
          })
          .catch(() => {});

        // Sincronizar dirección sin duplicar en Neon DB
        try {
          const shipDetails = checkoutSession.shipping_details?.address;
          if (shipDetails && shipDetails.line1) {
            const street = shipDetails.line1 + (shipDetails.line2 ? `, ${shipDetails.line2}` : "");
            const city = shipDetails.city || "";
            const state = shipDetails.state || "";
            const postalCode = shipDetails.postal_code || "";
            const country = shipDetails.country || "PE";

            const existingAddr = await prisma.address.findFirst({
              where: {
                userId: targetUserId,
                street,
                city,
              },
            });

            if (!existingAddr) {
              const addressCount = await prisma.address.count({ where: { userId: targetUserId } });
              await prisma.address.create({
                data: {
                  userId: targetUserId,
                  street,
                  city,
                  state,
                  postalCode,
                  country,
                  isDefault: addressCount === 0,
                },
              });
            }

            const formattedAddressString = `${street}, ${city}, ${state} ${postalCode}, ${country}`.replace(/,\s*,/g, ",").trim();
            await prisma.user.update({
              where: { id: targetUserId },
              data: {
                defaultShippingAddress: formattedAddressString,
              },
            }).catch(() => {});
          }
        } catch (addrErr) {
          console.error("Error al sincronizar dirección en confirm route:", addrErr);
        }
      }
    } else {
      // Si la orden ya existía pero no tenía userId asociado y el usuario está autenticado ahora, lo asociamos
      if (!order.userId && currentUserId) {
        order = await prisma.order.update({
          where: { id: order.id },
          data: { userId: currentUserId },
        });
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("Error confirmando orden desde Stripe Session:", error);
    return NextResponse.json({ error: error.message || "Error al procesar pedido." }, { status: 500 });
  }
}
