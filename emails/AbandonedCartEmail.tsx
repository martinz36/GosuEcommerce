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

interface CartItem {
  title: string;
  quantity: number;
  price: number;
}

interface AbandonedCartEmailProps {
  toEmail?: string;
  items?: CartItem[];
  subtotal?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app";

export const AbandonedCartEmail = ({
  toEmail = "cliente@gosu.com",
  items = [],
  subtotal = 0,
}: AbandonedCartEmailProps) => {
  return (
    <Html lang="es">
      <Head />
      <Preview>🛒 Tus productos TCG te están esperando en GOSU®</Preview>
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
              <Text style={badgeText}>🛒 TUS PRODUCTOS SIGUEN RESERVADOS</Text>
            </div>

            <Heading style={heading}>
              ¿Olvidaste completar tu pedido?
            </Heading>

            <Text style={paragraph}>
              Notamos que dejaste algunos accesorios TCG en tu carrito de compra. ¡No dejes pasar el stock de tus fundas y protectores preferidos!
            </Text>

            {/* Lista de productos */}
            <Section style={itemsContainer}>
              {items.map((item, index) => (
                <div key={index} style={itemCard}>
                  <Text style={itemTitle}>{item.title} (x{item.quantity})</Text>
                  <Text style={itemPrice}>S/. {(item.price * item.quantity).toFixed(2)} PEN</Text>
                </div>
              ))}
            </Section>

            {/* Botón Reanudar Compra */}
            <Section style={ctaContainer}>
              <Button href={`${baseUrl}/checkout`} style={button}>
                Completar Mi Compra Ahora &rarr;
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AbandonedCartEmail;

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
  margin: "0 0 12px 0",
  textTransform: "uppercase" as const,
};

const paragraph = {
  color: "#A3A3A3",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 20px 0",
};

const itemsContainer = {
  marginBottom: "24px",
};

const itemCard = {
  backgroundColor: "#141414",
  border: "1px solid #262626",
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "8px",
};

const itemTitle = {
  color: "#FFFFFF",
  fontSize: "13px",
  margin: "0 0 4px 0",
};

const itemPrice = {
  color: "#00F0FF",
  fontSize: "13px",
  fontFamily: "monospace",
  fontWeight: "bold" as const,
  margin: "0",
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
