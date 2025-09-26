import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency, isWithdrawAllowed } from '../utils/validation';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { 
  ArrowLeft, 
  Banknote, 
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const Withdraw: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState({ balance: 0 });
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawalAllowed, setWithdrawalAllowed] = useState(false);

  useEffect(() => {
    loadWallet();
    loadBankDetails();
    setWithdrawalAllowed(isWithdrawAllowed());
  }, []);

  const loadWallet = async () => {
    try {
      const walletData = await api.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const loadBankDetails = async () => {
    try {
      const data = await api.getBankDetails();
      if (data && data.accountNumber) {
        setBankDetails(data);
      } else {
        setBankDetails(null);
      }
    } catch (err) {
      setBankDetails(null);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    if (!bankDetails) {
      toast.error('Please update your bank details before withdrawing');
      navigate('/bank-details');
      return;
    }

    if (withdrawAmount < 350) {
      toast.error('Minimum withdrawal amount is ₹350');
      return;
    }
    
    if (withdrawAmount > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }
    
    if (!withdrawalAllowed) {
      toast.error('Withdrawal is only allowed Mon-Fri 5:00 AM - 12:00 PM');
      return;
    }

    const feeAmount = withdrawAmount * 0.1; // 10% fee
    const netAmount = withdrawAmount - feeAmount;

    setIsLoading(true);
    try {
      await api.withdraw({
        amount: withdrawAmount,
        feeAmount,
        netAmount,
      });
      
      toast.success('Withdrawal request submitted successfully!');
      navigate('/home');
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFee = () => {
    const withdrawAmount = parseFloat(amount) || 0;
    const fee = withdrawAmount * 0.1;
    const net = withdrawAmount - fee;
    return { fee, net };
  };

  const getNextWithdrawTime = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7));
    nextMonday.setHours(5, 0, 0, 0);
    
    return nextMonday.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <button onClick={() => navigate('/home')} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Withdraw Funds</h1>
          <p className="text-sm text-gray-400">Withdraw money from wallet</p>
        </div>
      </div>

      {/* Withdrawal Status */}
      <Card className={`mx-4 mt-4 p-4 ${withdrawalAllowed ? 'border-green-500/50' : 'border-red-500/50'}`}>
        <div className="flex items-center gap-3">
          {withdrawalAllowed ? (
            <>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Banknote className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-500">Withdrawal Available</h4>
                <p className="text-sm text-gray-400">You can withdraw funds now</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-red-500">Withdrawal Closed</h4>
                <p className="text-sm text-gray-400">Available Mon-Fri 5:00 AM - 12:00 PM</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {!withdrawalAllowed && (
        <Card className="mx-4 mt-4 p-4 border-yellow-500/50">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h4 className="font-semibold text-yellow-500">Service Hours</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Monday to Friday: 5:00 AM - 12:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Next available: {getNextWithdrawTime()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Balance Card */}
      <Card gradient className="mx-4 mt-4 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-500" />
          Available Balance
        </h3>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-500">{formatCurrency(wallet.balance)}</p>
          <p className="text-sm text-gray-400 mt-1">Available for withdrawal</p>
        </div>
      </Card>

      {/* Withdraw Form */}
      <Card className="mx-4 mt-4 p-4">
        <form onSubmit={handleWithdraw} className="space-y-4">
          <Input
            label="Withdrawal Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (min ₹350)"
            className="text-xl font-bold text-center"
            disabled={!withdrawalAllowed}
          />

          {amount && parseFloat(amount) >= 350 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h5 className="font-semibold mb-2">Withdrawal Summary</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Withdrawal Amount:</span>
                  <span>{formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Service Fee (10%):</span>
                  <span>-{formatCurrency(calculateFee().fee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-green-500 pt-2 border-t border-gray-700">
                  <span>You'll Receive:</span>
                  <span>{formatCurrency(calculateFee().net)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-sm text-yellow-400 font-medium">Important Notes:</p>
            <ul className="text-xs text-gray-300 mt-1 space-y-1">
              <li>• Minimum withdrawal: ₹350</li>
              <li>• 10% service fee will be deducted</li>
              <li>• Processing time: 2-4 working hours</li>
              <li>• Available only Mon-Fri 5:00 AM - 12:00 PM</li>
              <li>• Ensure bank details are updated</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={
              isLoading || 
              !withdrawalAllowed || 
              !amount || 
              parseFloat(amount) < 350 || 
              parseFloat(amount) > wallet.balance
            }
          >
            {isLoading ? 'Processing...' : 'Withdraw Funds'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Withdraw;
