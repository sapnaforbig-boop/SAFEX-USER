import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency, validatePhone } from '../utils/validation';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { 
  ArrowLeft, 
  CreditCard, 
  QrCode,
  Smartphone,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Recharge: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Amount, 2: Payment, 3: Confirmation
  const [amount, setAmount] = useState('');
  const [payerName, setPayerName] = useState('');
  const [utr, setUtr] = useState('');
  const [upiId, setUpiId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];
  

// instead of const paymentMethods = [...] at top
const paymentMethods = [
  { id: 'gpay', name: 'Google Pay', logo: '🟢', deeplink: `gpay://upi/pay?pa=${upiId}&am=` },
  { id: 'phonepe', name: 'PhonePe', logo: '🟣', deeplink: `phonepe://pay?pa=${upiId}&am=` },
  { id: 'paytm', name: 'Paytm', logo: '🔵', deeplink: `paytm://pay?pa=${upiId}&am=` },
];
  
  useEffect(() => {
  const loadPaymentSettings = async () => {
    try {
      const res = await api.getPaymentSettings();
      setUpiId(res.upiId || "");
      setQrCodeUrl(res.qrCodeUrl || "");
    } catch (err) {
      console.error("Failed to load payment settings", err);
    }
  };
  loadPaymentSettings();
}, []);

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handleContinue = () => {
    const numAmount = parseFloat(amount);
    if (numAmount < 500 || numAmount > 95000) {
      toast.error('Amount must be between ₹500 and ₹95,000');
      return;
    }
    setStep(2);
  };

  const handlePaymentMethod = (method: any) => {
    setSelectedMethod(method.id);
    const deeplink = `${method.deeplink}${amount}&pn=SafeXExpress&tn=Recharge`;
    
    // Open UPI app
    window.open(deeplink, '_blank');
    
    // Move to confirmation step
    setTimeout(() => {
      setStep(3);
    }, 1000);
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payerName.trim()) {
      toast.error('Please enter payer name');
      return;
    }
    
    if (!utr.trim() || utr.length < 12) {
      toast.error('Please enter valid UTR number');
      return;
    }

    setIsLoading(true);
    try {
      await api.recharge({
        amount: parseFloat(amount),
        payerName: payerName.trim(),
        utr: utr.trim(),
        paymentMethod: selectedMethod,
      });
      
      toast.success('Recharge request submitted successfully!');
      navigate('/home');
    } catch (error: any) {
      toast.error(error.message || 'Recharge failed');
    } finally {
      setIsLoading(false);
    }
  };

 const generateQRCode = () => {
  const upiString = `upi://pay?pa=${upiId}&pn=SafeXExpress&am=${amount}&tn=Recharge`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
};

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <button onClick={() => navigate('/home')} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Recharge Wallet</h1>
          <p className="text-sm text-gray-400">Add money to your account</p>
        </div>
      </div>

      {step === 1 && (
        <div className="mx-4 mt-4">
          {/* Amount Input */}
          <Card gradient className="p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" />
              Enter Amount
            </h3>
            
            <Input
              label="Recharge Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (₹500 - ₹95,000)"
              className="text-xl font-bold text-center"
            />
            
            <p className="text-sm text-gray-400 mt-2">
              Minimum: ₹500 | Maximum: ₹95,000
            </p>
          </Card>

          {/* Quick Amount Selection */}
          <Card className="p-4 mb-4">
            <h4 className="font-semibold mb-3">Quick Select</h4>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  onClick={() => handleAmountSelect(quickAmount)}
                  className={amount === quickAmount.toString() ? 'border-yellow-500 bg-yellow-500/20' : ''}
                >
                  {formatCurrency(quickAmount)}
                </Button>
              ))}
            </div>
          </Card>

          <Button 
            onClick={handleContinue}
            className="w-full"
            disabled={!amount || parseFloat(amount) < 500 || parseFloat(amount) > 95000}
          >
            Continue to Payment
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="mx-4 mt-4">
          <Card gradient className="p-4 mb-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Recharge Amount</h3>
              <p className="text-3xl font-bold text-yellow-500">{formatCurrency(parseFloat(amount))}</p>
            </div>
          </Card>

          {/* QR Code */}
          <Card className="p-4 mb-4">
            <h4 className="font-semibold mb-3 text-center flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-yellow-500" />
              Scan QR to Pay
            </h4>
            
            <div className="flex justify-center mb-4">
              <img 
                src={generateQRCode()} 
                alt="UPI QR Code"
                className="w-48 h-48 border-4 border-yellow-500 rounded-lg"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">UPI ID</p>
              <p className="font-mono text-yellow-500">{upiId}</p>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-4 mb-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-yellow-500" />
              Or Pay with App
            </h4>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant="outline"
                  onClick={() => handlePaymentMethod(method)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.logo}</span>
                    <span>{method.name}</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="mx-4 mt-4">
          <Card gradient className="p-4 mb-4">
            <div className="text-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Payment Initiated</h3>
              <p className="text-gray-400">Please complete the payment and submit details below</p>
            </div>
          </Card>

          <Card className="p-4 mb-4">
            <form onSubmit={handleSubmitUtr} className="space-y-4">
              <Input
                label="Payer Name"
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Enter name as per payment"
                required
              />
              
              <Input
                label="UTR / Transaction ID"
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter 12-digit UTR number"
                required
                className="font-mono"
              />
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm text-yellow-400 font-medium">Important:</p>
                <p className="text-xs text-gray-300 mt-1">
                  • Payment will be verified automatically
                  • Fund will be credited within 5-10 minutes
                  • Keep screenshot for reference
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !payerName.trim() || !utr.trim()}
              >
                {isLoading ? 'Submitting...' : 'Submit Payment Details'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Recharge;