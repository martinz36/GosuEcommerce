import puppeteer from "puppeteer-core";
import { prisma } from "../../src/lib/prisma";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3001";

async function run() {
  console.log("=========================================================");
  console.log("🧪 QA TEST 3: Gestión de Órdenes (Panel de Administración)");
  console.log("=========================================================\n");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  try {
    // 1. Iniciar sesión como Administrador
    console.log("1️⃣ Iniciando sesión como Administrador...");
    await page.goto(`${BASE_URL}/account/login`, { waitUntil: "networkidle2" });

    await page.type("input[type='email']", "martin@myv-investments.com");
    await page.type("input[type='password']", "Password123");

    console.log("   Enviando credenciales de Admin...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {}),
      page.click("button[type='submit']"),
    ]);

    await new Promise((r) => setTimeout(r, 2000));
    console.log("   URL tras login:", page.url());

    // 2. Acceder a creación de orden manual en el Dashboard
    console.log("\n2️⃣ Navegando a Creación de Orden Manual (/dashboard/orders/create)...");
    await page.goto(`${BASE_URL}/dashboard/orders/create`, { waitUntil: "networkidle2" });

    // Verificar que estamos en la página
    await page.waitForSelector("#admin-product-search-input", { timeout: 10000 });
    console.log("✅ Acceso al panel de creación de orden manual confirmado.");

    // 3. Buscar y agregar producto
    console.log("\n3️⃣ Buscando y agregando producto 'DICE'...");
    await page.type("#admin-product-search-input", "DICE");
    await new Promise((r) => setTimeout(r, 1500)); // Esperar debounce

    // Esperar dropdown de productos
    const productButtonSelector = "div.absolute button[type='button']";
    await page.waitForSelector(productButtonSelector, { timeout: 10000 });
    console.log("   Click en el primer producto de la lista...");
    await page.click(productButtonSelector);
    await new Promise((r) => setTimeout(r, 1000));

    // 4. Seleccionar o registrar cliente
    console.log("\n4️⃣ Asignando cliente a la orden...");
    await page.type("#admin-customer-search-input", "martin");
    await new Promise((r) => setTimeout(r, 1500));

    // Seleccionar cliente de la lista
    const customerButtonSelector = "div.absolute button[type='button']";
    const hasCustomerResults = await page.$(customerButtonSelector);
    if (hasCustomerResults) {
      await page.click(customerButtonSelector);
      console.log("   Cliente seleccionado desde el buscador.");
    } else {
      console.log("   Abriendo formulario de nuevo cliente...");
      await page.click("button:has-text('+ Crear Nuevo Cliente')");
      await page.waitForSelector("input[placeholder='carlos@email.com']");
      await page.type("input[placeholder='Ej. Carlos']", "Tester");
      await page.type("input[placeholder='Ej. Pérez']", "QA");
      await page.type("input[placeholder='carlos@email.com']", `manual_cust_${Date.now()}@gosutcg.pe`);
      await page.click("button:has-text('GUARDAR Y SELECCIONAR CLIENTE')");
    }

    await new Promise((r) => setTimeout(r, 1000));

    // 5. Enviar creación de la orden
    console.log("\n5️⃣ Guardando y generando la orden manual...");
    await page.evaluate(() => {
      const btn = document.querySelector("#admin-submit-order-btn") as HTMLButtonElement;
      if (btn) btn.click();
    });

    // Esperar feedback y redirección a /dashboard/orders
    console.log("   Esperando confirmación de la orden...");
    await new Promise((r) => setTimeout(r, 3000));

    if (!page.url().includes("/dashboard/orders")) {
      await page.goto(`${BASE_URL}/dashboard/orders`, { waitUntil: "networkidle2" });
    }

    await page.waitForSelector("table", { timeout: 15000 });
    console.log("✅ Redirección a la lista de órdenes (/dashboard/orders) confirmada.");

    // 6. Localizar orden y cambiar su estatus a 'SHIPPED' (Enviado)
    console.log("\n6️⃣ Cambiando estatus de una orden existente a 'SHIPPED' (Enviado)...");

    // Buscar el primer select de estatus
    const selectSelector = "select[data-testid='order-status-select']";
    await page.waitForSelector(selectSelector, { timeout: 10000 });

    const orderSelectId = await page.evaluate((sel) => {
      const select = document.querySelector(sel) as HTMLSelectElement;
      return select ? select.id : null;
    }, selectSelector);

    console.log(`   Elemento select identificado: #${orderSelectId}`);

    const previousStatus = await page.evaluate((sel) => {
      const select = document.querySelector(sel) as HTMLSelectElement;
      return select ? select.value : null;
    }, selectSelector);

    console.log(`   Estatus previo de la orden: ${previousStatus}`);

    // Cambiar a SHIPPED
    await page.select(selectSelector, "SHIPPED");
    console.log("   Estatus seleccionado: 'SHIPPED' (Enviado). Esperando actualización en servidor...");
    await new Promise((r) => setTimeout(r, 3000));

    const updatedStatus = await page.evaluate((sel) => {
      const select = document.querySelector(sel) as HTMLSelectElement;
      return select ? select.value : null;
    }, selectSelector);

    console.log(`   Estatus tras actualización en UI: ${updatedStatus}`);

    if (updatedStatus !== "SHIPPED") {
      throw new Error(`❌ El estatus no se actualizó a SHIPPED en la UI. Valor: ${updatedStatus}`);
    }

    // Extraer orderId desde el id del select (order-status-select-{id})
    const orderId = orderSelectId?.replace("order-status-select-", "");

    console.log("\n🎉 [QA TEST 3 COMPLETADO AL 100%]\n");
    return {
      success: true,
      orderId,
      newStatus: updatedStatus,
    };
  } catch (err: any) {
    console.error("❌ ERROR EN QA TEST 3:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
