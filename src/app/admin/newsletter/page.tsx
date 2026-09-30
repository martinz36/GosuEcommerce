import { redirect } from "next/navigation";

export default function AdminNewsletterRedirectPage() {
  redirect("/dashboard/newsletter");
}
