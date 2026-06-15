import React, { useState } from 'react';
import { Lock, Mail, User, Phone, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('resident@emerald.com');
  const [password, setPassword] = useState('password123');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'ResidentOwner' | 'SocietyAdmin' | 'Vendor'>('ResidentOwner');
  const [societyName, setSocietyName] = useState('Emerald Greens');
  const [flatBlock, setFlatBlock] = useState('A');
  const [flatNo, setFlatNo] = useState('402');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleDemoFill = (selectedRole: 'ResidentOwner' | 'SocietyAdmin' | 'Vendor') => {
    setRole(selectedRole);
    if (selectedRole === 'ResidentOwner') {
      setEmail('resident@emerald.com');
      setPassword('password123');
    } else if (selectedRole === 'SocietyAdmin') {
      setEmail('admin@emerald.com');
      setPassword('admin123');
    } else {
      setEmail('plumber@primefix.com');
      setPassword('vendor123');
    }
    setError('');
    setInfoMessage(`Pre-filled login details for ${selectedRole}`);
    setTimeout(() => setInfoMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
    const payload = isRegister ? {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      societyName,
      flatDetails: {
        block: flatBlock,
        flatNumber: flatNo,
        areaSqFt: 1200,
        occupancyStatus: 'occupied'
      }
    } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      onLoginSuccess(data.data.token, data.data.user);
    } catch (err: any) {
      setError(err.message || 'Connection to backend failed. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Brand & AI Pitch Panel */}
        <div className="md:col-span-5 flex flex-col justify-between p-8 rounded-2xl glass-panel neon-border-purple relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accentPurple/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accentCyan/10 rounded-full blur-3xl -z-10"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-accentPurple to-accentIndigo text-white shadow-glow">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h1 className="text-xl font-display font-extrabold tracking-wide text-glow-purple">
                  SMM <span className="text-accentCyan text-sm font-medium">v1.0</span>
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">AI Housing System</p>
              </div>
            </div>

            <h2 className="text-2xl font-display font-bold text-white leading-tight mb-4">
              Modern Society Management, <span className="gradient-text-purple-cyan">Elevated by AI.</span>
            </h2>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Experience the next generation of cooperative living. Log issues in natural language, pay maintenance automatically, and monitor facility telemetry in real time.
            </p>

            {/* AI Capabilities List */}
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-accentPurple mt-2"></div>
                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">AI Ticket Triage:</span> Immediate classification, sentiment check, and priority tagging.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-accentCyan mt-2"></div>
                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">Telemetry Scoring:</span> Predictive failure flags on key machinery.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-accentIndigo mt-2"></div>
                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">Multilingual Translate:</span> Notices auto-translated to Hindi/Marathi.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[11px] text-gray-500">
              Designed & Engineered for Production Grade housing sectors.
            </p>
          </div>
        </div>

        {/* Right Side: Credentials Screen */}
        <div className="md:col-span-7 flex flex-col justify-center p-8 sm:p-10 rounded-2xl glass-panel relative">
          
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-display font-bold text-white">
                {isRegister ? 'Create Resident Account' : 'Welcome Back'}
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                {isRegister ? 'Register your flat and begin' : 'Sign in to access your dashboard'}
              </p>
            </div>
            
            {/* Quick Demo Pre-fill buttons */}
            {!isRegister && (
              <div className="hidden sm:flex gap-1.5 bg-darkBg/60 p-1 rounded-lg border border-white/5">
                <button 
                  onClick={() => handleDemoFill('ResidentOwner')}
                  className="text-[10px] px-2 py-1 rounded bg-accentPurple/20 text-accentPurple border border-accentPurple/30 hover:bg-accentPurple/30 transition"
                >
                  Demo User
                </button>
                <button 
                  onClick={() => handleDemoFill('SocietyAdmin')}
                  className="text-[10px] px-2 py-1 rounded bg-accentCyan/20 text-accentCyan border border-accentCyan/30 hover:bg-accentCyan/30 transition"
                >
                  Demo Admin
                </button>
              </div>
            )}
          </div>

          {infoMessage && (
            <div className="mb-4 text-xs bg-accentIndigo/10 text-accentIndigo border border-accentIndigo/30 rounded-lg p-2.5">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 text-xs bg-accentRose/10 text-accentRose border border-accentRose/30 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      required
                      placeholder="Jane"
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accentPurple focus:shadow-glow transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Doe"
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accentPurple focus:shadow-glow transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-500" size={16} />
                <input 
                  type="email" 
                  required
                  placeholder="jane.doe@example.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accentPurple focus:shadow-glow transition"
                />
              </div>
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      required
                      placeholder="+1234567890"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accentPurple focus:shadow-glow transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Society Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Emerald Greens"
                    value={societyName} 
                    onChange={(e) => setSocietyName(e.target.value)}
                    className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accentPurple focus:shadow-glow transition"
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Block</label>
                  <input 
                    type="text" 
                    placeholder="A"
                    value={flatBlock} 
                    onChange={(e) => setFlatBlock(e.target.value)}
                    className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white text-center focus:outline-none focus:border-accentPurple transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Flat No</label>
                  <input 
                    type="text" 
                    placeholder="402"
                    value={flatNo} 
                    onChange={(e) => setFlatNo(e.target.value)}
                    className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white text-center focus:outline-none focus:border-accentPurple transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Register As</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 px-2 text-xs text-white focus:outline-none focus:border-accentPurple transition"
                  >
                    <option value="ResidentOwner">Owner</option>
                    <option value="ResidentTenant">Tenant</option>
                    <option value="SocietyAdmin">Admin</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-500" size={16} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accentPurple focus:shadow-glow transition"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl py-3.5 font-semibold text-sm hover:shadow-glow hover:brightness-110 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegister ? 'Complete Registration' : 'Secure Login'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Pre-fills for mobile */}
          {!isRegister && (
            <div className="flex sm:hidden flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-[10px] text-gray-500 uppercase">Demo logins:</span>
              <button 
                onClick={() => handleDemoFill('ResidentOwner')}
                className="text-[10px] px-2 py-0.5 rounded bg-accentPurple/15 text-accentPurple"
              >
                Resident
              </button>
              <button 
                onClick={() => handleDemoFill('SocietyAdmin')}
                className="text-[10px] px-2 py-0.5 rounded bg-accentCyan/15 text-accentCyan"
              >
                Admin
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-gray-400 hover:text-accentPurple transition"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register flat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
