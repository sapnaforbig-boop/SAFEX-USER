import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePhone, validatePassword } from '../utils/validation';
import { getStoredDeviceId } from '../utils/device';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { Shield, Smartphone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Enter valid 10-digit mobile number';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    const deviceId = getStoredDeviceId();  // ✅ yahan se nikal lo
    const success = await login(formData.phone, formData.password, deviceId);

    if (success) {
      navigate('/home');
    } else {
      toast.error('Invalid credentials');
    }
  } catch (err: any) {
    toast.error(err.message || 'Login failed');
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
          <p className="text-gray-400">Welcome Back</p>
        </div>

        <Card gradient className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Mobile Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="Enter your mobile number"
              maxLength={10}
              disabled={isLoading}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-yellow-500 hover:text-yellow-400"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-yellow-500 hover:text-yellow-400">
                Register Now
              </Link>
            </p>
          </div>
        </Card>

        {/* Device Security Notice */}
        <Card className="p-4 mt-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-white font-medium">Device Security</p>
              <p className="text-xs text-gray-400">
                Your account is linked to this device for security
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
