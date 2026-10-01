import { prisma } from "../../src/lib/prisma";

const BASE_URL = "http://localhost:3001";

async function run() {
  console.log("=========================================================");
  console.log("🧪 QA TEST 4: Verificación Directa de Base de Datos (Neon DB)");
  console.log("=========================================================\n");

  try {
    // -------------------------------------------------------------
    // PRUEBA 4.1: Verificación de Cambio de Estatus en Neon DB
    // -------------------------------------------------------------
    console.log("1️⃣ Verificando que el cambio de estatus de orden se refleje en Neon DB...");
    const shippedOrder = await prisma.order.findFirst({
      where: { status: "SHIPPED" },
      orderBy: { updatedAt: "desc" },
      include: { user: true },
    });

    if (!shippedOrder) {
      throw new Error("❌ No se encontró ninguna orden con estatus SHIPPED en Neon DB.");
    }

    console.log(`✅ Orden verificada en Neon DB:
       ID: ${shippedOrder.id}
       Nº Orden: ${shippedOrder.orderNumber}
       Cliente: ${shippedOrder.user?.name || shippedOrder.guestEmail}
       Estatus en BD: "${shippedOrder.status}" (Esperado: "SHIPPED")
       Última actualización: ${shippedOrder.updatedAt.toISOString()}
    `);

    // -------------------------------------------------------------
    // PRUEBA 4.2 y 4.3: Compra con Cupón y Canje de Puntos de Fidelidad
    // -------------------------------------------------------------
    console.log("2️⃣ Creando usuario para simular compra con canje de puntos y cupón...");
    const testEmail = `qa_db_verify_${Date.now()}@gosutcg.pe`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "QA DB Tester",
        role: "CUSTOMER",
        loyaltyPoints: 200, // 200 puntos acumulados
      },
    });

    console.log(`   Usuario creado: ${user.email} con ${user.loyaltyPoints} puntos.`);

    const couponBefore = await prisma.discountCode.findUnique({
      where: { code: "GOSU10" },
    });

    if (!couponBefore) {
      throw new Error("❌ No se encontró el cupón GOSU10 en Neon DB.");
    }

    const previousUsageCount = couponBefore.usageCount;
    console.log(`   Cupón GOSU10 - Contador de uso previo en BD: ${previousUsageCount}`);

    // Simular el evento de pago completado vía Stripe Webhook
    console.log("\n3️⃣ Simulando evento checkout.session.completed con 200 puntos y cupón GOSU10...");
    const mockSessionId = `cs_test_qa_${Date.now()}`;
    const mockPaymentIntentId = `pi_test_qa_${Date.now()}`;

    const sampleProduct = await prisma.product.findFirst({
      where: { isActive: true },
    });

    if (!sampleProduct) {
      throw new Error("❌ No hay productos activos en la base de datos.");
    }

    const webhookPayload = {
      id: `evt_test_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: mockSessionId,
          payment_intent: mockPaymentIntentId,
          payment_status: "paid",
          currency: "pen",
          amount_subtotal: 6500, // S/. 65.00
          amount_total: 5350, // S/. 53.50 (S/. 65 - S/. 6.50 cupón - S/. 5.00 puntos)
          customer_details: { email: user.email },
          shipping_details: {
            name: "QA DB Tester",
            address: {
              line1: "Av. Conquistadores 123",
              city: "Lima",
              country: "PE",
              postal_code: "15001",
            },
          },
          metadata: {
            userId: user.id,
            userEmail: user.email,
            discountCode: "GOSU10",
            discountCodeId: couponBefore.id,
            loyaltyPointsUsed: "200",
            currency: "pen",
            itemsJson: JSON.stringify([
              {
                productId: sampleProduct.id,
                quantity: 1,
                price: 65.0,
                title: sampleProduct.title,
              },
            ]),
          },
        },
      },
    };

    const webhookRes = await fetch(`${BASE_URL}/api/webhooks/stripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    const webhookData: any = await webhookRes.json().catch(() => ({}));
    console.log("   Respuesta del Webhook:", webhookRes.status, webhookData);

    if (!webhookRes.ok && !webhookData.received) {
      throw new Error(`❌ El Webhook de Stripe respondió con error: ${JSON.stringify(webhookData)}`);
    }

    await new Promise((r) => setTimeout(r, 2000));

    // -------------------------------------------------------------
    // VERIFICACIÓN 4.2: Puntos de Fidelidad Descontados en Neon DB
    // -------------------------------------------------------------
    console.log("\n4️⃣ Verificando descuento de Puntos de Fidelidad en Neon DB...");
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    console.log(`   Puntos del usuario antes de la compra: 200 pts`);
    console.log(`   Puntos del usuario tras la compra en Neon DB: ${updatedUser?.loyaltyPoints} pts`);

    // El motor además otorga puntos por el monto pagado (S/. 53.50 -> +53 pts)
    // Lo esencial es que los 200 puntos canjeados fueron debitados
    // (200 - 200 = 0 base + puntos ganados por la compra)
    if ((updatedUser?.loyaltyPoints || 0) >= 200) {
      throw new Error(`❌ Los puntos no fueron descontados correctamente. Puntos actuales: ${updatedUser?.loyaltyPoints}`);
    }
    console.log(`✅ Puntos de Fidelidad descontados exitosamente en Neon DB (Balance neto: ${updatedUser?.loyaltyPoints} pts).`);

    // -------------------------------------------------------------
    // VERIFICACIÓN 4.3: Registro de Uso de Cupón en Neon DB
    // -------------------------------------------------------------
    console.log("\n5️⃣ Verificando registro de uso de cupón en Neon DB...");
    const updatedCoupon = await prisma.discountCode.findUnique({
      where: { code: "GOSU10" },
    });

    console.log(`   usageCount previo: ${previousUsageCount}`);
    console.log(`   usageCount actual en Neon DB: ${updatedCoupon?.usageCount}`);

    if ((updatedCoupon?.usageCount || 0) !== previousUsageCount + 1) {
      throw new Error(`❌ usageCount de GOSU10 esperado ${previousUsageCount + 1} pero fue ${updatedCoupon?.usageCount}`);
    }
    console.log(`✅ Contador de uso del cupón incrementado (+1) correctamente en Neon DB.`);

    // -------------------------------------------------------------
    // VERIFICACIÓN 4.4: Asociación de Orden con Cupón y Descuento
    // -------------------------------------------------------------
    console.log("\n6️⃣ Verificando asociación de la orden creada en Neon DB...");
    const orderCreated = await prisma.order.findUnique({
      where: { stripeCheckoutSessionId: mockSessionId },
      include: { discountCode: true, items: true },
    });

    if (!orderCreated) {
      throw new Error("❌ No se encontró la orden generada en Neon DB.");
    }

    console.log(`✅ Orden creada en Neon DB:
       ID: ${orderCreated.id}
       Nº Orden: ${orderCreated.orderNumber}
       Total Pagado: S/. ${orderCreated.totalAmount}
       Código de Descuento Asociado: ${orderCreated.discountCode?.code} (ID: ${orderCreated.discountCodeId})
       Estatus de la Orden: ${orderCreated.status}
       Productos: ${orderCreated.items.length} ítem(s)
    `);

    if (orderCreated.discountCodeId !== couponBefore.id) {
      throw new Error("❌ La orden no quedó vinculada al ID del cupón de descuento.");
    }

    console.log("\n🎉 [QA TEST 4: TODAS LAS VERIFICACIONES EN NEON DB COMPLETADAS AL 100%]\n");
    return { success: true };
  } catch (err: any) {
    console.error("❌ ERROR EN QA TEST 4:", err);
    throw err;
  }
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
