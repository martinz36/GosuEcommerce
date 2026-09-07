import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { awardLoyaltyPoints } from "@/lib/loyalty";
import { sendOrderConfirmationEmail } from "@/lib/resend";

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
        const orderCurrency = (session.currency || metadata.currency || "PEN").toUpperCase();

        // Crear la orden en la base de datos
        await prisma.order.create({
          data: {
            orderNumber,
            userId: metadata.userId ? metadata.userId : null,
            guestEmail: session.customer_details?.email || metadata.userEmail || null,
            status: "PAID",
            currency: orderCurrency,
            stripePaymentIntentId: paymentIntentId,
            stripeCheckoutSessionId: sessionId,
            subtotal,
            totalAmount,
            shippingAddressJson: session.shipping_details
              ? (session.shipping_details as any)
              : metadata.defaultAddressJson
              ? JSON.parse(metadata.defaultAddressJson)
              : undefined,
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

        // Actualizar Puntos de Fidelidad (Loyalty Points) usando el Motor Dinámico
        if (metadata.userId) {
          const usedPoints = parseInt(metadata.loyaltyPointsUsed || "0", 10);
          if (usedPoints > 0) {
            await prisma.user
              .update({
                where: { id: metadata.userId },
                data: {
                  loyaltyPoints: {
                    decrement: usedPoints,
                  },
                },
              })
              .catch((err) => console.error(`Error descontando puntos usados para usuario ${metadata.userId}:`, err));
          }

          // Otorgar puntos por la compra dinámicamente según las reglas del Admin
          await awardLoyaltyPoints(metadata.userId, "PURCHASE", totalAmount);

          // Sincronizar dirección sin crear duplicados en Neon DB
          try {
            const shipDetails = session.shipping_details?.address;
            if (shipDetails && shipDetails.line1) {
              const street = shipDetails.line1 + (shipDetails.line2 ? `, ${shipDetails.line2}` : "");
              const city = shipDetails.city || "";
              const state = shipDetails.state || "";
              const postalCode = shipDetails.postal_code || "";
              const country = shipDetails.country || "PE";

              const existingAddr = await prisma.address.findFirst({
                where: {
                  userId: metadata.userId,
                  street,
                  city,
                },
              });

              if (!existingAddr) {
                const addressCount = await prisma.address.count({ where: { userId: metadata.userId } });
                await prisma.address.create({
                  data: {
                    userId: metadata.userId,
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
                where: { id: metadata.userId },
                data: {
                  defaultShippingAddress: formattedAddressString,
                },
              }).catch(() => {});
            }
          } catch (addrErr) {
            console.error("Error al sincronizar dirección de envío en webhook:", addrErr);
          }
        }

        console.log(`✅ Orden ${orderNumber} creada exitosamente para la sesión ${sessionId}`);

        // Enviar Correo Transaccional de Confirmación de Pedido con Resend
        const buyerEmail = session.customer_details?.email || metadata.userEmail;
        if (buyerEmail) {
          sendOrderConfirmationEmail({
            toEmail: buyerEmail,
            orderNumber,
            totalAmount,
            currency: orderCurrency,
            items: parsedItems.map((item: any) => ({
              title: item.title,
              quantity: item.quantity,
              unitPrice: item.price,
            })),
            shippingAddress: session.shipping_details?.address || undefined,
            loyaltyPointsEarned: Math.floor(totalAmount),
          }).catch((emailErr) => console.error("Error enviando email de confirmación de orden en webhook:", emailErr));
        }
      }
    } catch (dbError) {
      console.error("❌ Error al guardar la orden en la base de datos:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
