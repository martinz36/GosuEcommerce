"use client";

import React, { createContext, useContext } from "react";

export interface StoreSettingsContextType {
  freeShippingThreshold: number;
  standardShippingCost: number;
  currency: string;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  freeShippingThreshold: 50.00,
  standardShippingCost: 4.99,
  currency: "USD",
});

export function StoreProvider({
  settings,
  children,
}: {
  settings: StoreSettingsContextType;
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
