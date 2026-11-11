import { OnboardingView } from "@/features/vendor/onboarding/onboarding-view";
import { repositories } from "@/lib/repositories";

export default async function VendorOnboardingPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) return <div className="vendor-onboarding"><p>We couldn&apos;t load kitchen setup.</p></div>;
  return <OnboardingView snapshot={result.data}/>;
}
