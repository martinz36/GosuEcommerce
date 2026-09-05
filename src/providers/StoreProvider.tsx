"use client";

import React, { createContext, useContext } from "react";

export interface RegionalShippingMethod {
  id: string;
  name: string;
  cost: number;
  freeShippingThreshold?: number | null;
  isPickup?: boolean;
  pickupAddress?: string | null;
  pickupSchedule?: string | null;
  targetZones?: any;
}

export interface StoreSettingsContextType {
  freeShippingThreshold: number;
  standardShippingCost: number;
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
  countryCode: string;
  isRegionActive: boolean;
  shippingMethods: RegionalShippingMethod[];
  formatPrice: (usdAmount: number) => string;
  formatRawPrice: (amount: number) => string;
}

const defaultContext: StoreSettingsContextType = {
  freeShippingThreshold: 50.0,
  standardShippingCost: 4.99,
  currency: "USD",
  currencySymbol: "$",
  exchangeRate: 1.0,
  countryCode: "US",
  isRegionActive: true,
  shippingMethods: [],
  formatPrice: (usdAmount: number) => `$${usdAmount.toFixed(2)}`,
  formatRawPrice: (amount: number) => `$${amount.toFixed(2)}`,
};

const StoreSettingsContext = createContext<StoreSettingsContextType>(defaultContext);

export function StoreProvider({
  settings,
  children,
}: {
  settings: Omit<StoreSettingsContextType, "formatPrice" | "formatRawPrice">;
  children: React.ReactNode;
}) {
  const formatPrice = (usdAmount: number) => {
    const converted = usdAmount * settings.exchangeRate;
    return `${settings.currencySymbol}${converted.toFixed(2)}`;
  };

  const formatRawPrice = (amount: number) => {
    return `${settings.currencySymbol}${amount.toFixed(2)}`;
  };

  const contextValue: StoreSettingsContextType = {
    ...settings,
    formatPrice,
    formatRawPrice,
  };

  return (
    <StoreSettingsContext.Provider value={contextValue}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
