import { notFound } from "next/navigation";
import { getPublicProduct, listRelatedProducts } from "@/lib/data/storefront";
import { getSettings } from "@/lib/data/settings";
import { ProductClient } from "./product-client";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getPublicProduct(id);
  if (!product) notFound();

  const [related, settings] = await Promise.all([listRelatedProducts(product, 4), getSettings()]);

  return <ProductClient product={product} related={related} customizationFee={settings.customizationFee} />;
}
