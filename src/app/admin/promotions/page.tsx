import { redirect } from "next/navigation";

export default function AdminPromotionsRedirect() {
  redirect("/dashboard/promotions");
}
