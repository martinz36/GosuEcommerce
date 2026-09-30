import { Resend } from "resend";
import WelcomeEmail from "../../emails/WelcomeEmail";
import OrderConfirmationEmail from "../../emails/OrderConfirmationEmail";
import ResetPasswordEmail from "../../emails/ResetPasswordEmail";
import NewsletterEmail from "../../emails/NewsletterEmail";
import AbandonedCartEmail from "../../emails/AbandonedCartEmail";

// Inicializar cliente de Resend (Usar API KEY de env)
export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

// Remitente por defecto
const DEFAULT_FROM = process.env.SENDER_EMAIL || "GOSU® TCG Gear <onboarding@resend.dev>";

/**
 * 1. Correo de Bienvenida (Registro / Loyalty Points)
 */
export async function sendWelcomeEmail({
  toEmail,
  userName,
  loyaltyPoints = 50,
}: {
  toEmail: string;
  userName?: string | null;
  loyaltyPoints?: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo envío de email de bienvenida.");
    return { success: false, error: "API Key no configurada" };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: "✨ ¡Bienvenido a GOSU® TCG! Tus 50 Puntos están listos",
      react: WelcomeEmail({ toEmail, userName, loyaltyPoints }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando correo de bienvenida con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Correo de Confirmación de Pedido (Stripe / Mercado Pago)
 */
export async function sendOrderConfirmationEmail({
  toEmail,
  orderNumber,
  totalAmount,
  currency,
  items,
  shippingAddress,
  loyaltyPointsEarned = 0,
}: {
  toEmail: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  items: Array<{ title: string; quantity: number; unitPrice: number }>;
  shippingAddress?: any;
  loyaltyPointsEarned?: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo envío de confirmación de pedido.");
    return { success: false, error: "API Key no configurada" };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: `📦 Confirmación de Pedido ${orderNumber} - GOSU® TCG`,
      react: OrderConfirmationEmail({
        orderNumber,
        totalAmount,
        currency,
        items,
        shippingAddress,
        loyaltyPointsEarned,
      }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando confirmación de pedido con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Correo de Restablecimiento de Contraseña
 */
export async function sendResetPasswordEmail({
  toEmail,
  userName,
  resetLink,
}: {
  toEmail: string;
  userName?: string | null;
  resetLink: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo email de recuperación.");
    return { success: false, error: "API Key no configurada" };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: "🔐 Restablece la contraseña de tu cuenta GOSU®",
      react: ResetPasswordEmail({ toEmail, userName, resetLink }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando email de recuperación de contraseña con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Correo Masivo de Novedades (Newsletter Admin Broadcast)
 */
export async function sendNewsletterEmail({
  toEmail,
  subject,
  previewText,
  badgeTitle,
  contentHTML,
  ctaText,
  ctaUrl,
}: {
  toEmail: string;
  subject: string;
  previewText?: string;
  badgeTitle?: string;
  contentHTML: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo envío de newsletter.");
    return { success: false, error: "API Key no configurada" };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: subject || "⚡ Novedades y Ofertas Exclusivas GOSU® TCG",
      react: NewsletterEmail({
        subject,
        previewText,
        badgeTitle,
        contentHTML,
        ctaText,
        ctaUrl,
      }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando correo de novedades con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Correo de Confirmación de Suscripción a Newsletter
 */
export async function sendNewsletterWelcomeEmail(toEmail: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo email de suscripción newsletter.");
    return { success: false, error: "API Key no configurada" };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: "⚡ ¡Te has suscrito a las novedades de GOSU® TCG!",
      react: NewsletterEmail({
        subject: "⚡ ¡Te has suscrito a las novedades de GOSU® TCG!",
        previewText: "Bienvenido al Club GOSU®. Recibirás preventas exclusivas y códigos de descuento.",
        badgeTitle: "⚡ SUSCRIPCIÓN CONFIRMADA",
        contentHTML: `
          <h2 style="color: #FFFFFF; font-size: 20px; text-transform: uppercase; margin: 0 0 12px 0;">¡Ya eres parte del Club GOSU®!</h2>
          <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
            Te avisaremos primero que a nadie cuando tengamos nuevos lanzamientos de fundas, binders, preventas exclusivas y códigos de descuento secretos.
          </p>
        `,
        ctaText: "Explorar la Tienda",
        ctaUrl: process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app",
      }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando email de bienvenida newsletter con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 6. Correo de Recuperación de Carrito Abandonado
 */
export async function sendAbandonedCartEmail({
  toEmail,
  items,
  subtotal,
}: {
  toEmail: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  subtotal: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo envío de recordatorio de carrito.");
    return { success: false, error: "API Key no configurada" };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: "🛒 Tus productos TCG te están esperando en GOSU®",
      react: AbandonedCartEmail({ toEmail, items, subtotal }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando recordatorio de carrito con Resend:", error);
    return { success: false, error: error.message };
  }
}
