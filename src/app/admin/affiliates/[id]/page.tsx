import { redirect } from "next/navigation";

export default function AdminAffiliateDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/dashboard/affiliates/${params.id}`);
}
