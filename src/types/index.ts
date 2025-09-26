export interface User {
  id: string;
  name: string;
  phone: string;
  uid: string;
  deviceId: string;
  referralCode: string;
  avatar?: string;
  wallet?: Wallet;
  referral?: { code: string };
  isVerified: boolean;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  totalEarnings: number;
  todayEarnings: number;
}

export interface Plan {
  id: string;
  name: string;
  image: string;
  price: number;
  dailyIncome: number;
  days: number;
  totalReturn: number;
  isActive: boolean;
  progress?: number;
  investedAt?: string;
}

export interface Transaction {
  id: string;
  type: 'recharge' | 'withdraw' | 'investment' | 'referral';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description: string;
  utr?: string;
}

export interface ReferralData {
  levelA: { count: number; earnings: number; };
  levelB: { count: number; earnings: number; };
  levelC: { count: number; earnings: number; };
  totalTeam: number;
  totalEarnings: number;
}