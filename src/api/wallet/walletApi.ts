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

export interface AdminWalletResponse {
  userId: number;
  sellerName: string;
  sellerEmail: string;
  balance: number;
  escrowBalance: number;
  bankName?: string;
  bankAccountNumber?: string;
}

export interface WithdrawalRequestResponse {
  id: number;
  sellerName: string;
  sellerEmail: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  createdAt: string;
  status: string;
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
  },

  requestWithdrawal: async (amount: number) => {
    await axiosClient.post('/api/v1/wallet/withdraw', { amount });
  },

  getAllWithdrawals: async (): Promise<WithdrawalRequestResponse[]> => {
    const { data } = await axiosClient.get<WithdrawalRequestResponse[]>('/api/v1/wallet/admin/withdrawals');
    return data;
  },

  approveWithdrawal: async (id: number) => {
    await axiosClient.post(`/api/v1/wallet/admin/withdrawals/${id}/approve`);
  },

  rejectWithdrawal: async (id: number, reason: string) => {
    await axiosClient.post(`/api/v1/wallet/admin/withdrawals/${id}/reject`, { reason });
  },

  getAllWallets: async (): Promise<AdminWalletResponse[]> => {
    const { data } = await axiosClient.get<AdminWalletResponse[]>('/api/v1/wallet/admin/wallets');
    return data;
  },

  getWalletTransactions: async (userId: number): Promise<WalletTransactionResponse[]> => {
    const { data } = await axiosClient.get<WalletTransactionResponse[]>(`/api/v1/wallet/admin/wallets/${userId}/transactions`);
    return data;
  }
};
