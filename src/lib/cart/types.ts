export type CartItem = {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  customFee: number;
  size: string;
  customName: string;
  customNumber: string;
  qty: number;
};

export function cartItemKey(item: Pick<CartItem, "productId" | "size" | "customName" | "customNumber">) {
  return [item.productId, item.size, item.customName, item.customNumber].join("::");
}

export function unitPrice(item: Pick<CartItem, "price" | "salePrice" | "customFee">) {
  return (item.salePrice ?? item.price) + item.customFee;
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + unitPrice(i) * i.qty, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
