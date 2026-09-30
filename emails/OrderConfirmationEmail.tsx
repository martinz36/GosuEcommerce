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

interface OrderItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

interface OrderConfirmationEmailProps {
  orderNumber?: string;
  totalAmount?: number;
  currency?: string;
  items?: OrderItem[];
  shippingAddress?: any;
  loyaltyPointsEarned?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app";

export const OrderConfirmationEmail = ({
  orderNumber = "GOSU-10001",
  totalAmount = 0,
  currency = "S/.",
  items = [],
  shippingAddress,
  loyaltyPointsEarned = 0,
}: OrderConfirmationEmailProps) => {
  const addressString = shippingAddress
    ? typeof shippingAddress === "string"
      ? shippingAddress
      : `${shippingAddress.street || ""}, ${shippingAddress.city || ""}, ${shippingAddress.state || ""}`
    : "Recojo en Tienda / Envío registrado";

  return (
    <Html lang="es">
      <Head />
      <Preview>📦 Confirmación de Pedido {orderNumber} - GOSU® TCG</Preview>
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
              <Text style={badgeText}>✓ PAGO CONFIRMADO CON ÉXITO</Text>
            </div>

            <Heading style={heading}>
              ¡Gracias por tu compra!
            </Heading>
            <Text style={orderSub}>
              Pedido Nº: <span style={orderHighlight}>{orderNumber}</span>
            </Text>

            {/* Tabla de Productos */}
            <Section style={tableSection}>
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th align="left" style={thLeft}>PRODUCTO</th>
                    <th align="right" style={thRight}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={tdLeft}>
                        {item.title} x <strong>{item.quantity}</strong>
                      </td>
                      <td align="right" style={tdRight}>
                        {currency} {(item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* Total Box */}
            <Section style={totalCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={totalLabel}>Total Pagado:</Text>
                <Text style={totalValue}>
                  {currency} {totalAmount.toFixed(2)}
                </Text>
              </div>
              {loyaltyPointsEarned > 0 && (
                <Text style={loyaltyText}>
                  ✨ ¡Has acumulado +{loyaltyPointsEarned} Puntos GOSU® Loyalty en esta compra!
                </Text>
              )}
            </Section>

            {/* Dirección de Entrega */}
            <Section style={addressCard}>
              <Text style={addressLabel}>DIRECCIÓN DE ENTREGA:</Text>
              <Text style={addressText}>{addressString}</Text>
            </Section>

            {/* Botón Ver Pedido */}
            <Section style={ctaContainer}>
              <Button href={`${baseUrl}/account/orders`} style={button}>
                Ver Mi Pedido &rarr;
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

export default OrderConfirmationEmail;

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
  backgroundColor: "rgba(0, 240, 255, 0.12)",
  border: "1px solid rgba(0, 240, 255, 0.4)",
  borderRadius: "20px",
  display: "inline-block",
  padding: "4px 14px",
  marginBottom: "16px",
};

const badgeText = {
  color: "#00F0FF",
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
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
};

const orderSub = {
  color: "#A3A3A3",
  fontSize: "13px",
  fontFamily: "monospace",
  margin: "0 0 24px 0",
};

const orderHighlight = {
  color: "#00F0FF",
  fontWeight: "bold" as const,
};

const tableSection = {
  marginBottom: "20px",
};

const thLeft = {
  borderBottom: "1px solid #333333",
  color: "#737373",
  fontSize: "10px",
  fontFamily: "monospace",
  paddingBottom: "8px",
  textTransform: "uppercase" as const,
};

const thRight = {
  borderBottom: "1px solid #333333",
  color: "#737373",
  fontSize: "10px",
  fontFamily: "monospace",
  paddingBottom: "8px",
  textTransform: "uppercase" as const,
};

const tdLeft = {
  borderBottom: "1px solid #1F1F1F",
  color: "#E5E5E5",
  fontSize: "13px",
  padding: "12px 0",
};

const tdRight = {
  borderBottom: "1px solid #1F1F1F",
  color: "#FFFFFF",
  fontFamily: "monospace",
  fontSize: "13px",
  padding: "12px 0",
};

const totalCard = {
  backgroundColor: "#141414",
  border: "1px solid #262626",
  borderRadius: "10px",
  padding: "16px 20px",
  marginBottom: "20px",
};

const totalLabel = {
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "bold" as const,
  margin: "0",
};

const totalValue = {
  color: "#00F0FF",
  fontSize: "18px",
  fontWeight: "800" as const,
  fontFamily: "monospace",
  margin: "0",
  textAlign: "right" as const,
};

const loyaltyText = {
  color: "#FF007A",
  fontSize: "11px",
  fontFamily: "monospace",
  marginTop: "8px",
  textAlign: "right" as const,
};

const addressCard = {
  backgroundColor: "#050505",
  border: "1px solid #262626",
  borderRadius: "10px",
  padding: "16px",
  marginBottom: "28px",
};

const addressLabel = {
  color: "#FFFFFF",
  fontSize: "11px",
  fontFamily: "monospace",
  fontWeight: "bold" as const,
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
};

const addressText = {
  color: "#A3A3A3",
  fontSize: "12px",
  margin: "0",
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
