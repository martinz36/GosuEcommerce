"use server";

import { prisma } from "@/lib/prisma";
import { sendNewsletterEmail } from "@/lib/resend";

export async function getNewsletterStatsAction() {
  try {
    const totalUsers = await prisma.user.count();
    return { success: true, count: totalUsers };
  } catch (error: any) {
    console.error("Error al obtener estadísticas de suscriptores:", error);
    return { success: false, count: 0, error: error.message };
  }
}

export async function sendTestNewsletterAction({
  testEmail,
  subject,
  previewText,
  contentHTML,
  ctaText,
  ctaUrl,
}: {
  testEmail: string;
  subject: string;
  previewText?: string;
  contentHTML: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  if (!testEmail || !testEmail.includes("@")) {
    return { success: false, error: "Ingresa un correo electrónico de prueba válido." };
  }
  if (!contentHTML || contentHTML.trim() === "") {
    return { success: false, error: "El contenido del mensaje no puede estar vacío." };
  }

  const result = await sendNewsletterEmail({
    toEmail: testEmail,
    subject: subject || "⚡ Novedades GOSU® TCG (Prueba)",
    previewText,
    contentHTML,
    ctaText,
    ctaUrl,
  });

  return result;
}

export async function sendBroadcastNewsletterAction({
  subject,
  previewText,
  contentHTML,
  ctaText,
  ctaUrl,
}: {
  subject: string;
  previewText?: string;
  contentHTML: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  if (!contentHTML || contentHTML.trim() === "") {
    return { success: false, error: "El contenido del mensaje no puede estar vacío." };
  }

  try {
    const users = await prisma.user.findMany({
      select: { email: true },
    });

    if (!users || users.length === 0) {
      return { success: false, error: "No hay usuarios registrados en la base de datos." };
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const user of users) {
      if (user.email) {
        const res = await sendNewsletterEmail({
          toEmail: user.email,
          subject: subject || "⚡ Novedades y Ofertas Exclusivas GOSU® TCG",
          previewText,
          contentHTML,
          ctaText,
          ctaUrl,
        });

        if (res.success) {
          sentCount++;
        } else {
          failedCount++;
        }
      }
    }

    return {
      success: true,
      message: `Boletín enviado con éxito a ${sentCount} suscriptores (${failedCount} fallidos).`,
      sentCount,
    };
  } catch (error: any) {
    console.error("Error al transmitir newsletter masivo:", error);
    return { success: false, error: error.message };
  }
}
