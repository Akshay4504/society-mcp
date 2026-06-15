import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearCredentials } from '../store/slices/authSlice';
import { 
  Building, LayoutDashboard, Wrench, CreditCard, Users, Megaphone, BarChart3, LogOut, User, Activity, Database
} from 'lucide-react';
import { axiosClient } from '../api/axiosClient';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate('/login');
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axiosClient.get('/health', { baseURL: '' });
        if (res.status === 200) {
          setApiStatus('connected');
        } else {
          setApiStatus('offline');
        }
      } catch (err) {
        setApiStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Support Desk', path: '/complaints', icon: <Wrench size={16} /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={16} /> },
    { name: 'Residents', path: '/residents', icon: <Users size={16} /> },
    { name: 'Notices', path: '/notices', icon: <Megaphone size={16} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#08090d] text-gray-200">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-cardBg/30 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between p-6 glass-panel shrink-0">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-accentPurple to-accentIndigo text-white shadow-glow">
              <Building size={20} />
            </div>
            <div>
              <h2 className="text-base font-display font-extrabold text-white text-glow-purple">
                SMM SYSTEM
              </h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">AI Residential Hub</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition duration-150 border ${
                    isActive
                      ? 'bg-accentPurple/10 text-accentPurple border-accentPurple/25 shadow-glow'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer block */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 text-gray-300 border border-white/5">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-accentRose/10 hover:text-accentRose text-gray-400 rounded-xl py-2.5 text-xs font-semibold border border-white/5 hover:border-accentRose/20 transition"
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Main top header */}
        <header className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#08090d]/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Workspace</span>
            <span className="text-xs text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-semibold capitalize">
              Society Portal
            </span>
          </div>

          {/* Connection status pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-darkBg/60 border border-white/5 rounded-full py-1.5 px-3">
              <Activity
                size={12}
                className={apiStatus === 'connected' ? 'text-accentEmerald animate-pulse' : 'text-accentRose'}
              />
              <span className="text-[10px] text-gray-400">
                {apiStatus === 'checking' ? 'Connecting API...' : apiStatus === 'connected' ? 'API Online' : 'API Offline'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-darkBg/60 border border-white/5 rounded-full py-1.5 px-3">
              <Database size={12} className="text-accentCyan" />
              <span className="text-[10px] text-gray-400">DB Peered</span>
            </div>
          </div>
        </header>

        {/* Content Body viewport */}
        <div className="flex-1 p-8 overflow-y-auto max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
