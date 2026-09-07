import React from "react";
import { AdminLayoutClient } from "./AdminLayoutClient";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
