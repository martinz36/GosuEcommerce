"use client";

import React, { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { sendAbandonedCartReminderAction } from "./actions";

interface SendCartReminderButtonProps {
  cartSessionId: string;
  userEmail?: string | null;
}

export function SendCartReminderButton({ cartSessionId, userEmail }: SendCartReminderButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSend = async () => {
    if (!userEmail || isSending) return;

    setIsSending(true);
    setStatus("idle");
    setErrorMessage(null);

    const res = await sendAbandonedCartReminderAction(cartSessionId);

    if (res.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(res.error || "Error al enviar.");
    }

    setIsSending(false);
  };

  if (!userEmail) {
    return (
      <span className="px-3 py-1.5 rounded bg-slate-100 text-slate-400 text-xs font-mono inline-block">
        Sin Email
      </span>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "success" && (
        <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Enviado por Resend
        </span>
      )}

      {status === "error" && (
        <span className="text-[11px] font-mono text-rose-600 flex items-center gap-1" title={errorMessage || ""}>
          <AlertCircle className="w-3.5 h-3.5" />
          Falló
        </span>
      )}

      {status === "idle" && (
        <button
          onClick={handleSend}
          disabled={isSending}
          className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium font-mono transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          {isSending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Enviar Vía Resend</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
