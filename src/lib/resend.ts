import { Resend } from "resend";
import WelcomeEmail from "../../emails/WelcomeEmail";
import OrderConfirmationEmail from "../../emails/OrderConfirmationEmail";
import ResetPasswordEmail from "../../emails/ResetPasswordEmail";
import NewsletterEmail from "../../emails/NewsletterEmail";
import AbandonedCartEmail from "../../emails/AbandonedCartEmail";
import { generateReceiptPdfBuffer } from "./pdfGenerator";

// Inicializar cliente de Resend (Usar API KEY de env)
export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

// Remitente por defecto
const DEFAULT_FROM = process.env.SENDER_EMAIL || "GOSU® TCG Gear <onboarding@resend.dev>";

/**
 * 1. Correo de Bienvenida (Registro / Loyalty Points)
 */
export async function sendWelcomeEmail({
  toEmail,
  customerName,
  userName,
  userEmail,
  loyaltyPoints = 50,
}: {
  toEmail: string;
  customerName?: string | null;
  userName?: string | null;
  userEmail?: string;
  loyaltyPoints?: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo envío de email de bienvenida.");
    return { success: false, error: "API Key no configurada" };
  }

  const name = customerName || userName || undefined;
  const email = userEmail || toEmail;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: "✨ ¡Bienvenido a GOSU® TCG! Tus 50 Puntos están listos",
      react: WelcomeEmail({
        customerName: name,
        userName: name,
        userEmail: email,
        toEmail,
        loyaltyPoints,
      }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando correo de bienvenida con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Correo de Confirmación de Pedido (con Recibo PDF Adjunto)
 */
export async function sendOrderConfirmationEmail({
  toEmail,
  customerName,
  userName,
  orderId,
  orderNumber,
  total,
  totalAmount,
  currency = "S/.",
  orderItems,
  items,
  shippingAddress,
  loyaltyPointsEarned = 0,
  attachPdf = true,
}: {
  toEmail: string;
  customerName?: string;
  userName?: string;
  orderId?: string;
  orderNumber?: string;
  total?: number;
  totalAmount?: number;
  currency?: string;
  orderItems?: Array<{
    title?: string;
    name?: string;
    image?: string;
    imageUrl?: string;
    quantity: number;
    unitPrice?: number;
    price?: number;
  }>;
  items?: Array<any>;
  shippingAddress?: any;
  loyaltyPointsEarned?: number;
  attachPdf?: boolean;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo envío de confirmación de pedido.");
    return { success: false, error: "API Key no configurada" };
  }

  const name = customerName || userName || "Cliente GOSU®";
  const displayOrderId = orderId || orderNumber || "GOSU-10001";
  const displayTotal = total !== undefined ? total : totalAmount !== undefined ? totalAmount : 0;
  const itemList = orderItems || items || [];

  // Mapeo normalizado de ítems
  const normalizedItems = itemList.map((i) => ({
    title: i.title || i.name || "Producto GOSU",
    quantity: i.quantity || 1,
    unitPrice: i.unitPrice !== undefined ? i.unitPrice : i.price || 0,
    image: i.image || i.imageUrl,
  }));

  // Generar buffer del Recibo PDF en tiempo de ejecución
  let pdfBuffer: Buffer | null = null;
  if (attachPdf) {
    try {
      pdfBuffer = generateReceiptPdfBuffer({
        orderId: displayOrderId,
        customerName: name,
        customerEmail: toEmail,
        items: normalizedItems,
        totalAmount: displayTotal,
        currency,
        shippingAddress,
      });
    } catch (pdfErr) {
      console.error("Error generando PDF para adjunto en email de confirmación:", pdfErr);
    }
  }

  try {
    const emailPayload: any = {
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: `📦 Confirmación de Pedido ${displayOrderId} - GOSU® TCG`,
      react: OrderConfirmationEmail({
        customerName: name,
        orderId: displayOrderId,
        orderNumber: displayOrderId,
        total: displayTotal,
        totalAmount: displayTotal,
        currency,
        orderItems: normalizedItems,
        items: normalizedItems,
        shippingAddress,
        loyaltyPointsEarned,
      }),
    };

    if (pdfBuffer) {
      emailPayload.attachments = [
        {
          filename: `Recibo_GOSU_${displayOrderId}.pdf`,
          content: pdfBuffer,
        },
      ];
    }

    const data = await resend.emails.send(emailPayload);

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
  console.log(
    `[Resend Webhook/Función] 🛒 Activando recordatorio de carrito abandonado para: ${toEmail} | Items: ${items.length} | Subtotal: ${subtotal}`
  );

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("dummy")) {
    console.warn(
      `[Resend Webhook/Función] ⚠️ RESEND_API_KEY de prueba o no configurada. Simulación de envío exitoso a ${toEmail}.`
    );
    return { success: true, simulated: true, message: `Simulación de recordatorio enviado a ${toEmail}` };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: "🛒 Tus productos TCG te están esperando en GOSU®",
      react: AbandonedCartEmail({ toEmail, items, subtotal }),
    });

    console.log(`[Resend Webhook/Función] ✅ Correo de carrito abandonado enviado con éxito a ${toEmail}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando recordatorio de carrito con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 7. Correo de Reporte de Estado de Cuenta a Creadores/Afiliados TCG
 */
export async function sendAffiliateReportEmail({
  toEmail,
  affiliateName,
  code,
  commissionRate,
  totalSalesPEN = 0,
  totalSalesUSD = 0,
  pendingCommissionPEN = 0,
  pendingCommissionUSD = 0,
  totalSales = 0,
  pendingCommission = 0,
  totalOrders = 0,
}: {
  toEmail: string;
  affiliateName: string;
  code: string;
  commissionRate: number;
  totalSalesPEN?: number;
  totalSalesUSD?: number;
  pendingCommissionPEN?: number;
  pendingCommissionUSD?: number;
  totalSales?: number;
  pendingCommission?: number;
  totalOrders: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo email de reporte de afiliado.");
    return { success: false, error: "API Key no configurada" };
  }

  const penSalesText = totalSalesPEN > 0 ? `S/. ${totalSalesPEN.toFixed(2)} PEN` : "";
  const usdSalesText = totalSalesUSD > 0 ? `$ ${totalSalesUSD.toFixed(2)} USD` : "";
  const salesBreakdown = [penSalesText, usdSalesText].filter(Boolean).join(" + ") || `$${totalSales.toFixed(2)} USD`;

  const penCommText = pendingCommissionPEN > 0 ? `S/. ${pendingCommissionPEN.toFixed(2)} PEN` : "";
  const usdCommText = pendingCommissionUSD > 0 ? `$ ${pendingCommissionUSD.toFixed(2)} USD` : "";
  const commBreakdown = [penCommText, usdCommText].filter(Boolean).join(" + ") || `$${pendingCommission.toFixed(2)} USD`;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: `📊 Estado de Cuenta y Comisiones - Afiliado ${code} (GOSU® TCG)`,
      react: NewsletterEmail({
        subject: `📊 Estado de Cuenta y Comisiones - Afiliado ${code} (GOSU® TCG)`,
        previewText: `Hola ${affiliateName}, este es tu resumen de ventas y comisiones acumuladas.`,
        badgeTitle: "🏆 REPORTE OFICIAL CREADOR GOSU®",
        contentHTML: `
          <h2 style="color: #FFFFFF; font-size: 20px; text-transform: uppercase; margin: 0 0 12px 0;">¡Hola ${affiliateName}!</h2>
          <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
            Te compartimos tu estado de cuenta actualizado a la fecha para tu código de creador <strong style="color:#00F0FF; font-family:monospace;">${code}</strong>.
          </p>
          <div style="background-color:#141414; border:1px solid #262626; border-radius:10px; padding:16px; margin-bottom:20px;">
            <table style="width:100%; font-family:sans-serif; text-align:left; border-collapse:collapse;">
              <tr>
                <td style="color:#A3A3A3; padding:6px 0; font-size:13px;">Código Promocional:</td>
                <td style="color:#FFFFFF; font-weight:bold; font-family:monospace; padding:6px 0; font-size:14px; text-align:right;">${code}</td>
              </tr>
              <tr>
                <td style="color:#A3A3A3; padding:6px 0; font-size:13px;">Descuento para seguidores:</td>
                <td style="color:#10B981; font-weight:bold; font-family:monospace; padding:6px 0; font-size:14px; text-align:right;">10% OFF</td>
              </tr>
              <tr>
                <td style="color:#A3A3A3; padding:6px 0; font-size:13px;">Tasa de Comisión:</td>
                <td style="color:#A855F7; font-weight:bold; font-family:monospace; padding:6px 0; font-size:14px; text-align:right;">${commissionRate}%</td>
              </tr>
              <tr>
                <td style="color:#A3A3A3; padding:6px 0; font-size:13px;">Total Ventas Generadas:</td>
                <td style="color:#FFFFFF; font-weight:bold; font-family:monospace; padding:6px 0; font-size:14px; text-align:right;">${salesBreakdown} (${totalOrders} compras)</td>
              </tr>
              <tr style="border-top:1px solid #333;">
                <td style="color:#FFFFFF; padding:10px 0 4px 0; font-size:14px; font-weight:bold;">Comisiones por Cobrar:</td>
                <td style="color:#10B981; font-weight:extrabold; font-family:monospace; padding:10px 0 4px 0; font-size:18px; text-align:right;">${commBreakdown}</td>
              </tr>
            </table>
          </div>
          <p style="color:#737373; font-size:12px; margin:0;">Si tienes preguntas sobre tus comisiones o pagos, contáctanos a afiliados@gosutcg.pe.</p>
        `,
        ctaText: "Ingresar a Mi Portal de Afiliado",
        ctaUrl: (process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app") + "/account/affiliate",
      }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error al enviar reporte por correo a afiliado:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 7. Correo de Confirmación de Liquidación de Comisión (Payouts)
 */
export async function sendAffiliatePayoutEmail({
  toEmail,
  affiliateName,
  code,
  amount,
  currency = "PEN",
  payoutMethod,
  bankName,
  accountNumber,
  storeCreditCode,
}: {
  toEmail: string;
  affiliateName: string;
  code: string;
  amount: number;
  currency?: string;
  payoutMethod: "TRANSFER" | "STORE_CREDIT";
  bankName?: string | null;
  accountNumber?: string | null;
  storeCreditCode?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo envío de email de payout.");
    return { success: false, error: "API Key no configurada" };
  }

  const symbol = currency.toUpperCase() === "USD" ? "$" : "S/.";
  const formattedAmount = `${symbol} ${amount.toFixed(2)} ${currency.toUpperCase()}`;

  const isTransfer = payoutMethod === "TRANSFER";
  const subject = isTransfer
    ? `💰 ¡Liquidación Procesada! Transferencia Bancaria por ${formattedAmount} (GOSU® TCG)`
    : `🎁 ¡Comisión Convertida! Tu Crédito en Tienda por ${formattedAmount} está Listo (GOSU® TCG)`;

  const detailHTML = isTransfer
    ? `
      <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        ¡Hola ${affiliateName}! Te informamos que hemos procesado la liquidación de tus comisiones del programa de creadores por tu código <strong style="color:#00F0FF; font-family:monospace;">${code}</strong>.
      </p>
      <div style="background-color:#141414; border:1px solid #10B981; border-radius:10px; padding:16px; margin-bottom:20px;">
        <table style="width:100%; font-family:sans-serif; text-align:left; border-collapse:collapse;">
          <tr>
            <td style="color:#A3A3A3; padding:6px 0; font-size:13px;">Monto Liquidado:</td>
            <td style="color:#10B981; font-weight:extrabold; font-family:monospace; padding:6px 0; font-size:18px; text-align:right;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="color:#A3A3A3; padding:6px 0; font-size:13px;">Método de Pago:</td>
            <td style="color:#FFFFFF; font-weight:bold; font-family:monospace; padding:6px 0; font-size:14px; text-align:right;">Transferencia Bancaria (${bankName || "BCP/Interbank"})</td>
          </tr>
          ${accountNumber ? `
          <tr>
            <td style="color:#A3A3A3; padding:6px 0; font-size:13px;">Cuenta / CCI:</td>
            <td style="color:#FFFFFF; font-weight:bold; font-family:monospace; padding:6px 0; font-size:14px; text-align:right;">${accountNumber}</td>
          </tr>
          ` : ""}
        </table>
      </div>
      <p style="color:#A3A3A3; font-size:13px; line-height:1.5; margin:0 0 12px 0;">
        El depósito correspondiente ya ha sido emitido. Dependiendo del tipo de transferencia (interbancaria o directa BCP/Interbank), se verá reflejado en tu saldo en breve.
      </p>
    `
    : `
      <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        ¡Hola ${affiliateName}! Conforme a tu solicitud, hemos convertido tus comisiones acumuladas del código <strong style="color:#00F0FF; font-family:monospace;">${code}</strong> en un <strong>Crédito Exclusivo para la Tienda</strong>.
      </p>
      <div style="background-color:#141414; border:1px solid #A855F7; border-radius:10px; padding:16px; margin-bottom:20px;">
        <table style="width:100%; font-family:sans-serif; text-align:left; border-collapse:collapse;">
          <tr>
            <td style="color:#A3A3A3; padding:6px 0; font-size:13px;">Monto del Crédito:</td>
            <td style="color:#A855F7; font-weight:extrabold; font-family:monospace; padding:6px 0; font-size:18px; text-align:right;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="color:#A3A3A3; padding:6px 0; font-size:13px;">Código de Descuento:</td>
            <td style="color:#00F0FF; font-weight:bold; font-family:monospace; padding:6px 0; font-size:16px; text-align:right;">${storeCreditCode}</td>
          </tr>
        </table>
      </div>
      <p style="color:#A3A3A3; font-size:13px; line-height:1.5; margin:0 0 12px 0;">
        Ingresa este código durante el Checkout para descontar el total de tu compra en cualquier producto del catálogo de GOSU® TCG Gear.
      </p>
    `;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject,
      react: NewsletterEmail({
        subject,
        previewText: `Hola ${affiliateName}, tu liquidación de comisión de ${formattedAmount} ha sido procesada.`,
        badgeTitle: "💎 LIQUIDACIÓN CREADOR GOSU®",
        contentHTML: detailHTML,
        ctaText: "Ver Mi Portal de Afiliado",
        ctaUrl: (process.env.NEXT_PUBLIC_APP_URL || "https://shop.gosuaccessories.com") + "/creadores/portal",
      }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando email de payout con Resend:", error);
    return { success: false, error: error.message };
  }
}
