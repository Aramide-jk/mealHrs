import { asOrderId } from "@mealhrs/domain";
import { notFound } from "next/navigation";
import { ReviewView } from "@/features/reviews/review-view";
import { repositories } from "@/lib/repositories";

export default async function ReviewPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const result = await repositories.commerce.getOrder(asOrderId(orderId));
  if (!result.ok || result.data.paymentStatus !== "paid" || result.data.fulfillmentStatus !== "delivered") notFound();
  return <ReviewView order={result.data} />;
}
