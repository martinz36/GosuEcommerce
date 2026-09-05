import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { items, discountCode, loyaltyPointsUsed = 0, currency = "usd", countryCode = "PE", isPickup = false, pickupAddress = "" } = body;

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
          { error: `Los envíos a ${region.countryName} están deshabilitados temporalmente por el administrador.` },
          { status: 400 }
        );
      }
    }

    const originHeader = req.headers.get("origin") || req.headers.get("referer");
    let dynamicOrigin = originHeader ? new URL(originHeader).origin : null;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || dynamicOrigin || "http://localhost:3000";
    const formattedCurrency = (currency || "usd").toLowerCase();

    // Transformar items del carrito en line_items para Stripe
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

    // Calcular cupón de descuento si existe
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

    // Crear la sesión de checkout en Stripe
    // Si es Recojo en Tienda, no exigimos rellenar la dirección de envío física
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      discounts: discountsArray.length > 0 ? discountsArray : undefined,
      customer_email: session?.user?.email || undefined,
      shipping_address_collection: isPickup
        ? undefined
        : {
            allowed_countries: ["PE", "US", "MX", "CL", "CO", "AR", "ES"],
          },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      metadata: {
        userId: (session?.user as any)?.id || "",
        userEmail: session?.user?.email || "",
        discountCode: discountCode?.code || "",
        loyaltyPointsUsed: String(loyaltyPointsUsed || 0),
        isPickup: isPickup ? "true" : "false",
        pickupAddress: pickupAddress || "",
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
    console.error("Error al crear sesión de Checkout de Stripe:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar el pago." },
      { status: 500 }
    );
  }
}
