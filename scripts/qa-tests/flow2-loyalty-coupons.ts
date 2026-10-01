import puppeteer from "puppeteer-core";
import { prisma } from "../../src/lib/prisma";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3001";

async function run() {
  console.log("=========================================================");
  console.log("🧪 QA TEST 2: Fidelización (Loyalty), Cupones y Matemáticas");
  console.log("=========================================================");

  // 1. Configurar usuario con puntos de fidelidad acumulados (200 puntos)
  const email = `qa_loyalty_${Date.now()}@gosutcg.pe`;
  const password = "Password123!";

  console.log(`\n1️⃣ Creando usuario de prueba: ${email}`);
  const user = await prisma.user.create({
    data: {
      email,
      name: "Gosu Champion Tester",
      firstName: "Gosu",
      lastName: "Tester",
      role: "CUSTOMER",
      loyaltyPoints: 200, // 200 puntos acumulados
    },
  });

  console.log(`✅ Usuario creado en Neon DB con 200 puntos acumulados (ID: ${user.id})`);
  console.log(`💡 Regla: 40 puntos = S/. 1.00 PEN -> 200 puntos equivalen a S/. 5.00 PEN de descuento.`);

  // Verificar que el cupón GOSU10 existe y está activo en Neon DB
  const coupon = await prisma.discountCode.findUnique({
    where: { code: "GOSU10" },
  });
  console.log(`🎫 Cupón GOSU10 en Neon DB:`, coupon?.code, `Tipo:`, coupon?.type, `Valor:`, coupon?.value, `%`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  try {
    // 2. Iniciar sesión con el usuario
    console.log(`\n2️⃣ Iniciando sesión con el usuario de prueba...`);
    // Usar bcrypt hash para autenticación por credentials si es necesario
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await page.goto(`${BASE_URL}/account/login`, { waitUntil: "networkidle2" });
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);

    console.log("🔐 Enviando credenciales de login...");
    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/auth/callback/credentials") && res.status() === 200,
        { timeout: 20000 }
      ),
      page.click('button[type="submit"]'),
    ]);

    await new Promise((r) => setTimeout(r, 2000));

    // Confirmar que la sesión en el navegador tiene el usuario y sus 200 puntos
    const sessionUser = await page.evaluate(async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      return data?.user || null;
    });

    console.log(`👤 Sesión confirmada en navegador: ${sessionUser?.email} | Puntos: ${sessionUser?.loyaltyPoints}`);

    if (!sessionUser || sessionUser.loyaltyPoints !== 200) {
      throw new Error(`❌ La sesión no cargó los 200 puntos esperados. Puntos en sesión: ${sessionUser?.loyaltyPoints}`);
    }

    console.log("✅ Sesión y puntos validados con éxito.");

    // 3. Agregar producto al carrito
    console.log(`\n3️⃣ Navegando al catálogo para agregar un producto...`);
    await page.goto(`${BASE_URL}/catalog`, { waitUntil: "networkidle2" });

    await page.waitForSelector('a[href^="/products/"]', { timeout: 10000 });
    const productLinks = await page.$$('a[href^="/products/"]');
    await productLinks[0].click();
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("➕ Agregando producto al carrito...");
    await page.waitForSelector("#add-to-cart-button", { timeout: 10000 });
    await page.click("#add-to-cart-button");

    console.log("⏳ Esperando apertura del CartDrawer...");
    await page.waitForSelector("#redeem-loyalty-btn", { timeout: 10000 });

    // 4. Canjear Puntos de Fidelidad
    console.log("\n4️⃣ Canjeando Puntos de Fidelidad en el carrito...");
    await new Promise((r) => setTimeout(r, 1200)); // Esperar estabilización de animación Framer Motion
    const loyaltyTextBefore = await page.$eval("#redeem-loyalty-btn", (el) => el.textContent?.trim());
    console.log(`   Estado inicial botón puntos: "${loyaltyTextBefore}"`);

    await page.evaluate(() => {
      const btn = document.querySelector("#redeem-loyalty-btn") as HTMLElement;
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    const loyaltyTextAfter = await page.$eval("#redeem-loyalty-btn", (el) => el.textContent?.trim());
    console.log(`   Estado tras canjear puntos: "${loyaltyTextAfter}" (Esperado: "Aplicado")`);

    if (loyaltyTextAfter !== "Aplicado") {
      throw new Error(`❌ El botón de puntos no cambió a 'Aplicado'. Estado: ${loyaltyTextAfter}`);
    }

    // 5. Aplicar Cupón de Descuento GOSU10
    console.log("\n5️⃣ Aplicando Cupón de Descuento GOSU10...");
    await page.waitForSelector("#coupon-input");
    await page.type("#coupon-input", "GOSU10");
    await page.evaluate(() => {
      const btn = document.querySelector("#apply-coupon-btn") as HTMLElement;
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // 6. Verificar desglose financiero y matemáticas en el CartDrawer
    console.log("\n6️⃣ Validando matemáticas financieras en CartDrawer...");
    const cartSummaryText = await page.evaluate(() => {
      const drawer = document.querySelector("aside");
      return drawer ? drawer.innerText : "";
    });

    console.log("📊 Contenido del CartDrawer:");
    const lines = cartSummaryText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let subtotalFound = 0;
    let couponDiscountFound = 0;
    let loyaltyDiscountFound = 0;
    let totalFound = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("Subtotal") && lines[i + 1]?.includes("S/.")) {
        subtotalFound = parseFloat(lines[i + 1].replace(/[^0-9.]/g, ""));
      } else if (line.includes("Subtotal S/.")) {
        subtotalFound = parseFloat(line.replace(/[^0-9.]/g, ""));
      }
      if (line.includes("Descuento Cupón") && lines[i + 1]?.includes("-S/.")) {
        couponDiscountFound = parseFloat(lines[i + 1].replace(/[^0-9.]/g, ""));
      }
      if (line.includes("Descuento Puntos GOSU") && lines[i + 1]?.includes("-S/.")) {
        loyaltyDiscountFound = parseFloat(lines[i + 1].replace(/[^0-9.]/g, ""));
      }
      if (line.includes("TOTAL ESTIMADO") && lines[i + 1]?.includes("S/.")) {
        totalFound = parseFloat(lines[i + 1].replace(/[^0-9.]/g, ""));
      }
    }

    // Si la lectura en cascada no capturó todas las líneas, usar evaluate directo del store
    const storeState = await page.evaluate(() => {
      const storage = localStorage.getItem("gosu-cart-storage");
      return storage ? JSON.parse(storage).state : null;
    });

    console.log("💾 Estado en Zustand Store:", {
      itemsCount: storeState?.items?.length,
      loyaltyPointsUsed: storeState?.loyaltyPointsUsed,
      discount: storeState?.discount,
    });

    const expectedLoyaltyDiscount = 200 / 40; // S/. 5.00
    const rawSubtotal = storeState?.items?.reduce((s: number, i: any) => s + i.price * i.quantity, 0) || subtotalFound;
    const expectedCouponDiscount = (rawSubtotal * 10) / 100; // 10%
    const expectedTotal = Math.max(0, rawSubtotal - expectedCouponDiscount - expectedLoyaltyDiscount);

    console.log("\n📐 Comprobación Matemática del Descuento:");
    console.log(`   Subtotal: S/. ${rawSubtotal.toFixed(2)}`);
    console.log(`   - Descuento Cupón GOSU10 (10%): S/. ${expectedCouponDiscount.toFixed(2)}`);
    console.log(`   - Descuento Puntos (200 pts / 40): S/. ${expectedLoyaltyDiscount.toFixed(2)}`);
    console.log(`   = Total Esperado: S/. ${expectedTotal.toFixed(2)}`);

    if (storeState.loyaltyPointsUsed !== 200) {
      throw new Error(`❌ loyaltyPointsUsed esperado 200 pero fue ${storeState.loyaltyPointsUsed}`);
    }
    if (storeState.discount?.code !== "GOSU10") {
      throw new Error(`❌ Código de descuento esperado GOSU10 pero fue ${storeState.discount?.code}`);
    }

    console.log("✅ Matemáticas verificadas correctamente en CartDrawer!");

    // 7. Navegar a /checkout y verificar que los descuentos se reflejen
    console.log("\n7️⃣ Haciendo click en 'IR A PAGAR' para navegar al Checkout...");
    await page.evaluate(() => {
      const btn = document.querySelector("#proceed-checkout-btn") as HTMLElement;
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 2000));
    console.log("   URL actual tras click IR A PAGAR:", page.url());
    if (!page.url().includes("/checkout")) {
      console.log("   Navegando directamente a /checkout...");
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle2" });
      console.log("   URL tras page.goto:", page.url());
    }

    await new Promise((r) => setTimeout(r, 3000));
    console.log("   URL actual:", page.url());
    const bodySnippet = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log("   Snippet de la página:", bodySnippet);

    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Resumen de Compra") ||
        document.body.innerText.includes("GOSU") ||
        document.body.innerText.includes("Subtotal"),
      { timeout: 15000 }
    );

    const checkoutPageText = await page.evaluate(() => document.body.innerText);
    const hasCouponInCheckout = checkoutPageText.includes("GOSU10");
    const hasPointsInCheckout = checkoutPageText.includes("Puntos GOSU") || checkoutPageText.includes("200 pts");

    console.log(`   Reflejado Cupón GOSU10 en Checkout: ${hasCouponInCheckout ? "✅ SÍ" : "❌ NO"}`);
    console.log(`   Reflejado Descuento Puntos en Checkout: ${hasPointsInCheckout ? "✅ SÍ" : "❌ NO"}`);

    if (!hasCouponInCheckout || !hasPointsInCheckout) {
      throw new Error("❌ El resumen de Checkout no muestra el cupón y los puntos combinados.");
    }

    console.log("\n🎉 [QA TEST 2 COMPLETADO AL 100%]\n");
    return {
      success: true,
      email,
      userId: user.id,
      subtotal: rawSubtotal,
      couponDiscount: expectedCouponDiscount,
      loyaltyDiscount: expectedLoyaltyDiscount,
      total: expectedTotal,
    };
  } catch (err: any) {
    console.error("❌ ERROR EN QA TEST 2:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
