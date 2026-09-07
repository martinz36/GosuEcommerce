import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

function getCountryName(iso: string = ""): string {
  const c = iso.trim().toUpperCase();
  if (c === "PE" || c === "PERÚ" || c === "PERU") return "Perú";
  if (c === "US" || c === "USA") return "Estados Unidos";
  if (c === "MX") return "México";
  if (c === "CL") return "Chile";
  if (c === "CO") return "Colombia";
  if (c === "AR") return "Argentina";
  if (c === "ES") return "España";
  return iso || "Perú";
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Base de datos no configurada" }, { status: 500 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            loyaltyPoints: true,
            defaultShippingAddress: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                sku: true,
              },
            },
          },
        },
        discountCode: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // Parsear dirección de envío desde shippingAddressJson o fallback
    let shipObj: any = null;
    if (order.shippingAddressJson) {
      try {
        shipObj = typeof order.shippingAddressJson === "string"
          ? JSON.parse(order.shippingAddressJson)
          : order.shippingAddressJson;
      } catch (e) {
        console.error("Error parseando shippingAddressJson en PDF API:", e);
      }
    }

    const customerName =
      order.user?.name ||
      `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
      order.guestEmail ||
      "Cliente GOSU®";
    const customerEmail = order.user?.email || order.guestEmail || "No especificado";
    const customerPhone = order.user?.phone || shipObj?.phone || "No especificado";

    // Extraer campos de dirección
    const street = shipObj?.street || shipObj?.line1 || order.user?.defaultShippingAddress || "Dirección no especificada";
    const city = shipObj?.city || "";
    const state = shipObj?.state || "";
    const postalCode = shipObj?.postalCode || shipObj?.postal_code || "";
    const country = getCountryName(shipObj?.country || "PE");

    const fullAddressDisplay = [street, city, state, postalCode, country]
      .filter(Boolean)
      .join(", ");

    // Método de pago enmascarado
    const maskedPaymentMethod = order.stripePaymentIntentId
      ? `Tarjeta Stripe (PI: ****${order.stripePaymentIntentId.slice(-6)})`
      : "Pago en Línea Confirmado";

    // Moneda & Puntos
    const currencyCode = (order.currency || "PEN").toUpperCase();
    const currencySymbol = currencyCode === "PEN" ? "S/." : "$";

    const totalAmount = Number(order.totalAmount || 0);
    const subtotalAmount = Number(order.subtotal || 0);
    const discountAmount = Number(order.discountAmount || 0);
    const shippingAmount = Number(order.shippingAmount || 0);

    // Cálculo de Puntos Loyalty Ganados (1 punto por unidad monetaria gastada)
    const pointsEarned = Math.floor(totalAmount);

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Packing Slip - ${order.orderNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 12px;
      line-height: 1.5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .print-actions {
      margin-bottom: 16px;
      text-align: right;
    }
    .btn-print {
      background: #7c3aed;
      color: white;
      border: none;
      padding: 8px 18px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .header-table {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
    }
    .doc-type {
      font-size: 11px;
      font-weight: 800;
      color: #7c3aed;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-align: right;
    }
    .order-number {
      font-size: 18px;
      font-weight: 800;
      font-family: monospace;
      color: #0f172a;
      text-align: right;
    }
    .order-date {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
      text-align: right;
    }
    
    /* Cuadrícula Dual de Tablas (Facturación & Envío) */
    .dual-grid-table {
      width: 100%;
      margin-bottom: 24px;
    }
    .dual-grid-table > tbody > tr > td {
      width: 50%;
      vertical-align: top;
      padding: 0;
    }
    .dual-grid-table > tbody > tr > td:first-child {
      padding-right: 10px;
    }
    .dual-grid-table > tbody > tr > td:last-child {
      padding-left: 10px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      height: 100%;
    }
    .card-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin-bottom: 10px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }
    .info-row {
      margin-bottom: 6px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-weight: 700;
      color: #475569;
      display: inline-block;
      min-width: 85px;
    }
    .info-val {
      color: #0f172a;
      font-weight: 600;
    }
    .info-val-mono {
      font-family: monospace;
      color: #0f172a;
    }

    /* Tabla de Productos Packing List */
    .items-table {
      width: 100%;
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .items-table th {
      background: #0f172a;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 10px 12px;
      text-align: left;
    }
    .items-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 11px;
    }
    .items-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }

    /* Totales y Banner */
    .totals-wrapper {
      width: 100%;
      margin-bottom: 20px;
    }
    .totals-table {
      width: 280px;
      margin-left: auto;
    }
    .totals-table td {
      padding: 4px 0;
      font-size: 11px;
    }
    .total-grand td {
      border-top: 2px solid #0f172a;
      font-size: 14px;
      font-weight: 800;
      color: #6d28d9;
      padding-top: 8px;
    }

    /* Banner Dinámico GOSU Loyalty */
    .loyalty-banner {
      background: #faf5ff;
      border: 1.5px dashed #c084fc;
      border-radius: 10px;
      padding: 12px 16px;
      text-align: center;
      margin-top: 16px;
      margin-bottom: 20px;
    }
    .loyalty-text {
      font-size: 13px;
      font-weight: 800;
      color: #6b21a8;
    }

    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      font-family: monospace;
    }

    @media print {
      .print-actions { display: none; }
      body { padding: 0; background: none; }
      .container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-actions">
      <button onclick="window.print()" class="btn-print">🖨️ Imprimir / Guardar en PDF</button>
    </div>

    <!-- Header Principal -->
    <table class="header-table">
      <tr>
        <td>
          <img src="https://gosuecommerce.vercel.app/gosu-logo-white.png" alt="GOSU® TCG GEAR" style="height: 36px; width: auto; margin-bottom: 4px; display: block; background-color: #050505; padding: 4px 8px; border-radius: 6px;" />
          <div class="brand-subtitle">Accesorios de Torneo & E-commerce • soporte@gosu.com</div>
        </td>
        <td>
          <div class="doc-type">PACKING SLIP / RECIBO</div>
          <div class="order-number">${order.orderNumber}</div>
          <div class="order-date">${new Date(order.createdAt).toLocaleString("es-PE", { timeZone: "America/Lima" })}</div>
        </td>
      </tr>
    </table>

    <!-- Cuadrícula Dual: Facturación & Cliente vs Dirección de Envío -->
    <table class="dual-grid-table">
      <tr>
        <td>
          <div class="info-card">
            <div class="card-title">📋 Facturación & Cliente</div>
            <div class="info-row"><span class="info-label">Cliente:</span> <span class="info-val">${customerName}</span></div>
            <div class="info-row"><span class="info-label">Email:</span> <span class="info-val-mono">${customerEmail}</span></div>
            <div class="info-row"><span class="info-label">Teléfono:</span> <span class="info-val-mono">${customerPhone}</span></div>
            <div class="info-row"><span class="info-label">Pago:</span> <span class="info-val">${maskedPaymentMethod}</span></div>
          </div>
        </td>
        <td>
          <div class="info-card">
            <div class="card-title">📦 Dirección de Envío (Packing)</div>
            <div class="info-row"><span class="info-label">Entrega:</span> <span class="info-val">${fullAddressDisplay}</span></div>
            <div class="info-row"><span class="info-label">Estado:</span> <span class="info-val" style="color: #047857; text-transform: uppercase;">${order.status}</span></div>
            ${order.trackingNumber ? `<div class="info-row"><span class="info-label">Tracking:</span> <span class="info-val-mono">${order.trackingNumber}</span></div>` : ""}
          </div>
        </td>
      </tr>
    </table>

    <!-- Tabla de Productos -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Descripción del Producto</th>
          <th class="text-center">Cant.</th>
          <th class="text-right">Precio Unit.</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item: any) => `
          <tr>
            <td class="font-bold">${item.product?.title || "Accesorio GOSU® TCG"} ${item.product?.sku ? `<span style="font-size:10px; color:#64748b; font-family:monospace;">[SKU: ${item.product.sku}]</span>` : ""}</td>
            <td class="text-center font-mono">${item.quantity}</td>
            <td class="text-right font-mono">${currencySymbol} ${Number(item.unitPrice).toFixed(2)} ${currencyCode}</td>
            <td class="text-right font-mono font-bold">${currencySymbol} ${Number(item.totalPrice).toFixed(2)} ${currencyCode}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <!-- Totales Desglosados -->
    <div class="totals-wrapper">
      <table class="totals-table">
        <tr>
          <td>Subtotal:</td>
          <td class="text-right font-mono font-bold">${currencySymbol} ${subtotalAmount.toFixed(2)} ${currencyCode}</td>
        </tr>
        ${
          discountAmount > 0
            ? `<tr>
          <td style="color: #e11d48;">Descuento:</td>
          <td class="text-right font-mono font-bold" style="color: #e11d48;">-${currencySymbol} ${discountAmount.toFixed(2)} ${currencyCode}</td>
        </tr>`
            : ""
        }
        <tr>
          <td>Envío:</td>
          <td class="text-right font-mono font-bold">${shippingAmount === 0 ? "GRATIS" : `${currencySymbol} ${shippingAmount.toFixed(2)} ${currencyCode}`}</td>
        </tr>
        <tr class="total-grand">
          <td>TOTAL:</td>
          <td class="text-right font-mono">${currencySymbol} ${totalAmount.toFixed(2)} ${currencyCode}</td>
        </tr>
      </table>
    </div>

    <!-- Banner Dinámico GOSU Loyalty -->
    <div class="loyalty-banner">
      <div class="loyalty-text">✨ GOSU Loyalty: ¡Has ganado +${pointsEarned} puntos con esta compra!</div>
    </div>

    <!-- Pie del Documento -->
    <div class="footer">
      <p>Gracias por tu compra en GOSU® TCG Gear • Conserva este comprobante Packing Slip para tu garantía.</p>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Error generando PDF/Packing Slip:", error);
    return NextResponse.json({ error: "Error al generar comprobante PDF." }, { status: 500 });
  }
}
