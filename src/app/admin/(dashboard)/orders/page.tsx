import { listOrders, getOrderDetail } from "@/lib/data/orders";
import { OrdersClient } from "./orders-client";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; order?: string }>;
}) {
  const sp = await searchParams;
  const [{ rows, page, pageCount }, detail] = await Promise.all([
    listOrders({ search: sp.q, status: sp.status || "all", page: sp.page ? Number(sp.page) : 1 }),
    sp.order ? getOrderDetail(sp.order) : Promise.resolve(null),
  ]);

  return (
    <OrdersClient
      rows={rows}
      page={page}
      pageCount={pageCount}
      filters={{ q: sp.q || "", status: sp.status || "all" }}
      detail={detail}
    />
  );
}
