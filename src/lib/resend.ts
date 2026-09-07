import { Resend } from "resend";

// Inicializar cliente de Resend (Usar API KEY de env)
export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

// Remitente por defecto (Personalizable desde variables de entorno de Vercel)
const DEFAULT_FROM = process.env.SENDER_EMAIL || "GOSU® TCG Gear <onboarding@resend.dev>";

/**
 * 1. Correo de Bienvenida (Registro de Usuario / Google OAuth)
 */
export async function sendWelcomeEmail({
  toEmail,
  userName,
}: {
  toEmail: string;
  userName?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo envío de email de bienvenida.");
    return { success: false, error: "API Key no configurada" };
  }

  const cleanName = userName || toEmail.split("@")[0];

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>¡Bienvenido a GOSU® TCG!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #050505; color: #FFFFFF; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0D0D0D; border: 1px solid #262626; border-radius: 16px; overflow: hidden; max-width: 600px;">
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 32px 24px; background: linear-gradient(180deg, #141414 0%, #0D0D0D 100%); border-bottom: 1px solid #262626;">
                  <img src="https://gosuecommerce.vercel.app/gosu-logo-white.png" alt="GOSU® TCG GEAR" style="height: 38px; width: auto; display: block; margin: 0 auto;" />
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px 32px;">
                  <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(255, 0, 122, 0.15); border: 1px solid rgba(255, 0, 122, 0.4); color: #FF007A; font-size: 11px; font-family: monospace; font-weight: bold; margin-bottom: 16px;">
                    ✨ ¡50 PUNTOS DE BIENVENIDA ACREDITADOS!
                  </div>

                  <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #FFFFFF; text-transform: uppercase;">
                    ¡Bienvenido a la comunidad, ${cleanName}!
                  </h2>

                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3;">
                    Gracias por unirte a <strong>GOSU® TCG Gear</strong>. Tu cuenta ha sido activada exitosamente y hemos sumado tus primeros <strong>50 Puntos de Fidelidad (GOSU® Loyalty)</strong> para que los uses en tus compras de accesorios premium TCG.
                  </p>

                  <!-- Card de Regalo -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #141414; border: 1px solid #262626; border-radius: 12px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <span style="font-size: 11px; color: #A3A3A3; font-family: monospace; display: block; uppercase;">Tu Saldo Inicial</span>
                        <span style="font-size: 32px; font-weight: 800; color: #00F0FF; font-family: monospace;">50 PTS</span>
                        <span style="font-size: 12px; color: #FF007A; display: block; margin-top: 4px;">Equivalente a descuento inmediato en Checkout</span>
                      </td>
                    </tr>
                  </table>

                  <!-- Botón -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app"}/products" 
                           style="display: inline-block; background-color: #FFFFFF; color: #000000; font-weight: 800; font-size: 12px; font-family: monospace; text-transform: uppercase; padding: 14px 28px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 14px rgba(255,255,255,0.15);">
                          Explorar Catálogo TCG &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px; background-color: #050505; border-top: 1px solid #1A1A1A; text-align: center; font-size: 11px; color: #525252; font-family: monospace;">
                  &copy; ${new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.<br>
                  Si tienes dudas, contáctanos a soporte@gosu.com
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: "✨ ¡Bienvenido a GOSU® TCG! Tus 50 Puntos están listos",
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando correo de bienvenida con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Correo de Confirmación de Pedido (Stripe Paid Order)
 */
export async function sendOrderConfirmationEmail({
  toEmail,
  orderNumber,
  totalAmount,
  currency,
  items,
  shippingAddress,
  loyaltyPointsEarned,
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

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #1F1F1F; color: #E5E5E5; font-size: 13px;">
          ${item.title} x <strong>${item.quantity}</strong>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #1F1F1F; color: #FFFFFF; font-family: monospace; font-size: 13px;">
          ${currency} ${(item.unitPrice * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const addressString = shippingAddress
    ? `${shippingAddress.street || ""}, ${shippingAddress.city || ""}, ${shippingAddress.state || ""}`
    : "Recojo en Tienda / Envío registrado";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><title>Confirmación de Pedido GOSU®</title></head>
    <body style="margin: 0; padding: 0; background-color: #050505; color: #FFFFFF; font-family: 'Segoe UI', sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0D0D0D; border: 1px solid #262626; border-radius: 16px; overflow: hidden; max-width: 600px;">
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 32px 24px; background-color: #141414; border-bottom: 1px solid #262626;">
                  <img src="https://gosuecommerce.vercel.app/gosu-logo-white.png" alt="GOSU® TCG GEAR" style="height: 38px; width: auto; display: block; margin: 0 auto;" />
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 32px;">
                  <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(0, 240, 255, 0.15); border: 1px solid rgba(0, 240, 255, 0.4); color: #00F0FF; font-size: 11px; font-family: monospace; font-weight: bold; margin-bottom: 16px;">
                    ✓ PAGO CONFIRMADO CON ÉXITO
                  </div>

                  <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #FFFFFF; text-transform: uppercase;">
                    ¡Gracias por tu compra!
                  </h2>
                  <p style="margin: 0 0 24px 0; font-size: 13px; color: #A3A3A3; font-family: monospace;">
                    Pedido Nº: <strong style="color: #00F0FF;">${orderNumber}</strong>
                  </p>

                  <!-- Tabla de Productos -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                    <thead>
                      <tr>
                        <th align="left" style="padding-bottom: 8px; border-bottom: 1px solid #333; color: #737373; font-size: 11px; font-family: monospace; text-transform: uppercase;">Producto</th>
                        <th align="right" style="padding-bottom: 8px; border-bottom: 1px solid #333; color: #737373; font-size: 11px; font-family: monospace; text-transform: uppercase;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Total -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #141414; padding: 16px; border-radius: 10px; margin-bottom: 24px;">
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; color: #FFFFFF;">Total Pagado:</td>
                      <td align="right" style="font-size: 18px; font-weight: 800; color: #00F0FF; font-family: monospace;">
                        ${currency} ${totalAmount.toFixed(2)}
                      </td>
                    </tr>
                    ${
                      loyaltyPointsEarned
                        ? `
                    <tr>
                      <td colspan="2" style="padding-top: 8px; text-align: right; font-size: 11px; color: #FF007A; font-family: monospace;">
                        ✨ ¡Has acumulado +${loyaltyPointsEarned} Puntos GOSU® Loyalty en esta compra!
                      </td>
                    </tr>`
                        : ""
                    }
                  </table>

                  <!-- Dirección -->
                  <div style="background-color: #050505; border: 1px solid #262626; padding: 16px; border-radius: 10px; margin-bottom: 24px; font-size: 12px; color: #A3A3A3;">
                    <strong style="color: #FFFFFF; font-family: monospace; display: block; margin-bottom: 4px; uppercase;">Dirección de Entrega:</strong>
                    ${addressString}
                  </div>

                  <!-- Botón Rastreo -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app"}/account/orders" 
                           style="display: inline-block; background-color: #FFFFFF; color: #000000; font-weight: 800; font-size: 12px; font-family: monospace; text-transform: uppercase; padding: 14px 28px; border-radius: 30px; text-decoration: none;">
                          Ver Mi Pedido &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px; background-color: #050505; border-top: 1px solid #1A1A1A; text-align: center; font-size: 11px; color: #525252; font-family: monospace;">
                  &copy; ${new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: `📦 Confirmación de Pedido ${orderNumber} - GOSU® TCG`,
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando confirmación de pedido con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Correo de Recuperación de Carrito Abandonado (CRM Admin Trigger / Auto)
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

  const itemsListHtml = items
    .map(
      (item) => `
      <div style="padding: 10px; background-color: #141414; border: 1px solid #262626; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="font-size: 13px; color: #FFFFFF;">${item.title} (x${item.quantity})</span>
        <span style="font-size: 13px; color: #00F0FF; font-family: monospace; font-weight: bold;">S/. ${(item.price * item.quantity).toFixed(2)} PEN</span>
      </div>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><title>¡Dejaste artículos en tu carrito GOSU®!</title></head>
    <body style="margin: 0; padding: 0; background-color: #050505; color: #FFFFFF; font-family: 'Segoe UI', sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0D0D0D; border: 1px solid #262626; border-radius: 16px; overflow: hidden; max-width: 600px;">
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 32px 24px; background-color: #141414; border-bottom: 1px solid #262626;">
                  <img src="https://gosuecommerce.vercel.app/gosu-logo-white.png" alt="GOSU® TCG GEAR" style="height: 38px; width: auto; display: block; margin: 0 auto;" />
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 32px;">
                  <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(255, 0, 122, 0.15); border: 1px solid rgba(255, 0, 122, 0.4); color: #FF007A; font-size: 11px; font-family: monospace; font-weight: bold; margin-bottom: 16px;">
                    🛒 TUS PRODUCTOS SIGUEN RESERVADOS
                  </div>

                  <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #FFFFFF; text-transform: uppercase;">
                    ¿Olvidaste completar tu pedido?
                  </h2>

                  <p style="margin: 0 0 20px 0; font-size: 14px; color: #A3A3A3; line-height: 1.6;">
                    Notamos que dejaste algunos accesorios TCG en tu carrito de compra. ¡No dejes pasar el stock de tus fundas y protectores preferidos!
                  </p>

                  <!-- Productos en Carrito -->
                  <div style="margin-bottom: 24px;">
                    ${itemsListHtml}
                  </div>

                  <!-- Botón Reanudar Compra -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app"}/checkout" 
                           style="display: inline-block; background-color: #00F0FF; color: #000000; font-weight: 800; font-size: 13px; font-family: monospace; text-transform: uppercase; padding: 14px 32px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 14px rgba(0, 240, 255, 0.3);">
                          COMPLETAR MI COMPRA AHORA &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px; background-color: #050505; border-top: 1px solid #1A1A1A; text-align: center; font-size: 11px; color: #525252; font-family: monospace;">
                  &copy; ${new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: "🛒 Tus productos TCG te están esperando en GOSU®",
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando recordatorio de carrito con Resend:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Correo de Suscripción a Newsletter
 */
export async function sendNewsletterWelcomeEmail(toEmail: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Omitiendo email de newsletter.");
    return { success: false, error: "API Key no configurada" };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><title>¡Suscrito a GOSU® Newsletter!</title></head>
    <body style="margin: 0; padding: 0; background-color: #050505; color: #FFFFFF; font-family: 'Segoe UI', sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0D0D0D; border: 1px solid #262626; border-radius: 16px; overflow: hidden; max-width: 600px;">
              <tr>
                <td align="center" style="padding: 32px 24px; background-color: #141414; border-bottom: 1px solid #262626;">
                  <img src="https://gosuecommerce.vercel.app/gosu-logo-white.png" alt="GOSU® TCG GEAR" style="height: 38px; width: auto; display: block; margin: 0 auto;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 32px; text-align: center;">
                  <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #FFFFFF; text-transform: uppercase;">
                    ¡Ya eres parte del Club GOSU®!
                  </h2>
                  <p style="margin: 0 0 20px 0; font-size: 13px; color: #A3A3A3; line-height: 1.6;">
                    Te avisaremos primero que a nadie cuando tengamos nuevos lanzamientos de fundas, binders, preventas exclusivas y códigos de descuento secretos.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px; background-color: #050505; border-top: 1px solid #1A1A1A; text-align: center; font-size: 11px; color: #525252; font-family: monospace;">
                  &copy; ${new Date().getFullYear()} GOSU® TCG Gear.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: "⚡ ¡Te has suscrito a las ofertas y novedades de GOSU® TCG!",
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error enviando email de newsletter:", error);
    return { success: false, error: error.message };
  }
}
