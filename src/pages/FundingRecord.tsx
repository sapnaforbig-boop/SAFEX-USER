import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/validation';
import Card from '../components/Card';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const FundingRecords: React.FC = () => {
  const navigate = useNavigate();
  // top me define karo
const [transactions, setTransactions] = useState<any[]>([]);
const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed, failed
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
  const loadTransactions = async () => {
    try {
      const txns = await api.getTransactions();
      const fundingTransactions = Array.isArray(txns)
        ? txns.filter((t: any) => t.type === "recharge")
        : [];
      setTransactions(fundingTransactions);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setTransactions([]);
      toast.error("Failed to load transactions");
    }
  };

  loadTransactions();
}, []);

useEffect(() => {
  filterTransactions();
}, [transactions, filter, searchTerm]);

 const filterTransactions = () => {
  let filtered = transactions;

  // Filter by status
  if (filter !== "all") {
    filtered = filtered.filter((t: any) => t.status === filter);
  }

  // Filter by search term
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter((t: any) => {
      const utr = String(t.utr || "").toLowerCase();
      const desc = String(t.description || "").toLowerCase();
      return utr.includes(q) || desc.includes(q);
    });
  }

  setFilteredTransactions(filtered); // ✅ error nahi aayega
};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const totalAmount = filteredTransactions.reduce((sum: number, t: any) => 
  ['completed', 'approved'].includes(t.status) ? sum + t.amount : sum, 0
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <button onClick={() => navigate('/me')} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Funding Records</h1>
          <p className="text-sm text-gray-400">Your recharge history</p>
        </div>
      </div>

      {/* Summary */}
      <Card gradient className="mx-4 mt-4 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-yellow-500" />
          Funding Summary
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-green-500">{formatCurrency(totalAmount)}</p>
            <p className="text-sm text-gray-400">Total Funded</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-500">
              {filteredTransactions.filter((t: any) => ['completed', 'approved'].includes(t.status)).length}
            </p>
            <p className="text-sm text-gray-400">Successful</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-500">
              {filteredTransactions.filter((t: any) => t.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-400">Pending</p>
          </div>
        </div>
      </Card>

      {/* Search and Filter */}
      <Card className="mx-4 mt-4 p-4">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by UTR or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button className="p-2 bg-gray-800 border border-gray-700 rounded-lg">
            <Filter className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'completed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                filter === status
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </Card>

      {/* Transactions List */}
      <div className="mx-4 mt-4 mb-20 space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No funding records found</p>
          </Card>
        ) : (
          filteredTransactions.map((transaction: any) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center gap-4">
                {getStatusIcon(transaction.status)}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">Wallet Recharge</h4>
                    <span className="text-lg font-bold text-green-500">
                      +{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-1">
                    {transaction.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {transaction?.timestamp ? formatDate(transaction.timestamp) : "—"}
                        </span>
                         <span className={`capitalize font-medium ${getStatusColor(transaction?.status)}`}>
                           {transaction?.status || "unknown"}
                         </span>
                       </div>

                  
                  {transaction.utr && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      UTR: {transaction.utr}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FundingRecords;