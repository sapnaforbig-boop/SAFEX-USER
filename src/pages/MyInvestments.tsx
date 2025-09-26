import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Card from "../components/Card";
import Button from "../components/Button";
import { TrendingUp, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { formatCurrency } from "../utils/validation";
import toast from "react-hot-toast";

const MyInvestments: React.FC = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const res = await api.getUserInvestments();
      setInvestments(res.data?.investments || res.investments || []);
      setSummary(res.data?.summary || res.summary || null);
    } catch (error: any) {
      toast.error(error.message || "Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-gray-400">Loading investments...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <h1 className="text-xl font-bold">My Investments</h1>
      </div>

      {/* Summary */}
      {summary && (
        <Card gradient className="mx-4 mt-4 p-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">Total Invested</p>
            <p className="text-lg font-bold text-green-400">
              {formatCurrency(summary.totalInvested)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Returns</p>
            <p className="text-lg font-bold text-yellow-400">
              {formatCurrency(summary.totalReturns)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Active</p>
            <p className="text-lg font-bold text-blue-400">
              {summary.activeInvestments}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Completed</p>
            <p className="text-lg font-bold text-purple-400">
              {summary.completedInvestments}
            </p>
          </div>
        </Card>
      )}

      {/* List */}
      <div className="mx-4 mt-6 space-y-4">
        {investments.length === 0 ? (
          <p className="text-gray-400 text-center">No investments found</p>
        ) : (
          investments.map((inv) => (
            <Card key={inv._id} gradient className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{inv.plan?.name}</h3>
                  <p className="text-sm text-gray-400">
                    Invested: {formatCurrency(inv.amount)} | Status:{" "}
                    <span
                      className={
                        inv.status === "active" ? "text-green-400" : "text-gray-400"
                      }
                    >
                      {inv.status}
                    </span>
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <DollarSign size={14} /> {formatCurrency(inv.dailyReturn)} / day
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <Calendar size={14} /> {inv.duration} days
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <TrendingUp size={14} /> {formatCurrency(inv.returnsCredited || 0)}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/investments/${inv._id}`)}
                  className="flex items-center gap-1"
                >
                  View <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyInvestments;


