import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, ShieldAlert, ShoppingBag, RefreshCw, Award } from "lucide-react";

export const metadata = {
  title: "Términos del Servicio | GOSU® TCG",
  description: "Términos y condiciones de uso y compra en GOSU® TCG.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-white font-body py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Botón de Retorno */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-accent-cyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Encabezado */}
        <div className="border-b border-neutral-800 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs font-mono">
            <FileText className="w-4 h-4" />
            <span>TÉRMINOS Y CONDICIONES GOSU®</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">
            Términos del Servicio
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Última actualización: Septiembre 2026
          </p>
        </div>

        {/* Contenido */}
        <div className="space-y-8 text-sm text-neutral-300 leading-relaxed">
          <section className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase">
              <ShoppingBag className="w-5 h-5 text-accent-cyan" />
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar este sitio web o realizar compras en GOSU® TCG, el usuario acepta de manera plena y sin reservas todos los términos y condiciones aquí estipulados. Si no estás de acuerdo con estos términos, debes abstenerte de hacer uso de la plataforma.
            </p>
          </section>

          <section className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase">
              <ShieldAlert className="w-5 h-5 text-accent-pink" />
              2. Compras, Precios y Métodos de Pago
            </h2>
            <p>
              Todos los precios exhibidos en el catálogo están expresados en Soles (PEN) y/o Dólares Estadounidenses (USD) según la región seleccionada. Los pagos son procesados de forma segura a través de nuestra pasarela de pagos integrada Stripe®. Nos reservamos el derecho de cancelar pedidos en caso de inconsistencias detectadas en la transacción.
            </p>
          </section>

          <section className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase">
              <RefreshCw className="w-5 h-5 text-purple-400" />
              3. Envíos y Entregas
            </h2>
            <p>
              Los despachos se realizan a nivel nacional e internacional a través de agencias de transporte asociadas o modalidades de recojo en tienda. Los tiempos estimados de entrega son informados durante el Checkout.
            </p>
          </section>

          <section className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Award className="w-5 h-5 text-amber-400" />
              4. Programa GOSU® Loyalty & Cuentas de Usuario
            </h2>
            <p>
              Los puntos acumulados en el Programa de Fidelidad no son transferibles ni canjeables directamente por dinero en efectivo. Los usuarios son responsables de mantener la confidencialidad de sus credenciales de acceso. El uso ilegítimo de cuentas o cupones de descuento dará lugar a la suspensión de la cuenta.
            </p>
          </section>
        </div>

        {/* Footer legal */}
        <div className="pt-6 border-t border-neutral-900 text-center text-xs text-neutral-500 font-mono">
          &copy; {new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
