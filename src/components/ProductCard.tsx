
"use client"

import Link from "next/link";
import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/utils/format";

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <Card className="overflow-hidden escrow-card">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-lg truncate hover:text-escrow-blue">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1 truncate">
          {product.category}
        </p>
        <p className="font-bold text-lg mt-2 text-escrow-darkBlue">
          {formatCurrency(product.price)}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Seller: {product.sellerName}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-escrow-blue hover:bg-escrow-teal transition-colors"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
