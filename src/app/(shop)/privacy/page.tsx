import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, Server } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | GOSU® TCG",
  description: "Política de privacidad y protección de datos personales de GOSU® TCG.",
};

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>PROTECCIÓN DE DATOS GOSU®</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">
            Política de Privacidad
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Última actualización: Septiembre 2026
          </p>
        </div>

        {/* Contenido */}
        <div className="space-y-8 text-sm text-neutral-300 leading-relaxed">
          <section className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Lock className="w-5 h-5 text-accent-cyan" />
              1. Identificación del Responsable del Tratamiento
            </h2>
            <p>
              GOSU® TCG Gear (&quot;GOSU&quot;) es el responsable del tratamiento de los datos personales recopilados a través de esta plataforma de comercio electrónico. Nos comprometemos con la seguridad, transparencia y privacidad de la información personal de nuestros clientes y usuarios.
            </p>
          </section>

          <section className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Eye className="w-5 h-5 text-accent-pink" />
              2. Datos Recopilados
            </h2>
            <p>
              Recopilamos la siguiente información personal cuando interactúas con nuestra tienda, te registras, compras productos o usas el inicio de sesión con redes sociales (Google OAuth):
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400 font-mono">
              <li><strong>Datos de Identificación:</strong> Nombre, apellidos, correo electrónico y foto de perfil (proporcionados al iniciar sesión con Google o crear cuenta).</li>
              <li><strong>Datos de Entrega y Envío:</strong> Dirección de entrega, departamento, provincia, código postal y teléfono de contacto.</li>
              <li><strong>Datos de Transacción:</strong> Historial de pedidos, productos adquiridos, puntos de fidelidad acumulados (Programa GOSU® Loyalty).</li>
              <li><strong>Datos Técnicos:</strong> Dirección IP, tipo de navegador e interacción en el sitio web (cookies estrictamente necesarias).</li>
            </ul>
          </section>

          <section className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Server className="w-5 h-5 text-purple-400" />
              3. Finalidad del Tratamiento de Datos
            </h2>
            <p>Tus datos son utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400 font-mono">
              <li>Procesar, despachar y entregar tus pedidos de accesorios TCG.</li>
              <li>Gestionar tu cuenta de usuario y acumular Puntos de Fidelidad (GOSU® Loyalty).</li>
              <li>Procesar cobros seguros mediante nuestro proveedor oficial de pagos Stripe®.</li>
              <li>Enviarte notificaciones electrónicas sobre el estado de tus compras o soporte al cliente.</li>
            </ul>
          </section>

          <section className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase">
              <FileText className="w-5 h-5 text-accent-cyan" />
              4. Uso de Google OAuth 2.0
            </h2>
            <p>
              Al utilizar el inicio de sesión único (Single Sign-On) con Google, únicamente solicitamos acceso a tu información de perfil pública básica (`email`, `profile` y `openid`). No accedemos a tus contactos, correos personales en Gmail ni a ningún otro servicio privado de tu cuenta de Google.
            </p>
          </section>

          <section className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              5. Derechos ARCO y Contacto
            </h2>
            <p>
              Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales en cualquier momento. Para ejercer tus derechos o solicitar la eliminación total de tu cuenta, puedes contactarnos a través de nuestro correo oficial de soporte: <strong className="text-accent-cyan">soporte@gosu.com</strong>.
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
