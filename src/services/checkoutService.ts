
import api from './api';
import { Escrow } from '@/types';
import { toast } from "@/components/ui/use-toast";
import escrowService from './escrowService';

export type CartItem = {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  sellerId: string;
  sellerName: string;
  quantity: number;
};

export type CheckoutResult = {
  success: boolean;
  message: string;
  escrows: Escrow[];
};

export const checkoutService = {
  processCheckout: async (items: CartItem[]): Promise<CheckoutResult> => {
    try {
      if (!items.length) {
        throw new Error("No items in cart to checkout");
      }

      console.log("Starting checkout with items:", items);

      // Group items by seller
      const itemsBySeller: Record<string, CartItem[]> = {};
      
      items.forEach(item => {
        if (!itemsBySeller[item.sellerId]) {
          itemsBySeller[item.sellerId] = [];
        }
        itemsBySeller[item.sellerId].push(item);
      });
      
      console.log("Items grouped by seller:", itemsBySeller);
      
      // Create one escrow per seller with all their products
      const escrowPromises = Object.entries(itemsBySeller).map(([sellerId, sellerItems]) => {
        console.log(`Creating escrow for seller ${sellerId} with ${sellerItems.length} items`);
        
        return escrowService.createEscrow({
          products: sellerItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          sellerId,
          escrowDays: 14 // Default to 14 days
        });
      });
      
      const escrows = await Promise.all(escrowPromises);
      console.log("Escrows created:", escrows);
      
      return {
        success: true,
        message: "Checkout processed successfully",
        escrows
      };
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "There was an error processing your checkout",
        variant: "destructive",
      });
      
      throw error;
    }
  }
};

export default checkoutService;
