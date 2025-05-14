
"use client"
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { products } from "@/data/mockData";

// Extract related products logic to a reusable hook
export function useRelatedProducts(product: Product, limit: number = 4) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (product) {
      const related = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, limit);
      
      setRelatedProducts(related);
    }
  }, [product, limit]);

  return relatedProducts;
}
