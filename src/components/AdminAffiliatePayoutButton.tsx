"use client";

import React, { useState } from "react";
import { CreditCard, DollarSign } from "lucide-react";
import { AffiliatePayoutModal } from "@/components/AffiliatePayoutModal";

interface PayoutButtonProps {
  discountCodeId: string;
  creatorName: string;
  creatorEmail?: string;
  commPEN: number;
  commUSD: number;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
}

export function AdminAffiliatePayoutButton({
  discountCodeId,
  creatorName,
  creatorEmail,
  commPEN,
  commUSD,
  bankName,
  accountNumber,
  accountName,
}: PayoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasCommission = commPEN > 0 || commUSD > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
      >
        <CreditCard className="w-4 h-4" />
        <span>+ LIQUIDAR COMISIONES</span>
      </button>

      <AffiliatePayoutModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        discountCodeId={discountCodeId}
        creatorName={creatorName}
        creatorEmail={creatorEmail}
        commPEN={commPEN}
        commUSD={commUSD}
        bankName={bankName}
        accountNumber={accountNumber}
        accountName={accountName}
      />
    </>
  );
}
