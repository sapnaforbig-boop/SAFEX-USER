import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePhone, validatePassword, validateOTP } from '../utils/validation';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { ArrowLeft, Phone, Lock } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(formData.phone)) {
      setErrors({ phone: 'Enter valid 10-digit mobile number' });
      return;
    }

    setIsLoading(true);
    try {
      const success = await forgotPassword(formData.phone);
      if (success) {
        setStep(2);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOTP(formData.otp)) {
      setErrors({ otp: 'Enter valid 6-digit OTP' });
      return;
    }

    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const success = await resetPassword({
        phone: formData.phone,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      
      if (success) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/login" className="text-white mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Reset Password</h1>
            <p className="text-gray-400 text-sm">
              {step === 1 && 'Enter your mobile number'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'Create new password'}
            </p>
          </div>
        </div>

        <Card gradient className="p-6">
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Mobile Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="Enter registered mobile number"
                maxLength={10}
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-6">
                <Phone className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-400">OTP sent to</p>
                <p className="text-yellow-500 font-semibold">+91 {formData.phone}</p>
              </div>

              <Input
                label="OTP Code"
                type="text"
                value={formData.otp}
                onChange={(e) => handleInputChange('otp', e.target.value)}
                error={errors.otp}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                disabled={isLoading}
                className="text-center text-xl tracking-widest"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                Verify OTP
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-6">
                <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-white font-semibold">Create New Password</p>
              </div>

              <Input
                label="New Password"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                error={errors.newPassword}
                placeholder="Enter new password"
                disabled={isLoading}
              />

              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="Re-enter new password"
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;