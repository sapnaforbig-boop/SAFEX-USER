import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/validation';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  Shield, 
  Plus, 
  Minus, 
  Gift, 
  Star, 
  CheckCircle, 
  Briefcase,
  Users,
  Calendar,
  Globe,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ balance: 0, totalEarnings: 0, todayEarnings: 0 });
  const [plans, setPlans] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [language, setLanguage] = useState('EN');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

    const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    { 
      id: 1, 
      text: "“Kyu wait karein returns ka? Sirf ek referral aur aapka pura investment ek din me recover ho sakta hai.”",
      bg: "from-green-500 to-emerald-700",
      icon: "💸"
    },
    { 
      id: 2, 
      text: "⚠️ Don’t open your ID on another device, otherwise you will be permanently blocked.",
      bg: "from-red-500 to-red-700",
      icon: "⚠️"
    },
    { 
      id: 3, 
      text: "“More Refers, More Earn – Ye sab depend karta hai aap par.”",
      bg: "from-indigo-500 to-purple-700",
      icon: "🚀"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const newsItems = [
    'Welcome to SafeXExpress - Start earning today!',
    'Refer friends and earn instant bonuses',
    'New investment plans available with higher returns',
    'Withdrawal service active Mon-Fri 5AM-12PM ',
  ];

  const quickCards = [
    { title: 'My Investments', subtitle: 'Track & Manage', icon: Briefcase, color: 'from-yellow-500 to-yellow-600', route: '/my-investments' },
    { title: 'Lucky Draw', subtitle: 'Win Prizes', icon: Gift, color: 'from-purple-500 to-purple-600' },
    { title: 'VIP Benefits', subtitle: 'Exclusive Offers', icon: Star, color: 'from-blue-500 to-blue-600' },
    { title: 'Team Bonus', subtitle: 'Referral Rewards', icon: Users, color: 'from-orange-500 to-orange-600' },
  ];

  // ✅ keep this effect ONLY for data loads
useEffect(() => {
  loadWallet();
  loadPlans();
}, []);

// ✅ new effect for auto-rotating quotes
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  }, 4000);
  return () => clearInterval(interval);
}, []); // quotes length is constant; empty deps is fine


  const loadWallet = async () => {
    try {
      const walletData = await api.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const loadPlans = async () => {
  try {
    const plansData = await api.getPlans();

    // Agar backend object return kar raha hai { data: [...] }
    const safePlans = Array.isArray(plansData)
      ? plansData
      : Array.isArray(plansData?.data)
      ? plansData.data
      : [];

    setPlans(safePlans);
  } catch (error) {
    console.error('Failed to load plans:', error);
    setPlans([]); // fallback empty array
  }
};

  const handleDailyCheckIn = async () => {
  try {
    await api.dailyCheckIn();
    await loadWallet();
    setHasCheckedIn(true);
    toast.success("Daily check-in successful!");
  } catch (err: any) {
    if (err.message.includes("Already checked in")) {
      setHasCheckedIn(true);
      toast.error("You already checked in today");
    } else {
      toast.error(err.message || "Failed to check-in");
    }
  }
};

  const handleInvest = (planId: string) => {
    navigate(`/invest?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold">SafeXExpress</h1>
            <p className="text-sm text-gray-400">Welcome, {user?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'EN' ? 'हिं' : 'EN')}
            className="px-3 py-1 bg-gray-800 rounded-lg text-sm"
          >
            <Globe className="w-4 h-4 inline mr-1" />
            {language}
          </button>
        </div>
      </div>

      {/* ✅ Quotes Slider */}
      <div className="overflow-hidden rounded-2xl shadow-lg mx-4 mt-4">
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${currentQuote * 100}%)` }}
        >
          {quotes.map((quote) => (
            <div key={quote.id} className="w-full flex-shrink-0">
              <div className={`bg-gradient-to-r ${quote.bg} h-32 flex items-center justify-center p-6`}>
                <p className="text-white italic text-lg font-semibold text-center leading-relaxed">
                  <span className="mr-2 text-2xl">{quote.icon}</span>
                  {quote.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News Ticker */}
      <div className="bg-gray-900 mx-4 mt-4 rounded-lg p-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-yellow-500 mr-8">📢 Latest News:</span>
          {newsItems.map((news, index) => (
            <span key={index} className="text-sm text-gray-300 mr-8">
              {news}
            </span>
          ))}
        </div>
      </div>

      {/* Wallet Card */}
      <Card gradient className="mx-4 mt-4 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">My Wallet</h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => navigate('/recharge')}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Recharge
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/withdraw')}
              className="flex items-center gap-1"
            >
              <Minus size={16} />
              Withdraw
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">{formatCurrency(wallet.balance)}</p>
            <p className="text-sm text-gray-400">Balance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{formatCurrency(wallet.totalEarnings)}</p>
            <p className="text-sm text-gray-400">Total Earnings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{formatCurrency(wallet.todayEarnings)}</p>
            <p className="text-sm text-gray-400">Today</p>
          </div>
        </div>
      </Card>

      {/* Daily Check-in */}
      {!hasCheckedIn && (
        <Card className="mx-4 mt-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-yellow-500" />
              <div>
                <h4 className="font-semibold">Daily Check-in</h4>
                <p className="text-sm text-gray-400">Get +10 bonus points</p>
              </div>
            </div>
            <Button onClick={handleDailyCheckIn}>
              Check In
            </Button>
          </div>
        </Card>
      )}

     {/* Quick Cards in Grid */}
<div className="grid grid-cols-2 gap-4 mx-4 mt-4">
  {quickCards.map((card, index) => (
    <Card
      key={index}
      className="p-4 h-full cursor-pointer hover:scale-105 transition-transform"
      onClick={() => card.route && navigate(card.route)}
    >
      <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center mb-3`}>
        <card.icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="font-semibold text-sm">{card.title}</h4>
      <p className="text-xs text-gray-400">{card.subtitle}</p>
    </Card>
      ))}
     </div>
      {/* Investment Plans */}
      <div className="mx-4 mt-6 mb-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Investment Plans</h3>
          <button 
            onClick={() => navigate('/invest')}
            className="text-yellow-500 flex items-center gap-1 text-sm"
          >
            View All <ChevronRight size={16} />
          </button>
        </div>
        
<div className="space-y-4">
  {(plans || []).slice(0, 3).map((plan: any, index: number) => (
    <Card key={plan._id || plan.id || index} gradient className="p-4">
      <div className="flex items-center gap-4">
        <img 
           src="/assets/plans/rupee.jpg" 
            alt="Rupee Icon"
             className="w-12 h-12 rounded-full object-contain"
              />

        <div className="flex-1">
          <h4 className="font-semibold">{plan.name}</h4>
          <p className="text-xs text-gray-400">{plan.description}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-yellow-500 font-bold">₹{formatCurrency(plan.price)}</span>
            <span className="text-green-500 text-sm">
              +{formatCurrency(plan.dailyIncome)}/day
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full"
                style={{ width: `${(plan.progress || 0) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{plan.days} days</span>
          </div>
        </div>
        <Button size="sm" onClick={() => handleInvest(plan._id || plan.id)}>
          Invest
        </Button>
      </div>
    </Card>
  ))}
  </div>
      </div>
    </div>
  );
};

export default Home;