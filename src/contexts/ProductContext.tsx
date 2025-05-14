
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';
import productService from '@/services/productService';
import { useAuth } from './AuthContext';

type ProductContextType = {
  products: Product[];
  sellerProducts: Product[];
  loading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  loadProducts: (category?: string, search?: string) => Promise<void>;
  loadSellerProducts: () => Promise<void>;
};

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async (category?: string, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await productService.getAllProducts({category, search});
      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load products");
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadSellerProducts = async () => {
    if (!user || user.role !== 'seller') return;
    
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await productService.getSellerProducts();
      setSellerProducts(fetchedProducts);
    } catch (err) {
      console.error("Failed to load seller products:", err);
      setError("Failed to load your products");
      toast({
        title: "Error",
        description: "Failed to load your products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    if (user && user.role === 'seller') {
      loadSellerProducts();
    }
  }, [user]);

  const getProductById = (id: string) => {
    return products.find((product) => product.id === id);
  };

  const value = {
    products,
    sellerProducts,
    loading,
    error,
    getProductById,
    loadProducts,
    loadSellerProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
