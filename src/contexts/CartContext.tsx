
"use client"
import { createContext, useState, useContext, ReactNode } from "react";
import { Product } from "../types";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";
import { CartItem } from "@/services/checkoutService";

type CartContextItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartContextItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  totalItems: number;
  totalPrice: number;
  getCheckoutItems: () => CartItem[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartContextItem[]>([]);
  const { user } = useAuth();

  const addToCart = (product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        toast({
          title: "Quantity updated",
          description: `${product.name} quantity increased to ${existingItem.quantity + 1}`,
        });
        
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast({
          title: "Added to cart",
          description: `${product.name} added to your cart`,
        });
        
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => {
      const product = prevItems.find(item => item.product.id === productId)?.product;
      if (product) {
        toast({
          title: "Removed from cart",
          description: `${product.name} removed from your cart`,
        });
      }
      
      return prevItems.filter((item) => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      
      const product = prevItems.find(item => item.product.id === productId)?.product;
      if (product) {
        toast({
          title: "Quantity updated",
          description: `${product.name} quantity updated to ${quantity}`,
        });
      }
      
      return updatedItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  // Convert cart items to checkout format
  const getCheckoutItems = (): CartItem[] => {
    return items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image,
      price: item.product.price,
      sellerId: item.product.sellerId,
      sellerName: item.product.sellerName,
      quantity: item.quantity
    }));
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        totalItems,
        totalPrice,
        getCheckoutItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
