import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Heading,
  Text,
  Button,
} from "@react-email/components";

interface WelcomeEmailProps {
  userName?: string | null;
  toEmail?: string;
  loyaltyPoints?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app";

export const WelcomeEmail = ({
  userName,
  toEmail = "cliente@gosu.com",
  loyaltyPoints = 50,
}: WelcomeEmailProps) => {
  const name = userName || toEmail.split("@")[0];

  return (
    <Html lang="es">
      <Head />
      <Preview>✨ ¡Bienvenido a GOSU® TCG! Tus 50 Puntos de regalo están listos</Preview>
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
              <Text style={badgeText}>✨ ¡{loyaltyPoints} PUNTOS DE BIENVENIDA ACREDITADOS!</Text>
            </div>

            <Heading style={heading}>
              ¡Bienvenido a la comunidad, {name}!
            </Heading>

            <Text style={paragraph}>
              Gracias por unirte a <strong>GOSU® TCG Gear</strong>. Tu cuenta ha sido activada exitosamente y hemos sumado tus primeros <strong>{loyaltyPoints} Puntos de Fidelidad (GOSU® Loyalty)</strong> para que los disfrutes en tus compras de accesorios premium TCG.
            </Text>

            {/* Card Saldo Loyalty */}
            <Section style={pointsCard}>
              <Text style={pointsLabel}>TU SALDO INICIAL</Text>
              <Text style={pointsAmount}>{loyaltyPoints} PTS</Text>
              <Text style={pointsSubtext}>Equivalente a descuento inmediato en Checkout</Text>
            </Section>

            {/* Botón CTA */}
            <Section style={ctaContainer}>
              <Button href={`${baseUrl}/products`} style={button}>
                Explorar Catálogo TCG &rarr;
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.<br />
              Soporte: soporte@gosu.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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
  backgroundColor: "rgba(255, 0, 122, 0.12)",
  border: "1px solid rgba(255, 0, 122, 0.4)",
  borderRadius: "20px",
  display: "inline-block",
  padding: "4px 14px",
  marginBottom: "16px",
};

const badgeText = {
  color: "#FF007A",
  fontSize: "11px",
  fontWeight: "bold" as const,
  fontFamily: "monospace",
  margin: "0",
};

const heading = {
  color: "#FFFFFF",
  fontSize: "22px",
  fontWeight: "bold" as const,
  lineHeight: "1.3",
  margin: "0 0 16px 0",
  textTransform: "uppercase" as const,
};

const paragraph = {
  color: "#A3A3A3",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
};

const pointsCard = {
  backgroundColor: "#141414",
  border: "1px solid #262626",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  marginBottom: "28px",
};

const pointsLabel = {
  color: "#737373",
  fontSize: "10px",
  fontFamily: "monospace",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
};

const pointsAmount = {
  color: "#00F0FF",
  fontSize: "32px",
  fontWeight: "800" as const,
  fontFamily: "monospace",
  margin: "0",
};

const pointsSubtext = {
  color: "#FF007A",
  fontSize: "11px",
  margin: "4px 0 0 0",
};

const ctaContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#FFFFFF",
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
