
import api from './api';
import { Product } from '@/types';

export const productService = {
  getAllProducts: async (props: {category?: string, search?: string, price?: {gte: number, lte: number}}): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (props?.category) params.append('category', props.category);
    if (props?.search) params.append('search', props.search);
    if(typeof props?.price?.gte == 'number' && props?.price?.lte){
      console.log("price", props.price);
      params.append('price[gte]', String(props.price.gte));
      params.append('price[lte]', String(props.price.lte));
    }
    
    const response = await api.get<Product[]>(`/products?${params.toString()}`);
    return response.data;
  },
  
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },
  
  createProduct: async (productData: FormData): Promise<Product> => {
    // Using FormData requires different content type, so override axios defaults
    const response = await api.post<Product>('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  updateProduct: async (id: string, productData: FormData): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
  
  getSellerProducts: async (sellerId?: string): Promise<Product[]> => {
    const endpoint = sellerId ? `/products/seller/${sellerId}` : '/products/seller';
    const response = await api.get<Product[]>(endpoint);
    return response.data;
  }
};

export default productService;
