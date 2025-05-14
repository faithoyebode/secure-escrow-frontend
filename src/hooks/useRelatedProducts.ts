
"use client"
import { useState, useEffect } from "react";
import { Product } from "@/types";
import productService from "@/services/productService";

// Extract related products logic to a reusable hook
export function useRelatedProducts(product: Product, limit: number = 4) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const run = async () => {
      if (product) {
        const products = await productService.getAllProducts({});
        const related = products
          .filter((p) => p.category === product.category && p.id !== product.id)
          .slice(0, limit);
        
        setRelatedProducts(related);
      }
    }
    run()

  }, [product, limit]);

  return relatedProducts;
}
