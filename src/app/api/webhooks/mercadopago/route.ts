import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { awardLoyaltyPoints } from "@/lib/loyalty";
import { sendOrderConfirmationEmail } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id") || searchParams.get("data.id");
    const queryType = searchParams.get("type") || searchParams.get("topic");

    let bodyData: any = {};
    try {
      bodyData = await req.json();
    } catch (e) {
      // El cuerpo puede venir vacío o no ser JSON válido
    }

    const paymentId = queryId || bodyData?.data?.id || bodyData?.id;
    const notificationType = queryType || bodyData?.type || bodyData?.topic || bodyData?.action;

    console.log(`🔔 Webhook Mercado Pago recibido. PaymentID: ${paymentId}, Type: ${notificationType}`);

    // Si es un ping de prueba o no contiene payment ID, respondemos 200 OK
    if (!paymentId) {
      return NextResponse.json(
        { success: true, message: "Notificación recibida sin ID de pago." },
        { status: 200 }
      );
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN || "";
    if (!mpAccessToken) {
      console.error("❌ Error: MP_ACCESS_TOKEN no está configurado en las variables de entorno.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const paymentClient = new Payment(mpClient);

    // Consultar el estado real de la transacción directamente en la API de Mercado Pago
    let payment: any;
    try {
      payment = await paymentClient.get({ id: String(paymentId) });
    } catch (getErr: any) {
      console.error(`❌ Error al consultar el pago ${paymentId} en la API de Mercado Pago:`, getErr?.message || getErr);
      return NextResponse.json({ error: "Error fetching payment from Mercado Pago" }, { status: 500 });
    }

    if (!payment) {
      return NextResponse.json({ success: true, message: "Pago no encontrado en Mercado Pago" }, { status: 200 });
    }

    console.log(`💳 Estado real del pago MP ${payment.id}: ${payment.status} (external_reference: ${payment.external_reference})`);

    // Procesar únicamente si el pago ha sido aprobado
    if (payment.status === "approved") {
      const externalRef = payment.external_reference;
      const mpPaymentId = String(payment.id);
      const metadata = payment.metadata || {};

      // 1. Buscar la orden en Neon DB por external_reference o ID de sesión
      let order = null;
      if (externalRef && process.env.DATABASE_URL) {
        order = await prisma.order.findFirst({
          where: {
            OR: [
              { id: externalRef },
              { orderNumber: externalRef },
              { stripeCheckoutSessionId: externalRef },
            ],
          },
          include: { items: true },
        });
      }

      if (order) {
        // Si la orden existe y su estado es PENDING, actualizar a PAID
        if (order.status !== "PAID") {
          order = await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "PAID",
              stripePaymentIntentId: mpPaymentId,
            },
            include: {
              items: {
                include: {
                  product: {
                    include: { images: true },
                  },
                },
              },
              user: true,
            },
          });

          // Descontar el stock de los productos
          for (const item of order.items) {
            if (item.productId) {
              await prisma.product
                .update({
                  where: { id: item.productId },
                  data: { stock: { decrement: item.quantity } },
                })
                .catch((err) => console.error(`Error descontando stock para producto ${item.productId}:`, err));
            }
          }

          // Registrar Comisión de Afiliado en Neon DB si aplica
          if (order.discountCodeId) {
            const codeRecord = await prisma.discountCode.findUnique({
              where: { id: order.discountCodeId },
            });
            if (codeRecord?.createdById) {
              const existingComm = await prisma.commissionLog.findFirst({
                where: { orderId: order.id },
              });
              if (!existingComm) {
                const commRate = Number(codeRecord.commissionRate || 10.0);
                const commissionAmount = Number(order.totalAmount) * (commRate / 100);
                await prisma.commissionLog.create({
                  data: {
                    orderId: order.id,
                    affiliateId: codeRecord.createdById,
                    commissionAmount,
                    isPaid: false,
                  },
                }).catch((commErr) => console.error("Error al crear CommissionLog MP:", commErr));
              }
            }
          }

          // Otorgar Puntos de Fidelidad y descontar puntos usados
          if (order.userId) {
            const usedPoints = parseInt(metadata.loyalty_points_used || "0", 10);
            if (usedPoints > 0) {
              await prisma.user
                .update({
                  where: { id: order.userId },
                  data: { loyaltyPoints: { decrement: usedPoints } },
                })
                .catch(() => {});
            }

            await awardLoyaltyPoints(order.userId, "PURCHASE", Number(order.totalAmount));
          }

          // Enviar correo de confirmación de pedido con Resend (datos dinámicos + PDF)
          const targetEmail = order.guestEmail || payment.payer?.email || metadata.user_email;
          const customerName = order.user?.name || (order.user?.firstName ? `${order.user.firstName} ${order.user.lastName || ""}`.trim() : null) || payment.payer?.first_name || (targetEmail ? targetEmail.split("@")[0] : "Cliente GOSU®");

          if (targetEmail) {
            sendOrderConfirmationEmail({
              toEmail: targetEmail,
              customerName,
              orderId: order.orderNumber,
              orderNumber: order.orderNumber,
              total: Number(order.totalAmount),
              totalAmount: Number(order.totalAmount),
              currency: order.currency,
              orderItems: order.items.map((i: any) => ({
                title: i.product?.title || i.title || "Producto GOSU",
                quantity: i.quantity,
                unitPrice: Number(i.unitPrice),
                image: i.product?.images?.[0]?.url,
              })),
              shippingAddress: order.shippingAddressJson || undefined,
              loyaltyPointsEarned: Math.floor(Number(order.totalAmount)),
            }).catch((emailErr) => console.error("Error enviando email en webhook Mercado Pago:", emailErr));
          }

          console.log(`✅ Orden ${order.orderNumber} actualizada exitosamente a PAID vía Webhook Mercado Pago (${mpPaymentId})`);
        } else {
          console.log(`ℹ️ La orden ${order.orderNumber} ya se encontraba en estado PAID.`);
        }
      } else if (process.env.DATABASE_URL) {
        // Fallback: Si no existía orden previa creada en la BD, la creamos dinámicamente con los datos de MP
        let parsedItems: any[] = [];
        if (metadata.items_json) {
          try {
            parsedItems = JSON.parse(metadata.items_json);
          } catch (e) {}
        }

        const totalAmount = Number(payment.transaction_amount || payment.total_paid_amount || 0);
        const orderNumber = `GOSU-MP-${Math.floor(100000 + Math.random() * 900000)}`;
        const currency = (payment.currency_id || metadata.currency || "PEN").toUpperCase();
        const userId = metadata.user_id || null;
        const guestEmail = payment.payer?.email || metadata.user_email || null;

        const newOrder = await prisma.order.create({
          data: {
            orderNumber,
            userId,
            guestEmail,
            status: "PAID",
            currency,
            stripePaymentIntentId: mpPaymentId,
            stripeCheckoutSessionId: externalRef || mpPaymentId,
            subtotal: totalAmount,
            totalAmount: totalAmount,
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

        // Actualizar stock
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

        if (userId) {
          await awardLoyaltyPoints(userId, "PURCHASE", totalAmount);
        }

        if (guestEmail) {
          sendOrderConfirmationEmail({
            toEmail: guestEmail,
            orderNumber,
            totalAmount,
            currency,
            items: parsedItems.map((i: any) => ({
              title: i.title,
              quantity: i.quantity,
              unitPrice: i.price,
            })),
            loyaltyPointsEarned: Math.floor(totalAmount),
          }).catch(() => {});
        }

        console.log(`✅ Orden ${newOrder.orderNumber} creada dinámicamente como PAID vía Webhook Mercado Pago`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error no controlado en Webhook Mercado Pago:", error);
    return NextResponse.json({ error: error.message || "Error procesando webhook" }, { status: 500 });
  }
}
