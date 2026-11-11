import { OrdersView } from "@/features/orders/orders-view";
import { repositories } from "@/lib/repositories";
export default async function OrdersPage(){const result=await repositories.commerce.getOrders();return <OrdersView orders={result.ok?result.data:[]}/>}
