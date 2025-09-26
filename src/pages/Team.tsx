import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/validation';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  Users, 
  Copy, 
  Share, 
  TrendingUp, 
  Award,
  UserPlus,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Team: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [referralTree, setReferralTree] = useState<any>(null);
const [referralBonus, setReferralBonus] = useState<number>(0);


  const referralLink = `https://safexexpress.app/register?ref=${user?.referral?.code}`;

  

useEffect(() => {
  const loadReferralData = async () => {
    try {
      const res = await api.getReferral(); // returns object directly
      // backend returns data: { referralCode, totalEarnings, directReferrals, levelStats }
      // For safety:
      setReferralTree(res || {});
      setReferralBonus(res?.totalEarnings || 0);
    } catch (error) {
      console.error('Failed to load referral data', error);
      toast.error("Failed to load referral data");
    }
  };
  loadReferralData();
}, []);


  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join SafeXExpress',
        text: 'Start earning with SafeXExpress. Use my referral code to get started!',
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <button onClick={() => navigate('/home')} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">My Team</h1>
          <p className="text-sm text-gray-400">Manage your referral network</p>
        </div>
      </div>

      {/* Profile Info */}
      <Card gradient className="mx-4 mt-4 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{user?.name}</h3>
            <p className="text-gray-400">UID: {user?.uid || 'N/A'}</p>
            <p className="text-yellow-500 font-mono">Code: {(user as any)?.referral?.code || "N/A"}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">
               {(referralTree?.levelStats?.A?.count || 0) +
                (referralTree?.levelStats?.B?.count || 0) +
                 (referralTree?.levelStats?.C?.count || 0)}
                  </p>
            <p className="text-sm text-gray-400">Total Team</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{formatCurrency(referralBonus)}</p>
            <p className="text-sm text-gray-400">Referral Bonus</p>
          </div>
        </div>
      </Card>

      {/* Referral Link */}
      <Card className="mx-4 mt-4 p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Share className="w-5 h-5 text-yellow-500" />
          Referral Link
        </h4>
        
        <div className="bg-gray-800 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-300 break-all font-mono">
            {referralLink}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleCopyLink} className="flex-1 flex items-center justify-center gap-2">
            <Copy size={16} />
            Copy Link
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1 flex items-center justify-center gap-2">
            <Share size={16} />
            Share
          </Button>
        </div>
      </Card>

      {/* Referral Tree */}
      <div className="mx-4 mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-500" />
          Referral Commission Structure
        </h3>
        
        <div className="space-y-4">
          {['A', 'B', 'C'].map((level) => {
            const levelData = referralTree?.levelStats?.[level] || { count: 0, earnings: 0 };
            const color = level === 'A' ? 'from-yellow-500 to-yellow-600' : level === 'B' ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600';
            const commission = level === 'A' ? '7%' : level === 'B' ? '2%' : '1%';
            const description = level === 'A' ? 'Direct referrals' : level === 'B' ? 'Second level referrals' : 'Third level referrals';

            return (
              <Card key={level} gradient className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
                    <span className="text-white font-bold">{level}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">Level {level}</h4>
                      <span className="text-yellow-500 font-bold">{commission}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{description}</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <UserPlus className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{levelData.count} Members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm">{formatCurrency(levelData.earnings)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Team Details */}
      <div className="mx-4 mt-6 mb-20">
        <Card gradient className="p-4">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-500" />
            Team Details
          </h4>

          {['A', 'B', 'C'].map((level) => {
            const levelData = referralTree?.levelStats?.[level] || { members: [], count: 0, invested: 0 };

            return (
              <details key={level} className="mb-4">
                <summary className="cursor-pointer font-semibold text-white flex justify-between items-center">
                  <span>Level {level} — {levelData.count} Members</span>
                  <span className="text-yellow-400">
                    Total Invested: {formatCurrency(levelData.invested || 0)}
                  </span>
                </summary>

                <div className="mt-3 space-y-2">
                  {levelData.members && levelData.members.length > 0 ? (
                    levelData.members.map((m: any) => (
                      <div
                        key={m._id}
                        className="p-3 rounded-lg bg-gray-800 flex justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">{m.name || "N/A"}</p>
                          <p className="text-gray-400">{m.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400">
                            Invested: {formatCurrency(m.wallet?.totalInvested || 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(m.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No members in this level.</p>
                  )}
                </div>
              </details>
            );
          })}

          {/* Overall total */}
          <div className="mt-4 p-3 rounded-lg bg-black text-center">
            <p className="font-bold text-yellow-500">
              Total Invested (A+B+C):{" "}
              {formatCurrency(
                (referralTree?.levelStats?.A?.invested || 0) +
                (referralTree?.levelStats?.B?.invested || 0) +
                (referralTree?.levelStats?.C?.invested || 0)
              )}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Team;
