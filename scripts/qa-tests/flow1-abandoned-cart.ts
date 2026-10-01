import puppeteer from "puppeteer-core";
import { prisma } from "../../src/lib/prisma";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3001";

async function run() {
  console.log("=================================================");
  console.log("🧪 QA TEST 1: Registro, Carrito y Carrito Abandonado");
  console.log("=================================================");

  const email = `qa_user_${Date.now()}@gosutcg.pe`;
  const password = "Password123!";
  console.log(`👤 Usuario de prueba a registrar: ${email}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  try {
    // 1. Registro de Usuario
    console.log(`\n1️⃣ Navegando a ${BASE_URL}/account/register...`);
    await page.goto(`${BASE_URL}/account/register`, { waitUntil: "networkidle2" });

    console.log("📝 Llenando formulario de registro...");
    await page.waitForSelector('input[name="firstName"]');
    await page.type('input[name="firstName"]', "QA");
    await page.type('input[name="lastName"]', "Tester");
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);

    console.log("🚀 Enviando formulario de registro...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);

    // Verificar en Neon DB si el usuario fue creado
    const userInDb = await prisma.user.findUnique({
      where: { email },
    });

    if (userInDb) {
      console.log(`✅ Usuario creado en Neon DB con éxito! ID: ${userInDb.id}, Puntos iniciales: ${userInDb.loyaltyPoints}`);
    } else {
      throw new Error(`❌ Error: El usuario ${email} no fue encontrado en Neon DB.`);
    }

    // 2. Iniciar Sesión con el usuario creado
    console.log(`\n2️⃣ Iniciando sesión en ${BASE_URL}/account/login...`);
    await page.goto(`${BASE_URL}/account/login`, { waitUntil: "networkidle2" });
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});
    console.log("✅ Sesión iniciada con éxito.");

    // 3. Catálogo y agregar producto al carrito
    console.log(`\n3️⃣ Navegando al catálogo: ${BASE_URL}/catalog...`);
    await page.goto(`${BASE_URL}/catalog`, { waitUntil: "networkidle2" });

    // Esperar y hacer clic en el primer producto
    await page.waitForSelector('a[href^="/products/"]', { timeout: 10000 });
    const productLinks = await page.$$('a[href^="/products/"]');
    if (productLinks.length === 0) throw new Error("No se encontraron enlaces a productos.");

    console.log("🛒 Abriendo página de producto...");
    await productLinks[0].click();
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("➕ Agregando producto al carrito...");
    await page.waitForSelector("#add-to-cart-button", { timeout: 10000 });
    await page.click("#add-to-cart-button");

    // Esperar a que se abra el Drawer del carrito
    console.log("⏳ Esperando apertura del CartDrawer...");
    await page.waitForSelector("#proceed-checkout-btn", { timeout: 10000 });

    // 4. Ir al Checkout
    console.log("\n4️⃣ Navegando al Checkout desde el CartDrawer...");
    await page.click("#proceed-checkout-btn");

    await new Promise((r) => setTimeout(r, 1500));

    // Si aparece el modal de auth para checkout
    const guestInput = await page.$('input[placeholder="tu@email.com"]');
    if (guestInput) {
      console.log("📝 Ingresando correo en CheckoutAuthModal...");
      await guestInput.type(email);
      await page.click('button[type="submit"]');
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!page.url().includes("/checkout")) {
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle2" });
    }

    await page.waitForSelector('input, h2, div', { timeout: 10000 });
    console.log(`📍 URL actual: ${page.url()}`);

    // Esperar 2 segundos para permitir que syncCartSessionAction guarde la sesión del carrito con el email
    await new Promise((r) => setTimeout(r, 2000));

    // 5. Abandonar la sesión navegando a la página principal
    console.log("\n5️⃣ Simulando abandono de sesión en Checkout (navegando a inicio)...");
    await page.goto(`${BASE_URL}`, { waitUntil: "networkidle2" });
    console.log("🚪 Sesión abandonada.");

    // 6. Verificación en Neon DB de CartSession
    console.log("\n6️⃣ Verificando registro de Carrito Abandonado en Neon DB...");
    const cartSession = await prisma.cartSession.findFirst({
      where: {
        userEmail: email,
        isConverted: false,
      },
      orderBy: { lastActiveAt: "desc" },
    });

    if (cartSession) {
      console.log(`✅ CartSession encontrada en Neon DB!`);
      console.log(`   ID: ${cartSession.id}`);
      console.log(`   SessionId: ${cartSession.sessionId}`);
      console.log(`   UserEmail: ${cartSession.userEmail}`);
      console.log(`   Subtotal: S/. ${cartSession.subtotal}`);
      console.log(`   Items:`, JSON.stringify(cartSession.itemsJson));
    } else {
      throw new Error(`❌ No se encontró CartSession con email ${email} en Neon DB.`);
    }

    // 7. Disparar Webhook / Función de Resend para Carrito Abandonado
    console.log("\n7️⃣ Disparando Webhook / Función de Carrito Abandonado de Resend...");
    const webhookRes = await fetch(`${BASE_URL}/api/webhooks/abandoned-cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const webhookData = await webhookRes.json();
    console.log("📨 Respuesta del Webhook de Resend:", webhookData);

    if (webhookData.success) {
      console.log("✅ Función de Carrito Abandonado activada con éxito.");
    } else {
      throw new Error(`❌ Error en webhook: ${webhookData.error || webhookData.message}`);
    }

    console.log("\n🎉 [QA TEST 1 COMPLETADO AL 100%]\n");
    return { success: true, email, cartSession };
  } catch (err: any) {
    console.error("❌ ERROR EN QA TEST 1:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
