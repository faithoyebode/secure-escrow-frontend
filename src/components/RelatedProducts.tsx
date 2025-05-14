
"use client"
import Link from "next/link";
import { Product } from "@/types";
import { useRouter } from "next/navigation";
import { useRelatedProducts } from "@/hooks/useRelatedProducts";
import { formatCurrency } from "@/utils/format";

type RelatedProductsProps = {
  product: Product;
};

export default function RelatedProducts({ product }: RelatedProductsProps) {
  const router = useRouter();
  const relatedProducts = useRelatedProducts(product);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {relatedProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow escrow-card"
            onClick={() => router.push(`/products/${p.id}`)}
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium text-lg">{p.name}</h3>
              <p className="text-escrow-blue font-bold mt-1">
                {formatCurrency(p.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
