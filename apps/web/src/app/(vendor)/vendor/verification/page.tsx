import { VendorVerificationView } from "@/features/vendor/insights/vendor-verification-view";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function VendorVerificationPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return (
    <VendorVerificationView
      verification={result.data.verification}
      payoutAccount={result.data.payoutAccount}
    />
  );
}
