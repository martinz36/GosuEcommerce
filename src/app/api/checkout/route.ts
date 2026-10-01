import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Preference } from "mercadopago";

function getCountryIso(cName: string = ""): string {
  const c = cName.trim().toUpperCase();
  if (c === "PE" || c === "PERÚ" || c === "PERU") return "PE";
  if (c === "US" || c === "USA" || c === "ESTADOS UNIDOS") return "US";
  if (c === "MX" || c === "MÉXICO" || c === "MEXICO") return "MX";
  if (c === "CL" || c === "CHILE") return "CL";
  if (c === "CO" || c === "COLOMBIA") return "CO";
  if (c === "AR" || c === "ARGENTINA") return "AR";
  if (c === "ES" || c === "ESPAÑA" || c === "ESPANA") return "ES";
  return c.length === 2 ? c : "PE";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const {
      items,
      discountCode,
      loyaltyPointsUsed = 0,
      currency = "usd",
      countryCode = "PE",
      isPickup = false,
      pickupAddress = "",
      guestEmail = "",
      guestName = "",
      guestPhone = "",
      shippingAddress = null,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío." },
        { status: 400 }
      );
    }

    // Validar si la región está activa en la base de datos
    if (process.env.DATABASE_URL) {
      const region = await prisma.regionConfig.findUnique({
        where: { countryCode: countryCode.toUpperCase() },
      });
      if (region && !region.isActive) {
        return NextResponse.json(
          {
            error: `Los envíos a ${region.countryName} están deshabilitados temporalmente por el administrador.`,
          },
          { status: 400 }
        );
      }
    }

    // Consultar en Neon DB la pasarela de pago activa (Stripe o Mercado Pago)
    let activePaymentGateway = "stripe";
    if (process.env.DATABASE_URL) {
      const storeSettings = await prisma.storeSettings.findUnique({
        where: { id: "default" },
      });
      if (storeSettings?.activePaymentGateway) {
        activePaymentGateway = storeSettings.activePaymentGateway.toLowerCase();
      }
    }

    const originHeader = req.headers.get("origin") || req.headers.get("referer");
    let dynamicOrigin = originHeader ? new URL(originHeader).origin : null;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || dynamicOrigin || "http://localhost:3000";

    // Determinar la moneda obligatoria según el país (Región Multi-Moneda)
    const upperCountry = (countryCode || "PE").toUpperCase();
    const formattedCurrency = upperCountry === "PE" ? "pen" : (currency || "usd").toLowerCase();

    const currentUserId = (session?.user as any)?.id;
    let userDefaultAddress: any = null;
    if (currentUserId && process.env.DATABASE_URL) {
      userDefaultAddress = await prisma.address.findFirst({
        where: { userId: currentUserId, isDefault: true },
      });
      if (!userDefaultAddress) {
        userDefaultAddress = await prisma.address.findFirst({
          where: { userId: currentUserId },
        });
      }
    }

    const finalShippingAddress = shippingAddress || userDefaultAddress || null;

    let dbDiscountCodeId: string | null = null;
    if (discountCode && process.env.DATABASE_URL) {
      try {
        const foundCode = await prisma.discountCode.findFirst({
          where: {
            OR: [
              { id: discountCode.id || "" },
              { code: (discountCode.code || "").toUpperCase() },
            ],
          },
        });
        if (foundCode) {
          dbDiscountCodeId = foundCode.id;
        }
      } catch (err) {
        console.error("Error buscando discountCode en DB:", err);
      }
    }

    // ==========================================
    // PASARELA 1: MERCADO PAGO
    // ==========================================
    if (activePaymentGateway === "mercadopago") {
      const mpAccessToken = process.env.MP_ACCESS_TOKEN || "TEST-0000000000000000-000000-00000000000000000000000000000000-000000000";
      const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });
      const preference = new Preference(mpClient);

      // Calcular descuento unitario si existe cupón y puntos de fidelidad
      let couponDiscount = 0;
      if (discountCode) {
        if (discountCode.type === "PERCENTAGE") {
          const subtotal = items.reduce((sum: number, i: any) => sum + Number(i.price) * Number(i.quantity), 0);
          couponDiscount = (subtotal * Number(discountCode.value)) / 100;
        } else if (discountCode.type === "FIXED_AMOUNT") {
          couponDiscount = Number(discountCode.value);
        }
      }

      let loyaltyDiscount = 0;
      if (loyaltyPointsUsed && Number(loyaltyPointsUsed) > 0) {
        const points = Number(loyaltyPointsUsed);
        const discountPEN = points / 40;
        loyaltyDiscount = formattedCurrency === "pen" ? discountPEN : discountPEN / 3.75;
      }

      const totalDiscount = Number((couponDiscount + loyaltyDiscount).toFixed(2));

      // Preparar ítems para la Preferencia de Pago de Mercado Pago
      const mpItems: any[] = items.map((item: any) => {
        const itemPrice = Number(item.price);
        return {
          id: String(item.productId || item.id || "item"),
          title: item.title,
          unit_price: itemPrice,
          quantity: Number(item.quantity),
          currency_id: formattedCurrency.toUpperCase(),
          picture_url: item.imageUrl || undefined,
        };
      });

      if (totalDiscount > 0) {
        mpItems.push({
          id: "discount-total",
          title: `Descuento (Cupón + Puntos GOSU®)`,
          unit_price: -Math.abs(totalDiscount),
          quantity: 1,
          currency_id: formattedCurrency.toUpperCase(),
        });
      }

      // Crear la orden pendiente en Neon DB
      let pendingOrder: any = null;
      if (process.env.DATABASE_URL) {
        const subtotalCalc = items.reduce((sum: number, i: any) => sum + Number(i.price) * Number(i.quantity), 0);
        const finalTotal = Math.max(0, subtotalCalc - totalDiscount);
        const orderNumber = `GOSU-${Math.floor(100000 + Math.random() * 900000)}`;

        try {
          pendingOrder = await prisma.order.create({
            data: {
              orderNumber,
              userId: currentUserId || null,
              guestEmail: session?.user?.email || (guestEmail ? guestEmail.trim() : null),
              status: "PENDING",
              currency: formattedCurrency.toUpperCase(),
              paymentGateway: "mercadopago",
              subtotal: subtotalCalc,
              discountAmount: totalDiscount,
              discountCodeId: dbDiscountCodeId || undefined,
              totalAmount: finalTotal,
              shippingAddressJson: finalShippingAddress ? (finalShippingAddress as any) : undefined,
              items: {
                create: items.map((item: any) => ({
                  productId: item.productId || null,
                  quantity: Number(item.quantity),
                  unitPrice: Number(item.price),
                  totalPrice: Number(item.price) * Number(item.quantity),
                })),
              },
            },
          });
        } catch (orderErr) {
          console.error("Error al crear orden pendiente en Neon DB para Mercado Pago:", orderErr);
        }
      }

      const externalReference = pendingOrder?.id || `MP-${Date.now()}`;
      const notificationUrl = process.env.MP_WEBHOOK_URL || (appUrl.startsWith("https://") ? `${appUrl}/api/webhooks/mercadopago` : undefined);

      const mpPreferenceBody: any = {
        items: mpItems,
        external_reference: externalReference,
        back_urls: {
          success: `${appUrl}/checkout/success?gateway=mercadopago&order_id=${externalReference}`,
          failure: `${appUrl}/checkout/cancel?gateway=mercadopago`,
          pending: `${appUrl}/checkout/success?gateway=mercadopago&order_id=${externalReference}`,
        },
        auto_return: "approved",
        payer: {
          email: session?.user?.email || (guestEmail ? guestEmail.trim() : "cliente@gosuaccessories.com"),
          name: session?.user?.name || guestName || "Cliente GOSU",
          phone: guestPhone ? { number: guestPhone } : undefined,
        },
        metadata: {
          orderId: pendingOrder?.id || "",
          userId: currentUserId || "",
          userEmail: session?.user?.email || guestEmail || "",
          discountCode: discountCode?.code || "",
          discountCodeId: dbDiscountCodeId || "",
          loyaltyPointsUsed: String(loyaltyPointsUsed || 0),
          isPickup: isPickup ? "true" : "false",
          pickupAddress: pickupAddress || "",
          currency: formattedCurrency.toUpperCase(),
          shippingAddressJson: finalShippingAddress ? JSON.stringify(finalShippingAddress) : "",
          itemsJson: JSON.stringify(
            items.map((i: any) => ({
              productId: i.productId,
              title: i.title,
              price: i.price,
              quantity: i.quantity,
            }))
          ),
        },
      };

      if (notificationUrl) {
        mpPreferenceBody.notification_url = notificationUrl;
      }

      const mpResponse = await preference.create({
        body: mpPreferenceBody,
      });

      if (pendingOrder) {
        await prisma.order
          .update({
            where: { id: pendingOrder.id },
            data: { stripeCheckoutSessionId: mpResponse.id },
          })
          .catch(() => {});
      }

      const mpCheckoutUrl = mpResponse.init_point || mpResponse.sandbox_init_point;
      return NextResponse.json({ url: mpCheckoutUrl });
    }

    // ==========================================
    // PASARELA 2: STRIPE (POR DEFECTO)
    // ==========================================
    const lineItems = items.map((item: any) => {
      const unitAmount = Math.round(Number(item.price) * 100);
      return {
        price_data: {
          currency: formattedCurrency,
          product_data: {
            name: item.title,
            images: item.imageUrl ? [item.imageUrl] : [],
            metadata: {
              productId: item.productId,
            },
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    let discountsArray: any[] = [];
    if (discountCode) {
      try {
        const coupon = await stripe.coupons.create({
          percent_off: discountCode.type === "PERCENTAGE" ? Number(discountCode.value) : undefined,
          amount_off: discountCode.type === "FIXED_AMOUNT" ? Math.round(Number(discountCode.value) * 100) : undefined,
          currency: discountCode.type === "FIXED_AMOUNT" ? formattedCurrency : undefined,
          duration: "once",
          name: `Descuento: ${discountCode.code}`,
        });

        discountsArray.push({ coupon: coupon.id });
      } catch (couponError) {
        console.error("Error al aplicar cupón en Stripe:", couponError);
      }
    }

    if (loyaltyPointsUsed && Number(loyaltyPointsUsed) > 0) {
      try {
        const points = Number(loyaltyPointsUsed);
        const discountPEN = points / 40;
        const loyaltyDiscount = formattedCurrency === "pen" ? discountPEN : discountPEN / 3.75;
        const amountOffCents = Math.round(loyaltyDiscount * 100);
        if (amountOffCents > 0) {
          const pointsCoupon = await stripe.coupons.create({
            amount_off: amountOffCents,
            currency: formattedCurrency,
            duration: "once",
            name: `Puntos GOSU® (${points} pts)`,
          });
          discountsArray.push({ coupon: pointsCoupon.id });
        }
      } catch (ptsErr) {
        console.error("Error al aplicar cupón de puntos en Stripe:", ptsErr);
      }
    }

    const hasPredefinedShipping = Boolean(finalShippingAddress && !isPickup);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      discounts: discountsArray.length > 0 ? discountsArray : undefined,
      customer_email: session?.user?.email || (guestEmail ? guestEmail.trim() : undefined),
      payment_intent_data: hasPredefinedShipping
        ? {
            shipping: {
              name: session?.user?.name || guestName || "Cliente GOSU",
              address: {
                line1: finalShippingAddress.street || finalShippingAddress.line1 || "",
                city: finalShippingAddress.city || "",
                state: finalShippingAddress.state || "",
                postal_code: finalShippingAddress.postalCode || finalShippingAddress.postal_code || "",
                country: getCountryIso(finalShippingAddress.country || "PE"),
              },
            },
          }
        : undefined,
      shipping_address_collection: (hasPredefinedShipping || isPickup)
        ? undefined
        : {
            allowed_countries: ["PE", "US", "MX", "CL", "CO", "AR", "ES"],
          },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&gateway=stripe`,
      cancel_url: `${appUrl}/checkout/cancel`,
      metadata: {
        userId: currentUserId || "",
        userEmail: session?.user?.email || guestEmail || "",
        discountCode: discountCode?.code || "",
        discountCodeId: dbDiscountCodeId || "",
        loyaltyPointsUsed: String(loyaltyPointsUsed || 0),
        isPickup: isPickup ? "true" : "false",
        pickupAddress: pickupAddress || "",
        currency: formattedCurrency.toUpperCase(),
        paymentGateway: "stripe",
        defaultAddressJson: finalShippingAddress ? JSON.stringify(finalShippingAddress) : "",
        itemsJson: JSON.stringify(
          items.map((i: any) => ({
            productId: i.productId,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
          }))
        ),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Error al crear sesión de Checkout:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar el pago." },
      { status: 500 }
    );
  }
}
