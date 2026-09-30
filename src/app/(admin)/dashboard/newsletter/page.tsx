import React from "react";
import { prisma } from "@/lib/prisma";
import { NewsletterClient } from "./NewsletterClient";

export const revalidate = 0;

export default async function AdminNewsletterPage() {
  let subscriberCount = 0;

  try {
    if (process.env.DATABASE_URL) {
      subscriberCount = await prisma.user.count();
    }
  } catch (err) {
    console.error("Error obteniendo suscriptores de Neon DB:", err);
  }

  return <NewsletterClient initialSubscriberCount={subscriberCount} />;
}
