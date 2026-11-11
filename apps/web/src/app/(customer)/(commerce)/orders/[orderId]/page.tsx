import { asOrderId } from "@mealhrs/domain";
import { notFound } from "next/navigation";
import { OrderDetailView } from "@/features/orders/order-detail-view";
import { repositories } from "@/lib/repositories";
export default async function OrderPage({params}:{params:Promise<{orderId:string}>}){const {orderId}=await params;const result=await repositories.commerce.getOrder(asOrderId(orderId));if(!result.ok)notFound();return <OrderDetailView order={result.data}/>}
