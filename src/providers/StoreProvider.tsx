"use client";

import React, { createContext, useContext } from "react";

export interface StoreSettingsContextType {
  freeShippingThreshold: number;
  standardShippingCost: number;
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
  countryCode: string;
  formatPrice: (usdAmount: number) => string;
}

const defaultContext: StoreSettingsContextType = {
  freeShippingThreshold: 50.0,
  standardShippingCost: 4.99,
  currency: "USD",
  currencySymbol: "$",
  exchangeRate: 1.0,
  countryCode: "US",
  formatPrice: (usdAmount: number) => `$${usdAmount.toFixed(2)}`,
};

const StoreSettingsContext = createContext<StoreSettingsContextType>(defaultContext);

export function StoreProvider({
  settings,
  children,
}: {
  settings: Omit<StoreSettingsContextType, "formatPrice">;
  children: React.ReactNode;
}) {
  const formatPrice = (usdAmount: number) => {
    const converted = usdAmount * settings.exchangeRate;
    return `${settings.currencySymbol}${converted.toFixed(2)}`;
  };

  const contextValue: StoreSettingsContextType = {
    ...settings,
    formatPrice,
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
