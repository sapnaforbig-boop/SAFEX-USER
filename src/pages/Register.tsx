import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validatePhone, validatePassword, validateOTP } from '../utils/validation';
import { getStoredDeviceId } from '../utils/device';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { Shield, Phone, Lock, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api'; 

const Register: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Register, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    otp: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Enter valid 10-digit mobile number';
    if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================
  // STEP 1: Send OTP
  // ============================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // सिर्फ OTP भेजना है
      const response = await api.sendOtp({ phone: formData.phone });
      if (response) {
        setStep(2);
        toast.success('OTP sent to your mobile number');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================================
  // STEP 2: Verify OTP & Register
  // ==================================
  // STEP 2: Verify OTP & Register
const handleOtpVerification = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateOTP(formData.otp)) {
    setErrors({ otp: 'Enter valid 6-digit OTP' });
    return;
  }

  setIsLoading(true);
  try {
    const deviceId = getStoredDeviceId();
    const res = await api.verifyOtp({
      name: formData.name,
      phone: formData.phone,
      password: formData.password,
      referralCode: formData.referralCode || null,
      deviceId,
      otp: formData.otp,
    });

    const accessToken = res?.data?.accessToken;
    const refreshToken = res?.data?.refreshToken;
    const userData = res?.data?.user;

    if (!accessToken || !userData) {
      throw new Error("Invalid registration response");
    }

    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    toast.success('Registration completed successfully!');
    navigate('/home');
  } catch (error: any) {
    toast.error(error.message || 'OTP verification failed');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">SafeXExpress</h1>
          <p className="text-gray-400">Create Your Account</p>
        </div>

        <Card gradient className="p-6">
          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input label="Full Name" type="text" value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name} placeholder="Enter your full name" disabled={isLoading} />

              <Input label="Mobile Number" type="tel" value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone} placeholder="10-digit mobile number" maxLength={10} disabled={isLoading} />

              <Input label="Password" type="password" value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password} placeholder="Minimum 6 characters" disabled={isLoading} />

              <Input label="Confirm Password" type="password" value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword} placeholder="Re-enter password" disabled={isLoading} />

              <Input label="Referral Code (Optional)" type="text" value={formData.referralCode}
                onChange={(e) => handleInputChange('referralCode', e.target.value)}
                placeholder="Enter referral code" disabled={isLoading} />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Register & Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div className="text-center mb-6">
                <Phone className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white">Verify OTP</h3>
                <p className="text-gray-400">Enter the 6-digit code sent to</p>
                <p className="text-yellow-500 font-semibold">+91 {formData.phone}</p>
              </div>

              <Input label="OTP Code" type="text" value={formData.otp}
                onChange={(e) => handleInputChange('otp', e.target.value)}
                error={errors.otp} placeholder="Enter 6-digit OTP" maxLength={6}
                disabled={isLoading} className="text-center text-xl tracking-widest" />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying OTP...' : 'Verify & Complete Registration'}
              </Button>

              <Button type="button" variant="outline" className="w-full"
                onClick={() => setStep(1)} disabled={isLoading}>
                Change Phone Number
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-500 hover:text-yellow-400">
                Sign In
              </Link>
            </p>
          </div>
        </Card>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <Shield className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Secure</p>
          </div>
          <div className="text-center">
            <Gift className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Rewards</p>
          </div>
          <div className="text-center">
            <Lock className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Protected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
