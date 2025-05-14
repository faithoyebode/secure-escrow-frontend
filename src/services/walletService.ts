
import api from './api';

export type WalletBalance = {
  balance: number;
};

export type WithdrawalData = {
  amount: number;
  accountDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
};

export type WithdrawalResult = {
  success: boolean;
  message: string;
  transaction?: {
    id: string;
    amount: number;
    status: string;
    timestamp: string;
  };
};

export const walletService = {
  getWalletBalance: async (): Promise<WalletBalance> => {
    try {
      const response = await api.get<WalletBalance>('/wallet/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },
  
  withdrawFunds: async (data: WithdrawalData): Promise<WithdrawalResult> => {
    try {
      const response = await api.post<WithdrawalResult>('/wallet/withdraw', data);
      return response.data;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }
};

export default walletService;
