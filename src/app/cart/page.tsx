"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import checkoutService from "@/services/checkoutService";
import { Plus, Minus } from "lucide-react";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart, getCheckoutItems } = useCart();
  const navigate = useRouter();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity >= 0) {
      updateQuantity(productId, quantity);
    }
  };

  const incrementQuantity = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const decrementQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    } else {
      removeFromCart(productId);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed with checkout.",
        variant: "destructive",
      });
      navigate.push("/login");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add items before checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    
    try {
      // Get checkout items from cart
      const checkoutItems = getCheckoutItems();
      
      // Process the checkout
      await checkoutService.processCheckout(checkoutItems);
      
      toast({
        title: "Checkout Successful",
        description: "Your order has been placed successfully. You can track your orders in the Escrow section.",
      });
      
      clearCart();
      navigate.push("/escrow");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          Seller: {item.product.sellerName}
                        </p>
                        <p className="font-semibold text-escrow-blue mt-1">
                          {formatCurrency(item.product.price)} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border rounded-md">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => decrementQuantity(item.product.id, item.quantity)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.product.id, e.target.value)
                            }
                            min="1"
                            className="w-12 text-center h-8 border-none focus-visible:ring-0"
                          />
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => incrementQuantity(item.product.id, item.quantity)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 text-sm mt-1 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline" onClick={() => navigate.push("/products")}>
                Continue Shopping
              </Button>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{formatCurrency(10.00)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>{formatCurrency(totalPrice * 0.07)}</span>
                </div>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice + 10.00 + totalPrice * 0.07)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Button
                  className="w-full bg-escrow-blue hover:bg-escrow-teal"
                  size="lg"
                  disabled={isCheckingOut || items.length === 0}
                  onClick={handleCheckout}
                >
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Secure Checkout</h3>
                <p className="text-xs text-gray-500">
                  Your payment information is processed securely. We do not store your credit card details.
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <svg className="h-8" viewBox="0 0 40 24" width="40" height="24" role="img" aria-labelledby="pi-visa">
                    <title id="pi-visa">Visa</title>
                    <path opacity=".07" d="M35 0H5C2.3 0 0 2.3 0 5v14c0 2.7 2.4 5 5 5h30c2.8 0 5-2.2 5-5V5c0-2.7-2.3-5-5-5z"></path>
                    <path fill="#fff" d="M35 1c2.3 0 4 1.9 4 4v14c0 2.1-1.7 4-4 4H5c-2.3 0-4-1.9-4-4V5c0-2.2 1.8-4 4-4h30"></path>
                    <path d="M27.938 19h-1.75l1.125-10.5h1.75L27.938 19zm-4.681-10.5L20.881 19h-1.75l-2.375-9.17-1 9.17h-1.75l1.125-10.5h2.875l1.939 8.518 1.813-8.518h2.875l-1.125 10.5h-1.75l1-9.17-2.226 9.17h-1.75l2.226-9.17zm12.55 0l-1.125 10.5H33.5l1.125-10.5h1.183zm-24.138 0H9.919L8.794 19H7.919l-1.75-6.394-1 6.394h-.875L5.419 8.5h1.125l1.875 6.887L9.544 8.5h.875l1.125 6.887L13.419 8.5z" fill="#142688"></path>
                  </svg>
                  <svg className="h-8" viewBox="0 0 40 24" width="40" height="24" role="img" aria-labelledby="pi-master">
                    <title id="pi-master">Mastercard</title>
                    <path opacity=".07" d="M35 0H5C2.3 0 0 2.3 0 5v14c0 2.7 2.4 5 5 5h30c2.8 0 5-2.2 5-5V5c0-2.7-2.3-5-5-5z"></path>
                    <path fill="#fff" d="M35 1c2.3 0 4 1.9 4 4v14c0 2.1-1.7 4-4 4H5c-2.3 0-4-1.9-4-4V5c0-2.2 1.8-4 4-4h30"></path>
                    <circle fill="#EB001B" cx="15" cy="12" r="7"></circle>
                    <circle fill="#F79E1B" cx="23" cy="12" r="7"></circle>
                    <path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"></path>
                  </svg>
                  <svg className="h-8" viewBox="0 0 40 24" width="40" height="24" role="img" aria-labelledby="pi-paypal">
                    <title id="pi-paypal">PayPal</title>
                    <path opacity=".07" d="M35 0H5C2.3 0 0 2.3 0 5v14c0 2.7 2.4 5 5 5h30c2.8 0 5-2.2 5-5V5c0-2.7-2.3-5-5-5z"></path>
                    <path fill="#fff" d="M35 1c2.3 0 4 1.9 4 4v14c0 2.1-1.7 4-4 4H5c-2.3 0-4-1.9-4-4V5c0-2.2 1.8-4 4-4h30"></path>
                    <path fill="#003087" d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"></path>
                    <path fill="#3086C8" d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"></path>
                    <path fill="#012169" d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.5 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.2-.5-.2h-.1z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button
            onClick={() => navigate.push("/products")}
            className="bg-escrow-blue hover:bg-escrow-teal"
            size="lg"
          >
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
