import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // En desarrollo sin webhook secret configurado, parseamos directamente
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`❌ Error en verificación de Webhook de Stripe: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Manejar el evento checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const paymentIntentId = session.payment_intent as string;
    const sessionId = session.id;
    const metadata = session.metadata || {};

    try {
      // Verificar si la orden ya fue registrada previamente para evitar duplicados
      const existingOrder = await prisma.order.findUnique({
        where: { stripeCheckoutSessionId: sessionId },
      });

      if (!existingOrder) {
        let parsedItems: any[] = [];
        if (metadata.itemsJson) {
          try {
            parsedItems = JSON.parse(metadata.itemsJson);
          } catch (e) {
            console.error("Error al parsear itemsJson de metadata:", e);
          }
        }

        const subtotal = (session.amount_subtotal || 0) / 100;
        const totalAmount = (session.amount_total || 0) / 100;
        const orderNumber = `GOSU-${Math.floor(100000 + Math.random() * 900000)}`;

        // Crear la orden en la base de datos
        await prisma.order.create({
          data: {
            orderNumber,
            userId: metadata.userId ? metadata.userId : null,
            guestEmail: session.customer_details?.email || metadata.userEmail || null,
            status: "PAID",
            stripePaymentIntentId: paymentIntentId,
            stripeCheckoutSessionId: sessionId,
            subtotal,
            totalAmount,
            shippingAddressJson: session.shipping_details ? (session.shipping_details as any) : undefined,
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

        // Actualizar stock de los productos
        for (const item of parsedItems) {
          if (item.productId) {
            await prisma.product
              .update({
                where: { id: item.productId },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              })
              .catch((err) => console.error(`Error actualizando stock para producto ${item.productId}:`, err));
          }
        }

        // Actualizar Puntos de Fidelidad (Loyalty Points) si el usuario estuvo autenticado
        if (metadata.userId) {
          const usedPoints = parseInt(metadata.loyaltyPointsUsed || "0", 10);
          const earnedPoints = Math.floor(totalAmount);

          // Restar puntos usados e incrementar los ganados
          await prisma.user
            .update({
              where: { id: metadata.userId },
              data: {
                loyaltyPoints: {
                  increment: earnedPoints - usedPoints,
                },
              },
            })
            .catch((err) => console.error(`Error actualizando loyaltyPoints para usuario ${metadata.userId}:`, err));
        }

        console.log(`✅ Orden ${orderNumber} creada exitosamente para la sesión ${sessionId}`);
      }
    } catch (dbError) {
      console.error("❌ Error al guardar la orden en la base de datos:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
