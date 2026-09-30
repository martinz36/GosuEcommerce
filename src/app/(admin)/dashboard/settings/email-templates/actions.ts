"use server";

import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendAbandonedCartEmail,
  sendNewsletterEmail,
} from "@/lib/resend";

export async function sendTestEmailAction({
  templateType,
  testEmail,
  subject,
  bannerTitle,
  customNote,
  accentColor = "#00F0FF",
}: {
  templateType: "WELCOME" | "ORDER_CONFIRMATION" | "ABANDONED_CART" | "NEWSLETTER";
  testEmail: string;
  subject: string;
  bannerTitle: string;
  customNote: string;
  accentColor?: string;
}) {
  try {
    if (!testEmail || !testEmail.includes("@")) {
      return { success: false, error: "Ingresa un correo electrónico de prueba válido." };
    }

    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: "RESEND_API_KEY no está configurada en las variables de entorno." };
    }

    const cleanEmail = testEmail.trim().toLowerCase();
    let res: any;

    if (templateType === "WELCOME") {
      res = await sendWelcomeEmail({
        toEmail: cleanEmail,
        customerName: "Jugador GOSU® (Prueba)",
        userName: "Jugador GOSU® (Prueba)",
        userEmail: cleanEmail,
        loyaltyPoints: 50,
      });
    } else if (templateType === "ORDER_CONFIRMATION") {
      res = await sendOrderConfirmationEmail({
        toEmail: cleanEmail,
        customerName: "Jugador GOSU® (Prueba)",
        orderId: "GOSU-9999",
        orderNumber: "GOSU-9999",
        total: 120.0,
        currency: "S/.",
        orderItems: [
          {
            title: "GOSU® Deckbox PU Leather (Matte Black)",
            quantity: 1,
            unitPrice: 60.0,
            image: "https://gosuecommerce.vercel.app/gosu-logo-white.png",
          },
          {
            title: "GOSU® Armor Sleeves - Japanese Size (60ct)",
            quantity: 2,
            unitPrice: 30.0,
            image: "https://gosuecommerce.vercel.app/gosu-logo-white.png",
          },
        ],
        shippingAddress: "Av. Javier Prado Este 456, San Isidro, Lima",
        loyaltyPointsEarned: 120,
      });
    } else if (templateType === "ABANDONED_CART") {
      res = await sendAbandonedCartEmail({
        toEmail: cleanEmail,
        items: [
          { title: "GOSU® Deckbox PU Leather (Matte Black)", quantity: 1, price: 60.0 },
          { title: "GOSU® Armor Sleeves - Japanese Size (60ct)", quantity: 2, price: 30.0 },
        ],
        subtotal: 120.0,
      });
    } else {
      res = await sendNewsletterEmail({
        toEmail: cleanEmail,
        subject: `[PRUEBA] ${subject || "⚡ Novedades GOSU® TCG"}`,
        previewText: "Demostración de plantilla desde el panel de administración",
        badgeTitle: bannerTitle || "⚡ NOVEDADES & CLUB GOSU®",
        contentHTML: `<p style="color:#FFFFFF; font-size:14px; line-height:1.6;">${customNote}</p>`,
        ctaText: "Ver en GOSU® TCG →",
        ctaUrl: process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app",
      });
    }

    if (res.success) {
      return { success: true, message: `Correo de prueba enviado con éxito a ${cleanEmail}` };
    } else {
      return { success: false, error: res.error || "Error al enviar correo de prueba con Resend." };
    }
  } catch (error: any) {
    console.error("Error al enviar correo de prueba con Resend:", error);
    return { success: false, error: error.message || "Error al enviar correo con Resend." };
  }
}
