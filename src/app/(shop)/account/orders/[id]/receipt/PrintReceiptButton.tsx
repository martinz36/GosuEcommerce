"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintReceiptButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-extrabold text-xs rounded-lg hover:bg-accent-cyan transition-colors shadow-lg"
    >
      <Printer className="w-4 h-4" />
      <span>Imprimir / Descargar Recibo</span>
    </button>
  );
}
