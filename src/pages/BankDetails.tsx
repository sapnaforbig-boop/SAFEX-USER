import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { 
  ArrowLeft,  
  Building2,
  Smartphone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BankDetails {
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  holderName: string;
  upiId: string;
}

const BankDetails: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BankDetails>({
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    holderName: '',
    upiId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingDetails, setHasExistingDetails] = useState(false);

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      const bankData = await api.getBankDetails();
      if (bankData) {
        setFormData({
          accountNumber: bankData.accountNumber || '',
          confirmAccountNumber: bankData.accountNumber || '',
          ifscCode: bankData.ifscCode || '',
          holderName: bankData.holderName || '',
          upiId: bankData.upiId || '',
        });
        setHasExistingDetails(true);
      }
    } catch (error) {
      console.error('Failed to load bank details:', error);
    }
  };

  const handleInputChange = (field: keyof BankDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Account Number validation
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 9-18 digits';
    }

    // Confirm Account Number validation
    if (!formData.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Please confirm account number';
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    // IFSC Code validation
    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    // Holder Name validation
    if (!formData.holderName.trim()) {
      newErrors.holderName = 'Account holder name is required';
    } else if (formData.holderName.trim().length < 2) {
      newErrors.holderName = 'Name must be at least 2 characters';
    }

    // UPI ID validation
    if (!formData.upiId.trim()) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
      newErrors.upiId = 'Invalid UPI ID format (e.g., user@paytm)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    const bankData = {
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode.toUpperCase(),
      holderName: formData.holderName.trim(),
      upiId: formData.upiId.toLowerCase(),
    };

    await api.saveBankDetails(bankData);

    toast.success(
      hasExistingDetails
        ? "Bank details updated successfully!"
        : "Bank details added successfully!"
    );

    // ✅ Refresh user profile after saving
    const updatedUser = await api.getProfile();
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setHasExistingDetails(true);
  } catch (error: any) {
    toast.error(error.message || "Failed to save bank details");
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
          <h1 className="text-xl font-bold">Bank Details</h1>
          <p className="text-sm text-gray-400">
            {hasExistingDetails ? 'Update your bank information' : 'Add your bank information'}
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <Card className="mx-4 mt-4 p-4 border-yellow-500/50 bg-yellow-500/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Important Notice</p>
            <ul className="text-xs text-gray-300 mt-1 space-y-1">
              <li>• Bank details are required for withdrawals</li>
              <li>• Ensure all information is accurate to avoid delays</li>
              <li>• Account holder name must match your profile name</li>
              <li>• Details will be verified before first withdrawal</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Bank Details Form */}
      <Card gradient className="mx-4 mt-4 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-yellow-500" />
          Bank Account Information
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Number */}
          <Input
            label="Account Number"
            type="text"
            value={formData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
            error={errors.accountNumber}
            placeholder="Enter your bank account number"
            maxLength={18}
            disabled={isLoading}
          />

          {/* Confirm Account Number */}
          <Input
            label="Confirm Account Number"
            type="text"
            value={formData.confirmAccountNumber}
            onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value.replace(/\D/g, ''))}
            error={errors.confirmAccountNumber}
            placeholder="Re-enter your account number"
            maxLength={18}
            disabled={isLoading}
          />

          {/* IFSC Code */}
          <Input
            label="IFSC Code"
            type="text"
            value={formData.ifscCode}
            onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
            error={errors.ifscCode}
            placeholder="Enter IFSC code (e.g., SBIN0001234)"
            maxLength={11}
            disabled={isLoading}
            className="uppercase"
          />

          {/* Account Holder Name */}
          <Input
            label="Account Holder Name"
            type="text"
            value={formData.holderName}
            onChange={(e) => handleInputChange('holderName', e.target.value)}
            error={errors.holderName}
            placeholder="Enter name as per bank account"
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading 
              ? (hasExistingDetails ? 'Updating...' : 'Saving...') 
              : (hasExistingDetails ? 'Update Bank Details' : 'Save Bank Details')
            }
          </Button>
        </form>
      </Card>

      {/* UPI Details */}
      <Card gradient className="mx-4 mt-4 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-yellow-500" />
          UPI Information
        </h3>

        <div className="space-y-4">
          <Input
            label="UPI ID"
            type="text"
            value={formData.upiId}
            onChange={(e) => handleInputChange('upiId', e.target.value.toLowerCase())}
            error={errors.upiId}
            placeholder="Enter UPI ID (e.g., user@paytm)"
            disabled={isLoading}
            className="lowercase"
          />

          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-300 mb-2">Supported UPI Apps:</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>🟢 Google Pay</span>
              <span>🟣 PhonePe</span>
              <span>🔵 Paytm</span>
              <span>🟠 BHIM</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Verification Status */}
      {hasExistingDetails && (
        <Card className="mx-4 mt-4 mb-20 p-4 border-green-500/50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="font-semibold text-green-500">Bank Details Saved</h4>
              <p className="text-sm text-gray-400">
                Your bank details are saved and will be verified during your first withdrawal
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BankDetails;