import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
import { 
  Wrench, CreditCard, Users, Megaphone, Sparkles, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Queries
  const { data: complaints = [] } = useQuery<any[]>({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await axiosClient.get('/complaints');
      return res.data.data;
    }
  });

  const { data: residents = [] } = useQuery<any[]>({
    queryKey: ['residents'],
    queryFn: async () => {
      const res = await axiosClient.get('/residents');
      return res.data.data;
    },
    enabled: user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin' || user?.role === 'Staff'
  });

  const { data: notices = [] } = useQuery<any[]>({
    queryKey: ['notices'],
    queryFn: async () => {
      const res = await axiosClient.get('/notices');
      return res.data.data;
    }
  });

  const { data: payments = [] } = useQuery<any[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await axiosClient.get('/payments');
      return res.data.data;
    }
  });

  // Calculations
  const openComplaintsCount = complaints.filter((c: any) => c.status === 'Open' || c.status === 'Assigned' || c.status === 'In-Progress').length;
  const recentNotices = notices.slice(0, 3);
  const recentPayments = payments.slice(0, 4);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-white/5 shadow-glow">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accentPurple/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-accentPurple uppercase tracking-wider">
              <Sparkles size={14} />
              Portal Workspace
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-sm text-gray-400">
              Manage requests, bills, flat details, and notice updates for your society.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
            <ShieldCheck size={18} className="text-accentEmerald" />
            <div className="text-left">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Access Clearance</p>
              <p className="text-xs font-bold text-white capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Support Desk Metric */}
        <Link to="/complaints" className="glass-panel p-6 rounded-2xl glass-panel-hover flex justify-between items-center group">
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Open Tickets</p>
            <p className="text-3xl font-display font-extrabold text-white">{openComplaintsCount}</p>
            <p className="text-[10px] text-accentPurple font-semibold flex items-center gap-1 group-hover:underline">
              Support Desk <ArrowRight size={10} />
            </p>
          </div>
          <div className="p-4 rounded-xl bg-accentPurple/10 text-accentPurple">
            <Wrench size={22} />
          </div>
        </Link>

        {/* Notices Metric */}
        <Link to="/notices" className="glass-panel p-6 rounded-2xl glass-panel-hover flex justify-between items-center group">
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Notices</p>
            <p className="text-3xl font-display font-extrabold text-white">{notices.length}</p>
            <p className="text-[10px] text-accentIndigo font-semibold flex items-center gap-1 group-hover:underline">
              Notice Board <ArrowRight size={10} />
            </p>
          </div>
          <div className="p-4 rounded-xl bg-accentIndigo/10 text-accentIndigo">
            <Megaphone size={22} />
          </div>
        </Link>

        {/* Payments Metric */}
        <Link to="/payments" className="glass-panel p-6 rounded-2xl glass-panel-hover flex justify-between items-center group">
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Dues Logs</p>
            <p className="text-3xl font-display font-extrabold text-white">{payments.length}</p>
            <p className="text-[10px] text-accentCyan font-semibold flex items-center gap-1 group-hover:underline">
              Ledger Payments <ArrowRight size={10} />
            </p>
          </div>
          <div className="p-4 rounded-xl bg-accentCyan/10 text-accentCyan">
            <CreditCard size={22} />
          </div>
        </Link>

        {/* Residents Metric */}
        {user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin' || user?.role === 'Staff' ? (
          <Link to="/residents" className="glass-panel p-6 rounded-2xl glass-panel-hover flex justify-between items-center group">
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Residents</p>
              <p className="text-3xl font-display font-extrabold text-white">{residents.length}</p>
              <p className="text-[10px] text-accentEmerald font-semibold flex items-center gap-1 group-hover:underline">
                Member Directory <ArrowRight size={10} />
              </p>
            </div>
            <div className="p-4 rounded-xl bg-accentEmerald/10 text-accentEmerald">
              <Users size={22} />
            </div>
          </Link>
        ) : (
          <div className="glass-panel p-6 rounded-2xl opacity-60 flex justify-between items-center">
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Residents</p>
              <p className="text-3xl font-display font-extrabold text-white">--</p>
              <p className="text-[10px] text-gray-500 font-semibold">Access restricted</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-gray-500">
              <Users size={22} />
            </div>
          </div>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Notices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-display font-extrabold text-white">Recent Notices</h3>
            <Link to="/notices" className="text-xs text-accentPurple font-semibold hover:underline flex items-center gap-1">
              View Notice Board <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {recentNotices.length > 0 ? (
              recentNotices.map((notice: any) => (
                <div key={notice._id} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2 relative">
                  {notice.isPinned && (
                    <span className="absolute top-4 right-4 bg-accentPurple/20 text-accentPurple text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
                      Pinned
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      notice.category === 'Emergency' 
                        ? 'bg-accentRose/15 text-accentRose' 
                        : notice.category === 'Financial'
                        ? 'bg-accentOrange/15 text-accentOrange'
                        : 'bg-white/5 text-gray-400'
                    }`}>
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{notice.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{notice.content}</p>
                </div>
              ))
            ) : (
              <div className="glass-panel p-8 text-center text-gray-500 rounded-2xl">
                No active announcements found on the bulletin board.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Recent Transactions */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-display font-extrabold text-white">Dues Log</h3>
            <Link to="/payments" className="text-xs text-accentPurple font-semibold hover:underline flex items-center gap-1">
              View History <ChevronRight size={14} />
            </Link>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4">
            {recentPayments.length > 0 ? (
              <div className="space-y-3.5">
                {recentPayments.map((payment: any) => (
                  <div key={payment._id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-white text-ellipsis overflow-hidden max-w-[120px]">
                        {payment.userId?.firstName || 'Resident'} {payment.userId?.lastName || ''}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        {payment.paymentMethod} • {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs font-bold text-white">₹{payment.amountPaid}</p>
                      <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        payment.status === 'Success' 
                          ? 'bg-accentEmerald/15 text-accentEmerald' 
                          : payment.status === 'Pending'
                          ? 'bg-accentOrange/15 text-accentOrange'
                          : 'bg-accentRose/15 text-accentRose'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-xs">
                No transaction logs recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
