import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/validation';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  ArrowLeft,
  User,
  Wallet,
  CreditCard,
  Download,
  Settings,
  LogOut,
  History,
  Banknote,
  Lock,
  Smartphone,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

// ---- TELEGRAM / WHATSAPP CONFIG & HANDLERS (single clean block) ----

// use your exact username string here (case-insensitive)
const TELEGRAM_USERNAME = "SafeXExcpress"
  .replace(/^https?:\/\/t\.me\/?/, '')
  .replace(/^@+/, '')
  .trim();

// Build URLs (single declaration)
const telegramWeb = TELEGRAM_USERNAME ? `https://t.me/${TELEGRAM_USERNAME}` : '';
const telegramApp = TELEGRAM_USERNAME ? `tg://resolve?domain=${TELEGRAM_USERNAME}` : '';

// WhatsApp: ensure number is digits only (you can set VITE_WHATSAPP_URL env or keep empty)
const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_URL || "")
  .replace(/^\+/, '')
  .replace(/\D/g, '')
  .trim();

const whatsappWeb = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I need support')}`
  : '';

// Robust openTelegram with visibility fallback
const openTelegram = () => {
  if (!TELEGRAM_USERNAME) {
    alert('Telegram handle not configured');
    return;
  }

  let opened = false;

  const onVisibilityChange = () => {
    if (document.hidden) {
      opened = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  try {
    // try native app first
    window.location.href = telegramApp;
  } catch (err) {
    // ignore
  }

  // if app didn't open, fallback to web after 800ms
  setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (!opened) {
      window.open(telegramWeb, '_blank');
    }
  }, 800);
};

const openWhatsApp = () => {
  if (!WHATSAPP_NUMBER) {
    alert('WhatsApp number not configured');
    return;
  }
  window.open(whatsappWeb, '_blank');
};

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ balance: 0, totalEarnings: 0, todayEarnings: 0 });

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const walletData = await api.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDownloadAPK = () => {
    const link = document.createElement('a');
    link.href = '/safexexpress.apk';
    link.download = 'SafeXExpress.apk';
    link.click();
    toast.success('APK download started');
  };

  const handleInstallPWA = () => {
    // Check if PWA can be installed
    if ('serviceWorker' in navigator) {
      toast.success('Add to home screen from browser menu');
    }
  };

  const menuItems = [
    {
  title: 'Funding Records',
  subtitle: 'View recharge history',
  icon: CreditCard,
  action: () => {
    toast.success("Navigating to Funding Records...");
    navigate('/funding-records');
  },
  color: 'text-green-500'
    },
    {
      title: 'Withdraw Records',
      subtitle: 'View withdrawal history',
      icon: Banknote,
      action: () => navigate('/withdraw-records'),
      color: 'text-blue-500'
    },
    {
      title: 'Bank Details',
      subtitle: 'Manage payment methods',
      icon: Wallet,
      action: () => navigate('/bank-details'),
      color: 'text-yellow-500'
    },
    {
      title: 'Change Password',
      subtitle: 'Update your password',
      icon: Lock,
      action: () => navigate('/change-password'),
      color: 'text-purple-500'
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <button onClick={() => navigate('/home')} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">My Profile</h1>
          <p className="text-sm text-gray-400">Manage your account</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card gradient className="mx-4 mt-4 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-black" />
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-black" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{user?.name}</h3>
            <p className="text-gray-400">+91 {user?.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-500 font-mono text-sm">UID: {user?.uid || '51500001'}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-500 text-sm">Verified</span>
            </div>
          </div>
        </div>

        {/* Wallet Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-black/30 rounded-xl">
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-500">{formatCurrency(wallet.balance)}</p>
            <p className="text-xs text-gray-400">Balance</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-500">{formatCurrency(wallet.totalEarnings)}</p>
            <p className="text-xs text-gray-400">Earnings</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-500">{formatCurrency(wallet.todayEarnings)}</p>
            <p className="text-xs text-gray-400">Today</p>
          </div>
        </div>
      </Card>

      {/* Menu Items */}
      <div className="mx-4 mt-6 space-y-3">
        {menuItems.map((item, index) => (
          <Card key={index} className="p-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={item.action}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${item.color} bg-gray-800 rounded-lg flex items-center justify-center`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-gray-400">{item.subtitle}</p>
              </div>
              <div className="text-gray-400">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* App Download Section */}
      <Card gradient className="mx-4 mt-6 p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Download className="w-5 h-5 text-yellow-500" />
          Download App
        </h4>
        
        <div className="space-y-3">
          <Button onClick={handleDownloadAPK} variant="outline" className="w-full flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4" />
            Download APK
          </Button>
          
          <Button onClick={handleInstallPWA} variant="outline" className="w-full flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Install PWA
          </Button>
        </div>
        
        <p className="text-xs text-gray-400 mt-2">
          Install our app for the best experience and offline access
        </p>
      </Card>
       
       {/* Contact Us Section */}
<Card
  gradient
  className="mx-4 mt-6 p-4 h-auto border border-yellow-600 bg-gray-900/80"
>
  <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-400">
    <Settings className="w-5 h-5 text-yellow-400" />
    Contact Support
  </h4>

  <div className="space-y-3">
    <button
  onClick={openTelegram}
  className="w-full px-4 py-2 border border-blue-400 text-blue-400 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-400 hover:text-black transition-colors"
>
  <User className="w-4 h-4" />
  Telegram Support
</button>

<button
  onClick={openWhatsApp}
  className="w-full px-4 py-2 border border-green-500 text-green-500 rounded-lg flex items-center justify-center gap-2 hover:bg-green-500 hover:text-black transition-colors"
>
  <Smartphone className="w-4 h-4" />
  WhatsApp Support
</button>
  </div>

  <p className="text-xs text-gray-400 mt-3 text-center">
    Our support team is available 24×7 to help you.
  </p>
</Card>
      {/* Logout */}
      <div className="mx-4 mt-6 mb-20">
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;