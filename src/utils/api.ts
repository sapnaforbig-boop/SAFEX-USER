const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import { getStoredDeviceId } from "./device";


class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      cache: "no-store",
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
        "Cache-Control": "no-cache",
      },
    };

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || "API request failed");
    }

    return data?.data || data; // 🔑 normalize
  }

  // ---------- Auth ----------
    
  sendOtp(data: any) {
    return this.request("/auth/send-otp", { method: "POST", body: JSON.stringify(data) });
  }
  verifyOtp(data: any) {
    return this.request("/auth/verify-otp", { method: "POST", body: JSON.stringify(data) });
  }
  register(data: any) {
  return this.request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
async login({ phone, password, deviceId }: { phone: string; password: string; deviceId: string }) {
  return this.request("/auth/login", { 
    method: "POST", 
    body: JSON.stringify({ phone, password, deviceId }) 
  });
}
  forgotPassword(phone: string) {
    // Backend expects send-otp with purpose = forgot_password
    return this.request("/auth/send-otp", { 
      method: "POST", 
      body: JSON.stringify({ phone, purpose: "forgot_password" }) 
    });
  }
  resetPassword(data: any) {
    return this.request("/auth/reset-password", { method: "POST", body: JSON.stringify(data) });
  }
  async changePassword(payload: { currentPassword: string; newPassword: string }) {
  return this.request("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
  logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  // ---------- User ----------
  getProfile() {
    return this.request("/users/profile");
  }
  updateProfile(data: any) {
    return this.request("/users/profile", { method: "PUT", body: JSON.stringify(data) });
  }
  getDashboard() {
    return this.request("/users/dashboard");
  }
  async getWallet() {
    const res = await this.request("/users/wallet");
    const wallet = res?.wallet || {};
    return {
      balance: Number(wallet.balance ?? 0),
      totalEarnings: Number(wallet.totalEarnings ?? 0),
      todayEarnings: Number(wallet.todayEarnings ?? 0),
      ...wallet,
    };
  }
  getReferral() {
  // ✅ new backend route
  return this.request("/referrals/summary").then((r) => r || {});
}

  // ---------- Bank ----------
 
  getBankDetails() {
  return this.request("/bank");
}
saveBankDetails(data: any) {
  return this.request("/bank", { method: "POST", body: JSON.stringify(data) });
}


  // ---------- Transactions ----------
  recharge(data: any) {
    return this.request("/transactions/recharge", { method: "POST", body: JSON.stringify(data) });
  }
  withdraw(data: any) {
    return this.request("/transactions/withdraw", { method: "POST", body: JSON.stringify(data) });
  }
  async getTransactions(params?: { type?: string }) {
    const url = new URL(`${API_URL}/transactions`);
    if (params?.type) url.searchParams.append("type", params.type);
    const res = await fetch(url.toString(), { headers: this.getAuthHeaders(), cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data?.data?.transactions || [];
  }
  getTransactionDetails(id: string) {
    return this.request(`/transactions/${id}`);
  }
  // src/utils/api.ts

async getPaymentSettings() {
  return this.request("/users/payment-settings");
}

  // ---------- Investments ----------
  invest(planId: string) {
  return this.request("/investments/buy", { 
    method: "POST", 
    body: JSON.stringify({ planId }) 
  });
}
  getUserInvestments() {
    return this.request("/investments");
  }
  getInvestmentDetails(id: string) {
    return this.request(`/investments/${id}`);
  }

  // ---------- Plans ----------
  // ---------- Plans ----------
async getPlans() {
  const res = await this.request("/plans"); 
  // backend se mila { status, message, data: { plans: [...] } }
  const plans = res?.plans || res?.data?.plans || [];
  
  return plans.map((p: any) => ({
    id: p._id,
    name: p.name,
    image: p.image || "https://via.placeholder.com/150",
    price: p.amount,
    dailyIncome: p.dailyReturn,
    days: p.duration,
    totalReturn: p.totalReturn,
    isActive: p.isActive,
    description: p.description,
  }));
}

getPlanDetails(id: string) {
  return this.request(`/plans/${id}`).then((res) => res?.plan || res?.data?.plan || {});
}

  // ---------- Misc ----------
  dailyCheckIn() {
    return this.request("/users/daily-checkin", { method: "POST" });
  }
}

export const api = new ApiClient();

