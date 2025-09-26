import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/validation';
import Card from '../components/Card';
import { 
  ArrowLeft, 
  Banknote, 
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  TrendingDown
} from 'lucide-react';

const WithdrawRecords: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed, failed
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filter, searchTerm]);

  const loadTransactions = async () => {
    try {
      // <-- pass object with type
      const res = await api.getTransactions({ type: 'withdraw' });

      // res could be:
      // 1) an array directly (if api.request normalized that way)
      // 2) an object { data: { transactions: [...] } }
      // 3) an object { transactions: [...] }
      let withdrawTransactions: any[] = [];

      if (Array.isArray(res)) {
        withdrawTransactions = res;
      } else if (Array.isArray(res?.data?.transactions)) {
        withdrawTransactions = res.data.transactions;
      } else if (Array.isArray(res?.transactions)) {
        withdrawTransactions = res.transactions;
      } else {
        // handle other shapes defensively
        withdrawTransactions = [];
      }

      setTransactions(withdrawTransactions);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setTransactions([]);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter((t: any) => t.status === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((t: any) => 
        (t.utr || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
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

  const totalWithdrawn = filteredTransactions.reduce((sum: number, t: any) => 
  ['completed', 'approved'].includes(t.status) ? sum + (t.amount || 0) : sum, 0
  );

  const totalFees = filteredTransactions.reduce((sum: number, t: any) => 
  ['completed', 'approved'].includes(t.status) ? sum + (t.feeAmount || 0) : sum, 0
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <button onClick={() => navigate('/me')} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Withdraw Records</h1>
          <p className="text-sm text-gray-400">Your withdrawal history</p>
        </div>
      </div>

      {/* Summary */}
      <Card gradient className="mx-4 mt-4 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-yellow-500" />
          Withdrawal Summary
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-red-500">{formatCurrency(totalWithdrawn)}</p>
            <p className="text-sm text-gray-400">Total Withdrawn</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-500">
              {filteredTransactions.filter((t: any) => ['completed', 'approved'].includes(t.status)).length}
            </p>
            <p className="text-sm text-gray-400">Successful</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-orange-500">{formatCurrency(totalFees)}</p>
            <p className="text-sm text-gray-400">Total Fees</p>
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
            <Banknote className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No withdrawal records found</p>
          </Card>
        ) : (
          filteredTransactions.map((transaction: any) => (
            <Card key={transaction.id || transaction._id} className="p-4">
              <div className="flex items-center gap-4">
                {getStatusIcon(transaction.status)}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">Wallet Withdrawal</h4>
                    <span className="text-lg font-bold text-red-500">
                      -{formatCurrency(transaction.amount || 0)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-1">
                    {transaction.description || ''}
                  </p>
                  
                  {transaction.feeAmount != null && (
                    <p className="text-xs text-orange-400 mb-1">
                      Fee: {formatCurrency(transaction.feeAmount)} | 
                      Net: {formatCurrency((transaction.amount || 0) - (transaction.feeAmount || 0))}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {/* <-- safe date fallback */}
                      {formatDate(transaction.createdAt || transaction.updatedAt || transaction.timestamp)}
                    </span>
                    <span className={`capitalize font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
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

export default WithdrawRecords;
