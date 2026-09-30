import { redirect } from "next/navigation";

export default function AdminOrdersCreateRedirect() {
  redirect("/dashboard/orders/create");
}
