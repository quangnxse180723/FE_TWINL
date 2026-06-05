import { axiosClient } from '../axiosClient';

export interface WalletTransactionResponse {
  id: number;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  orderCode?: string;
}

export interface WalletResponse {
  balance: number;
  escrowBalance: number;
  totalCommission: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  transactions: WalletTransactionResponse[];
}

export const walletApi = {
  getMyWallet: async (): Promise<WalletResponse> => {
    const { data } = await axiosClient.get<WalletResponse>('/api/v1/wallet/me');
    return data;
  },

  updateBankAccount: async (bankData: { bankName: string; bankAccountNumber: string; bankAccountName: string }) => {
    await axiosClient.put('/api/v1/wallet/bank', bankData);
  }
};
