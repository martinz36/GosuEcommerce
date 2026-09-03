import type { Metadata } from "next";
import "./globals.css";
import { NextAuthProvider } from "@/providers/NextAuthProvider";

export const metadata: Metadata = {
  title: "GOSU® | Premium TCG Accessories for Players & Collectors",
  description: "Premium sleeves, binders, and TCG accessories designed to protect, optimize, and elevate your collection. Built for those who play different.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-black text-white selection:bg-accent-cyan selection:text-black">
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
