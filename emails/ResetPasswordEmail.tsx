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

interface ResetPasswordEmailProps {
  userName?: string | null;
  toEmail?: string;
  resetLink?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app";

export const ResetPasswordEmail = ({
  userName,
  toEmail = "cliente@gosu.com",
  resetLink = `${baseUrl}/account/forgot-password`,
}: ResetPasswordEmailProps) => {
  const name = userName || toEmail.split("@")[0];

  return (
    <Html lang="es">
      <Head />
      <Preview>🔐 Solicitud de restablecimiento de contraseña - GOSU® TCG</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/gosu-logo-white.png`}
              width="140"
              height="38"
              alt="GOSU® TCG GEAR"
              style={logo}
            />
          </Section>

          {/* Contenido */}
          <Section style={content}>
            <div style={badgeContainer}>
              <Text style={badgeText}>🔐 SEGURIDAD DE CUENTA</Text>
            </div>

            <Heading style={heading}>
              Restablecer Contraseña
            </Heading>

            <Text style={paragraph}>
              Hola <strong>{name}</strong>, recibimos una solicitud para cambiar la contraseña de tu cuenta de <strong>GOSU® TCG Gear</strong>.
            </Text>

            <Text style={paragraph}>
              Haz clic en el siguiente botón seguro para establecer tu nueva clave. Este enlace expira en 60 minutos por razones de seguridad:
            </Text>

            {/* Botón CTA */}
            <Section style={ctaContainer}>
              <Button href={resetLink} style={button}>
                Restablecer Mi Contraseña &rarr;
              </Button>
            </Section>

            <Section style={warningCard}>
              <Text style={warningText}>
                ⚠️ Si no solicitaste este cambio, puedes ignorar este correo con seguridad. Tu contraseña actual seguirá estando protegida.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.<br />
              Si requieres asistencia inmediata, escribe a soporte@gosu.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

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
  backgroundColor: "rgba(234, 179, 8, 0.12)",
  border: "1px solid rgba(234, 179, 8, 0.4)",
  borderRadius: "20px",
  display: "inline-block",
  padding: "4px 14px",
  marginBottom: "16px",
};

const badgeText = {
  color: "#EAB308",
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
  margin: "0 0 16px 0",
};

const ctaContainer = {
  textAlign: "center" as const,
  margin: "28px 0",
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

const warningCard = {
  backgroundColor: "#141414",
  border: "1px solid #262626",
  borderRadius: "10px",
  padding: "16px",
  marginTop: "20px",
};

const warningText = {
  color: "#737373",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
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
