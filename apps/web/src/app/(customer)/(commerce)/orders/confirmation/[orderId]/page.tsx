import { asOrderId } from "@mealhrs/domain";
import { notFound } from "next/navigation";
import { ConfirmationView } from "@/features/orders/confirmation-view";
import { repositories } from "@/lib/repositories";

export default async function ConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const result = await repositories.commerce.getOrder(asOrderId(orderId));
  if (!result.ok) notFound();
  return <ConfirmationView order={result.data} />;
}
