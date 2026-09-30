import { redirect } from "next/navigation";

export default function AdminAffiliatesRedirect() {
  redirect("/dashboard/affiliates");
}
