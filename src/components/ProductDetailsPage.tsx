
"use client"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/format";
import { useRouter } from "next/navigation";
import ProductActions from "./ProductActions";
import SellerInfo from "./SellerInfo";
import { SecuredPaymentOptions } from "./ui/secured-payment-options";
import RelatedProducts from "./RelatedProducts";
import { AspectRatio } from "./ui/aspect-ratio";

const ProductDetailsPage = ({ product }) => {
  const router = useRouter();

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/products")}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <AspectRatio ratio={1}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </AspectRatio>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-bold text-escrow-blue mt-2">
              {formatCurrency(product.price)}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Seller Information</h3>
            <SellerInfo sellerName={product.sellerName} />
          </div>

          <Separator />

          {/* Payment Options */}
          <Card className="mt-6 bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Secure Payment Options</h3>
              <SecuredPaymentOptions />
            </CardContent>
          </Card>

          <ProductActions product={product} />
        </div>
      </div>

      {/* Related Products Section - Conditionally rendered by the component itself */}
      <RelatedProducts product={product} />
    </div>
  );
};

export default ProductDetailsPage;
