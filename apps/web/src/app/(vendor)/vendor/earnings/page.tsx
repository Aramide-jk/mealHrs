import { EarningsView } from "@/features/vendor/insights/vendor-insights";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function EarningsPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return (
    <EarningsView
      earnings={result.data.earnings}
      transactions={result.data.transactions}
      payoutAccount={result.data.payoutAccount}
    />
  );
}
