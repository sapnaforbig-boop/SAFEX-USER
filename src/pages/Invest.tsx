import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/validation';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const Invest: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);

  useEffect(() => {
    loadPlans();
    
    // Check if a specific plan is selected from URL
    const params = new URLSearchParams(location.search);
    const planId = params.get('plan');
    if (planId) {
      // Will select the plan after plans are loaded
      setSelectedPlan({ id: planId });
    }
  }, [location.search]);

  const loadPlans = async () => {
  try {
    const plansData = await api.getPlans(); // ab yahan se direct array milega
    setPlans(plansData);
  } catch (error) {
    console.error("Failed to load plans:", error);
    setPlans([]);
  }
};

  const handleInvestNow = (plan: any) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.price.toString());
    setShowInvestModal(true);
  };

  const handleConfirmInvestment = async () => {
    if (!selectedPlan || !investAmount) return;

    const amount = parseFloat(investAmount);
    if (amount < selectedPlan.price) {
      toast.error(`Minimum investment is ₹{formatCurrency(selectedPlan.price)}`);
      return;
    }

    setIsLoading(true);
    try {
      await api.invest(selectedPlan.id, );
      toast.success('Investment successful!');
      setShowInvestModal(false);
      navigate('/home');
    } catch (error: any) {
      toast.error(error.message || 'Investment failed');
    } finally {
      setIsLoading(false);
    }
  };
   
  const [dashboard, setDashboard] = useState<any>(null);

useEffect(() => {
  loadDashboard();
  loadPlans();
}, []);

const loadDashboard = async () => {
  try {
    const res = await api.getDashboard();
    setDashboard(res.data);
  } catch (err) {
    console.error("Failed to load dashboard", err);
  }
 };

  const calculateReturns = (plan: any, amount?: number) => {
  const investmentAmount = amount || plan.price || 0;
  const basePrice = plan.price || 1; // avoid divide by 0
  const dailyReturn = (investmentAmount / basePrice) * (plan.dailyIncome || 0);
  const totalReturn = dailyReturn * (plan.days || 0);
  return { dailyReturn, totalReturn };
};

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <button onClick={() => navigate('/home')} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Investment Plans</h1>
          <p className="text-sm text-gray-400">Choose your investment strategy</p>
        </div>
      </div>

      <Card className="mx-4 mt-4 p-0 overflow-hidden">
       <img 
        src="/assets/images/Bonus.jpg" 
        alt="Bonus Offer" 
       className="w-full h-auto object-contain"
        />
       </Card>

      {/* Investment Plans */}
      <div className="mx-4 mt-6 mb-20">
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        
        <div className="space-y-4">
          {plans.map((plan: any) => {
            const { dailyReturn, totalReturn } = calculateReturns(plan);
            const roi = ((totalReturn - plan.price) / plan.price * 100).toFixed(1);
            
            return (
              <Card key={plan.id} gradient className="p-4">
                <div className="flex items-start gap-4">
                  <img 
                    src="/assets/plans/rupee.jpg" 
                       alt="Rupee Icon"
                       className="w-12 h-12 rounded-full object-contain"
                         />
            
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-lg">{plan.name}</h4>
                      <span className="bg-green-500 text-black px-2 py-1 rounded text-xs font-bold">
                        +{roi}% ROI
                      </span>
                    </div>
                    
                     {plan.description && (
                        <p className="text-sm text-gray-400 mb-2">{plan.description}</p>
                        )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-yellow-500" />
                        <div>
                          <p className="text-sm text-gray-400">Investment</p>
                          <p className="font-semibold">{formatCurrency(plan.price)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-400">Daily Income</p>
                          <p className="font-semibold text-green-500">{formatCurrency(dailyReturn)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-400">Duration</p>
                          <p className="font-semibold">{plan.days} Days</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-400">Total Return</p>
                          <p className="font-semibold text-purple-500">{formatCurrency(totalReturn)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={() => handleInvestNow(plan)} className="w-full">
                     Invest Now
                    </Button>
                    )
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card gradient className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Confirm Investment</h3>
            
            <div className="mb-4">
              <h4 className="font-semibold">{selectedPlan.name}</h4>
              <p className="text-sm text-gray-400">Minimum: {formatCurrency(selectedPlan.price)}</p>
            </div>
            
            <Input
              label="Investment Amount"
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              placeholder="Enter amount"
              className="mb-4"
            />
            
            {investAmount && parseFloat(investAmount) >= selectedPlan.price && (
              <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <h5 className="font-semibold mb-2">Return Calculator</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Daily Income:</span>
                    <span className="text-green-500">
                      {formatCurrency(calculateReturns(selectedPlan, parseFloat(investAmount)).dailyReturn)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Return:</span>
                    <span className="text-purple-500">
                      {formatCurrency(calculateReturns(selectedPlan, parseFloat(investAmount)).totalReturn)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Profit:</span>
                    <span className="text-yellow-500">
                      {formatCurrency(calculateReturns(selectedPlan, parseFloat(investAmount)).totalReturn - parseFloat(investAmount))}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowInvestModal(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmInvestment}
                className="flex-1"
                disabled={isLoading || !investAmount || parseFloat(investAmount) < selectedPlan.price}
              >
                {isLoading ? 'Investing...' : 'Confirm Investment'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Invest;