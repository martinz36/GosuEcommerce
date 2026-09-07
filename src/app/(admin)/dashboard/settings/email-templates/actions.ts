"use server";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { revalidatePath } from "next/cache";

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
    const fromSender = process.env.SENDER_EMAIL || "GOSU® TCG Gear <onboarding@resend.dev>";

    // Generar HTML personalizado según la plantilla
    const logoUrl = "https://gosuecommerce.vercel.app/gosu-logo-white.png";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><title>${subject}</title></head>
      <body style="margin: 0; padding: 0; background-color: #050505; color: #FFFFFF; font-family: 'Segoe UI', sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0D0D0D; border: 1px solid #262626; border-radius: 16px; overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 32px 24px; background-color: #141414; border-bottom: 1px solid #262626;">
                    <img src="${logoUrl}" alt="GOSU® TCG GEAR" style="height: 38px; width: auto; display: block; margin: 0 auto;" />
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(255, 255, 255, 0.08); border: 1px solid ${accentColor}; color: ${accentColor}; font-size: 11px; font-family: monospace; font-weight: bold; margin-bottom: 16px;">
                      🧪 CORREO DE PRUEBA DESDE ADMIN
                    </div>

                    <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #FFFFFF; text-transform: uppercase;">
                      ${bannerTitle}
                    </h2>

                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #A3A3A3; line-height: 1.6;">
                      ${customNote}
                    </p>

                    <div style="background-color: #141414; border: 1px solid #262626; padding: 16px; border-radius: 10px; margin-bottom: 24px; font-size: 12px; color: #A3A3A3;">
                      <strong style="color: #FFFFFF; display: block; margin-bottom: 4px;">Detalles de la Plantilla:</strong>
                      Tipo: <span style="color: ${accentColor}; font-family: monospace;">${templateType}</span><br>
                      Fecha: <span style="color: #FFFFFF; font-family: monospace;">${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })}</span>
                    </div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app"}" 
                             style="display: inline-block; background-color: ${accentColor}; color: #000000; font-weight: 800; font-size: 12px; font-family: monospace; text-transform: uppercase; padding: 14px 28px; border-radius: 30px; text-decoration: none;">
                            Ir a GOSU® TCG &rarr;
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

    const data = await resend.emails.send({
      from: fromSender,
      to: [cleanEmail],
      subject: `[PRUEBA] ${subject}`,
      html: htmlContent,
    });

    return { success: true, message: `Correo de prueba enviado con éxito a ${cleanEmail}` };
  } catch (error: any) {
    console.error("Error al enviar correo de prueba con Resend:", error);
    return { success: false, error: error.message || "Error al enviar correo con Resend." };
  }
}
