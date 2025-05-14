
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEscrow } from "@/contexts/EscrowContext";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const ProductActions = ({ product }: { product: Product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { createEscrow } = useEscrow();
  const router = useRouter();
  const [isCreatingEscrow, setIsCreatingEscrow] = useState(false);
  const [escrowDays, setEscrowDays] = useState("14"); // Default 14 days

  const isBuyer = user?.role === "buyer";
  const isSeller = user?.role === "seller";
  const isAdmin = user?.role === "admin";
  const isOwner = user?.id === product.sellerId;

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to add products to cart.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!isBuyer) {
      toast({
        title: "Action not allowed",
        description: "Only buyers can add products to cart.",
        variant: "destructive",
      });
      return;
    }

    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = async () => {
    setIsCreatingEscrow(true);
    try {
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to log in to purchase products.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      if (!isBuyer) {
        toast({
          title: "Action not allowed",
          description: "Only buyers can purchase products.",
          variant: "destructive",
        });
        return;
      }

      const success = await createEscrow(
        product.id,
        product.name,
        product.image,
        product.price,
        product.sellerId,
        product.sellerName,
        parseInt(escrowDays)
      );

      if (success) {
        router.push("/escrow");
      }
    } finally {
      setIsCreatingEscrow(false);
    }
  };

  // Escrow duration options
  const escrowDurationOptions = [
    { value: "7", label: "7 days" },
    { value: "14", label: "14 days (default)" },
    { value: "30", label: "30 days" },
    { value: "60", label: "60 days" }
  ];

  if (!user) {
    return (
      <div className="mt-6 space-y-4">
        <Button className="w-full" onClick={() => router.push("/login")}>
          Login to Buy
        </Button>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="mt-6 space-y-4">
        <Button className="w-full" variant="outline" disabled>
          You own this product
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => router.push(`/seller/products/${product.id}/edit`)}
        >
          Edit Product
        </Button>
      </div>
    );
  }

  if (isSeller && !isAdmin) {
    return (
      <div className="mt-6">
        <Button className="w-full" variant="outline" disabled>
          Seller accounts cannot purchase products
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="w-full bg-escrow-blue hover:bg-escrow-teal">
            Buy Now with Escrow Protection
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Complete Purchase</SheetTitle>
            <SheetDescription>
              Your payment will be held in escrow until you confirm receipt and
              satisfaction with the product.
            </SheetDescription>
          </SheetHeader>
          <div className="my-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-md overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Escrow Duration:</label>
              <Select value={escrowDays} onValueChange={setEscrowDays}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select escrow duration" />
                </SelectTrigger>
                <SelectContent>
                  {escrowDurationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                The escrow will automatically expire if not completed within this timeframe.
              </p>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </SheetClose>
            <Button
              className="w-full sm:w-auto"
              onClick={handleBuyNow}
              disabled={isCreatingEscrow}
            >
              {isCreatingEscrow ? "Processing..." : "Confirm Purchase"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleAddToCart}
      >
        Add to Cart
      </Button>
    </div>
  );
};

export default ProductActions;
