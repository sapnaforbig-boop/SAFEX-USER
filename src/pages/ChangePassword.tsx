import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { validatePassword } from '../utils/validation';
import Card from '../components/Card';
import { XCircle } from "lucide-react";
import Button from '../components/Button';
import Input from '../components/Input';
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();

  // ✅ formData state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // ✅ simple check (backend format ke hisaab se)
  const isFormValid = () => {
    if (!formData.currentPassword.trim()) return false;
    if (!validatePassword(formData.newPassword)) return false;
    if (formData.newPassword !== formData.confirmPassword) return false;
    if (formData.currentPassword === formData.newPassword) return false;
    return true;
  };

  // ✅ auto update button state
  useEffect(() => {
    setIsValid(isFormValid());
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    try {
      // ✅ backend format me request
      await api.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success('Password changed successfully!');
      navigate('/me');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-900 to-black">
        <button onClick={() => navigate('/me')} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Change Password</h1>
          <p className="text-sm text-gray-400">Update your account password</p>
        </div>
      </div>

      {/* Change Password Form */}
      <Card gradient className="mx-4 mt-4 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-yellow-500" />
          Update Password
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="relative">
            <Input
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <Input
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Enter new password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Re-enter new password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div className="flex items-center gap-2 text-sm">
              {formData.newPassword === formData.confirmPassword ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Passwords match</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">Passwords don't match</span>
                </>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;
