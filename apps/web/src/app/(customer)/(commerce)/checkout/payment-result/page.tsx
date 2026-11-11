import { PaymentResultView } from "@/features/payments/payment-result-view";

export default async function PaymentResultPage({ searchParams }: Readonly<{ searchParams: Promise<{ demo?: string }> }>) {
  const { demo } = await searchParams;
  return <PaymentResultView initialState={demo === "failed" ? "failed" : "pending"} />;
}
