import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Card from "../components/Card";
import Button from "../components/Button";
import { ArrowLeft, Calendar,IndianRupee , TrendingUp, Clock } from "lucide-react";
import { formatCurrency } from "../utils/validation";
import toast from "react-hot-toast";

const InvestmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [investment, setInvestment] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadInvestment(id);
  }, [id]);

  const loadInvestment = async (investmentId: string) => {
    try {
      const res = await api.getInvestmentDetails(investmentId);
      setInvestment(res.investment || res?.data?.investment);
      setTransactions(res.recentTransactions || res?.data?.recentTransactions || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load investment details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-gray-400">Loading investment details...</div>;
  }

  if (!investment) {
    return <div className="text-center p-6 text-red-500">Investment not found</div>;
  }

  const progress =
    investment.duration > 0
      ? Math.min((investment.daysCompleted / investment.duration) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Investment Details</h1>
          <p className="text-sm text-gray-400">{investment.plan?.name || "Plan"}</p>
        </div>
      </div>

      {/* Investment Summary */}
      <Card gradient className="mx-4 mt-4 p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Invested Amount</span>
          <span className="font-semibold">{formatCurrency(investment.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Daily Return</span>
          <span className="text-green-400 font-semibold">
            {formatCurrency(investment.dailyReturn)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Duration</span>
          <span>{investment.duration} Days</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Days Completed</span>
          <span>{investment.daysCompleted || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Returns Credited</span>
          <span className="text-yellow-400 font-semibold">
            {formatCurrency(investment.returnsCredited || 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span
            className={`font-semibold ${
              investment.status === "active" ? "text-green-400" : "text-gray-400"
            }`}
          >
            {investment.status}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="mx-4 mt-6 p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          Recent Transactions
        </h3>

        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400">No recent transactions</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <div
                key={txn._id}
                className="flex justify-between items-center border-b border-gray-700 pb-2"
              >
                <div>
                  <p className="font-medium capitalize">{txn.type.replace("_", " ")}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(txn.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    txn.type === "daily_return" || txn.status === "completed"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action */}
      <div className="p-4">
        <Button onClick={() => navigate("/my-investments")} className="w-full">
          Back to My Investments
        </Button>
      </div>
    </div>
  );
};

export default InvestmentDetails;
