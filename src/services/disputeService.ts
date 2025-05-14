
import api from './api';
import { Dispute, DisputeComment } from '@/types';

export type CreateDisputeData = {
  escrowId: string;
  reason: string;
  evidence: File[];
};

export type AddCommentData = {
  content: string;
  attachments?: File[];
};

export type ResolveDisputeData = {
  status: 'resolved' | 'rejected';
  adminNotes?: string;
};

export const disputeService = {
  getUserDisputes: async (): Promise<Dispute[]> => {
    const response = await api.get<Dispute[]>('/disputes');
    return response.data;
  },
  
  getAllDisputes: async (): Promise<Dispute[]> => {
    const response = await api.get<Dispute[]>('/disputes/all');
    return response.data;
  },
  
  getDispute: async (id: string): Promise<Dispute> => {
    const response = await api.get<Dispute>(`/disputes/${id}`);
    return response.data;
  },
  
  createDispute: async (data: FormData): Promise<Dispute> => {
    const response = await api.post<Dispute>('/disputes', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  resolveDispute: async (id: string, data: ResolveDisputeData): Promise<Dispute> => {
    const response = await api.patch<Dispute>(`/disputes/${id}/resolve`, data);
    return response.data;
  },
  
  getComments: async (disputeId: string): Promise<DisputeComment[]> => {
    const response = await api.get<DisputeComment[]>(`/disputes/${disputeId}/comments`);
    return response.data;
  },
  
  addComment: async (disputeId: string, formData: FormData): Promise<DisputeComment> => {
    const response = await api.post<DisputeComment>(`/disputes/${disputeId}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default disputeService;
