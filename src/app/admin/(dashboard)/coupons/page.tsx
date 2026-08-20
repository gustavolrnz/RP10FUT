import { listCoupons } from "@/lib/data/coupons";
import { CouponsClient } from "./coupons-client";

export default async function CouponsPage() {
  const coupons = await listCoupons();
  return <CouponsClient coupons={coupons} />;
}
