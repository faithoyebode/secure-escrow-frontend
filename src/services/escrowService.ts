
import api from './api';
import { Escrow, TransactionStatus } from '@/types';

export type ProductEscrowItem = {
  productId: string;
  quantity: number;
};

export type CreateEscrowData = {
  products: ProductEscrowItem[];
  sellerId: string;
  escrowDays?: number;
};

export type UpdateEscrowStatusData = {
  status: TransactionStatus;
};

export type UpdateEscrowExpiryData = {
  days: number;
};

export const escrowService = {
  getUserEscrows: async (): Promise<Escrow[]> => {
    const response = await api.get<Escrow[]>('/escrows');
    return response.data;
  },
  
  getAllEscrows: async (): Promise<Escrow[]> => {
    const response = await api.get<Escrow[]>('/escrows/all');
    return response.data;
  },
  
  getEscrow: async (id: string): Promise<Escrow> => {
    const response = await api.get<Escrow>(`/escrows/${id}`);
    return response.data;
  },
  
  createEscrow: async (data: CreateEscrowData): Promise<Escrow> => {
    console.log('Creating escrow with data:', JSON.stringify(data, null, 2));
    const response = await api.post<Escrow>('/escrows', data);
    return response.data;
  },
  
  updateEscrowStatus: async (id: string, data: UpdateEscrowStatusData): Promise<Escrow> => {
    const response = await api.patch<Escrow>(`/escrows/${id}/status`, data);
    return response.data;
  },
  
  updateEscrowExpiry: async (id: string, data: UpdateEscrowExpiryData): Promise<Escrow> => {
    const response = await api.patch<Escrow>(`/escrows/${id}/expiry`, data);
    return response.data;
  },
  
  processExpiredEscrows: async (): Promise<{ message: string; count: number }> => {
    const response = await api.post<{ message: string; count: number }>('/escrows/process-expired');
    return response.data;
  }
};

export default escrowService;
