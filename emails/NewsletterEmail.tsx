import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Text,
  Button,
} from "@react-email/components";

interface NewsletterEmailProps {
  subject?: string;
  previewText?: string;
  badgeTitle?: string;
  contentHTML?: string;
  ctaText?: string;
  ctaUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app";

export const NewsletterEmail = ({
  subject = "⚡ Novedades y Ofertas Exclusivas GOSU® TCG",
  previewText = "Descubre los últimos lanzamientos de fundas, binders y accesorios TCG",
  badgeTitle = "⚡ NOVEDADES & CLUB GOSU®",
  contentHTML = "<p>¡Hola! Te traemos los nuevos accesorios TCG disponibles en la tienda.</p>",
  ctaText,
  ctaUrl,
}: NewsletterEmailProps) => {
  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText || subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header con Logo */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/gosu-logo-white.png`}
              width="140"
              height="38"
              alt="GOSU® TCG GEAR"
              style={logo}
            />
          </Section>

          {/* Contenido Principal */}
          <Section style={content}>
            <div style={badgeContainer}>
              <Text style={badgeText}>{badgeTitle}</Text>
            </div>

            {/* Inyección del HTML simple del editor enriquecido */}
            <div
              style={htmlWrapper}
              dangerouslySetInnerHTML={{ __html: contentHTML }}
            />

            {/* Botón CTA opcional */}
            {ctaText && ctaUrl && (
              <Section style={ctaContainer}>
                <Button href={ctaUrl} style={button}>
                  {ctaText} &rarr;
                </Button>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.<br />
              Recibes este correo porque estás suscrito a las novedades de GOSU® TCG Gear.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewsletterEmail;

const main = {
  backgroundColor: "#050505",
  fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#0D0D0D",
  border: "1px solid #262626",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: "#141414",
  borderBottom: "1px solid #262626",
  padding: "28px 24px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const content = {
  padding: "36px 32px",
};

const badgeContainer = {
  backgroundColor: "rgba(16, 185, 129, 0.12)",
  border: "1px solid rgba(16, 185, 129, 0.4)",
  borderRadius: "20px",
  display: "inline-block",
  padding: "4px 14px",
  marginBottom: "20px",
};

const badgeText = {
  color: "#10B981",
  fontSize: "11px",
  fontWeight: "bold" as const,
  fontFamily: "monospace",
  margin: "0",
};

const htmlWrapper = {
  color: "#E5E5E5",
  fontSize: "14px",
  lineHeight: "1.6",
  marginBottom: "24px",
};

const ctaContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#00F0FF",
  borderRadius: "30px",
  color: "#000000",
  fontSize: "12px",
  fontWeight: "bold" as const,
  fontFamily: "monospace",
  padding: "14px 32px",
  textDecoration: "none",
  textTransform: "uppercase" as const,
};

const footer = {
  backgroundColor: "#050505",
  borderTop: "1px solid #1A1A1A",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#525252",
  fontSize: "11px",
  fontFamily: "monospace",
  margin: "0",
};
