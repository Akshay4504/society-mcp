import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { setCredentials } from '../store/slices/authSlice';
import { axiosClient } from '../api/axiosClient';
import { Building, Lock, Mail, Phone, User, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'ResidentOwner',
    societyName: '',
    adminCode: '',
    block: '',
    flatNumber: '',
    areaSqFt: 0
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await axiosClient.post('/auth/login', credentials);
      return res.data.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      }));
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: userData.role,
        societyName: userData.societyName || undefined,
        adminCode: userData.role === 'SocietyAdmin' ? userData.adminCode : undefined,
        flatDetails: userData.block && userData.flatNumber ? {
          block: userData.block,
          flatNumber: userData.flatNumber,
          areaSqFt: Number(userData.areaSqFt) || 0,
          occupancyStatus: userData.role === 'ResidentOwner' ? 'occupied' : 'rented'
        } : undefined
      };
      const res = await axiosClient.post('/auth/register', payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      }));
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check inputs.');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isRegister) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }
      registerMutation.mutate(formData);
    } else {
      if (!formData.email || !formData.password) {
        setErrorMsg('Email and password are required.');
        return;
      }
      loginMutation.mutate({ email: formData.email, password: formData.password });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08090d] relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accentPurple/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accentCyan/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl z-10 border border-white/5 relative shadow-2xl">
        
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-accentPurple to-accentIndigo text-white shadow-glow mb-4">
            <Building size={28} />
          </div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-white mb-1">
            SMM RESIDENTIAL SYSTEM
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={12} className="text-accentPurple" />
            AI-Powered Portal Hub
          </p>
        </div>

        {/* Errors */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-2.5 bg-accentRose/10 border border-accentRose/20 rounded-xl p-3.5 text-xs text-accentRose">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name *"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
            <input
              type="password"
              name="password"
              placeholder="Password *"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
            />
          </div>

          {isRegister && (
            <>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
              </div>

              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition appearance-none"
                >
                  <option value="ResidentOwner">Resident (Owner)</option>
                  <option value="ResidentTenant">Resident (Tenant)</option>
                  <option value="SocietyAdmin">Society Admin / Secretary</option>
                  <option value="Staff">Society Staff</option>
                  <option value="Vendor">Third-party Vendor</option>
                </select>
              </div>

              <div className="relative">
                <Building className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  name="societyName"
                  placeholder="Society Name (to create or join)"
                  value={formData.societyName}
                  onChange={handleChange}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
              </div>

              {formData.role === 'SocietyAdmin' && (
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type="password"
                    name="adminCode"
                    placeholder="Admin Verification Code *"
                    value={formData.adminCode}
                    onChange={handleChange}
                    className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="block"
                  placeholder="Block (A, B...)"
                  value={formData.block}
                  onChange={handleChange}
                  className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
                <input
                  type="text"
                  name="flatNumber"
                  placeholder="Flat No."
                  value={formData.flatNumber}
                  onChange={handleChange}
                  className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
                <input
                  type="number"
                  name="areaSqFt"
                  placeholder="Area SqFt"
                  value={formData.areaSqFt || ''}
                  onChange={handleChange}
                  className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-accentPurple to-accentIndigo hover:from-accentPurple/95 hover:to-accentIndigo/95 disabled:opacity-50 shadow-glow hover:shadow-glow/120 transition active:scale-[0.99]"
          >
            {isLoading ? 'Processing Request...' : isRegister ? 'Create Resident Profile' : 'Authenticate Credentials'}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
            }}
            className="ml-1.5 font-semibold text-accentPurple hover:text-white transition outline-none"
          >
            {isRegister ? 'Login here' : 'Register your flat'}
          </button>
        </div>
      </div>
    </div>
  );
};
