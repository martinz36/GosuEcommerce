export interface ReceiptPdfData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  createdAt?: Date | string;
  items: Array<{ title: string; quantity: number; unitPrice: number }>;
  subtotal?: number;
  discountAmount?: number;
  shippingAmount?: number;
  totalAmount: number;
  currency?: string;
  shippingAddress?: any;
}

export function generateReceiptPdfBuffer(data: ReceiptPdfData): Buffer {
  const {
    orderId,
    customerName,
    customerEmail,
    items = [],
    totalAmount,
    currency = "S/.",
    shippingAddress,
    createdAt,
  } = data;

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" });

  const addressText = shippingAddress
    ? typeof shippingAddress === "string"
      ? shippingAddress
      : `${shippingAddress.street || shippingAddress.line1 || ""}, ${shippingAddress.city || ""}, ${shippingAddress.state || ""}`
    : "Recojo en Tienda / Envío registrado";

  const itemsText = items
    .map(
      (item) =>
        ` - ${item.title.substring(0, 45)}  x${item.quantity}  ${currency} ${(item.unitPrice * item.quantity).toFixed(2)}`
    )
    .join("\n");

  const pdfContent = `
============================================================
                   GOSU(R) TCG GEAR - RECIBO OFICIAL
============================================================

PEDIDO REGISTRADO: ${orderId}
FECHA DE COMPRA:   ${dateStr}

DATOS DEL CLIENTE:
------------------------------------------------------------
Nombre:  ${customerName}
Correo:  ${customerEmail}
Entrega: ${addressText}

DETALLE DEL PEDIDO:
------------------------------------------------------------
${itemsText}

------------------------------------------------------------
TOTAL PAGADO: ${currency} ${totalAmount.toFixed(2)}
============================================================
Gracias por tu compra en GOSU(R) TCG Gear.
Soporte: soporte@gosu.com | https://gosuecommerce.vercel.app
`;

  const streamContent = pdfContentToStream(pdfContent);
  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  const pdfBody = `1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj`;

  const pdfDocument = `%PDF-1.4\n${pdfBody}\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000315 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${pdfBody.length + 20}\n%%EOF`;

  return Buffer.from(pdfDocument, "utf-8");
}

function pdfContentToStream(text: string): string {
  const lines = text.trim().split("\n");
  let stream = "BT\n/F1 10 Tf\n14 TL\n50 740 Td\n";

  for (const line of lines) {
    const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    stream += `(${escaped}) '\n`;
  }

  stream += "ET";
  return stream;
}
