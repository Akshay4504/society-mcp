import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
import { 
  BarChart3, RefreshCw, Sparkles, TrendingUp, AlertOctagon, CheckCircle
} from 'lucide-react';

export const Reports: React.FC = () => {
  // Queries
  const { data: complaints = [], isLoading: loadC } = useQuery<any[]>({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await axiosClient.get('/complaints');
      return res.data.data;
    }
  });

  const { data: payments = [], isLoading: loadP } = useQuery<any[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await axiosClient.get('/payments');
      return res.data.data;
    }
  });

  const { data: residents = [], isLoading: loadR } = useQuery<any[]>({
    queryKey: ['residents'],
    queryFn: async () => {
      const res = await axiosClient.get('/residents');
      return res.data.data;
    }
  });

  const isLoading = loadC || loadP || loadR;

  // Re-calculate Stats
  const categoriesMap: Record<string, number> = {};
  complaints.forEach((c: any) => {
    const cat = c.aiAnalysis?.detectedCategory || 'Other';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
  });
  const categoriesList = Object.entries(categoriesMap).map(([name, count]) => ({ name, count }));

  const closedCount = complaints.filter((c: any) => c.status === 'Closed' || c.status === 'Resolved').length;
  const openCount = complaints.length - closedCount;
  const resolveRatio = complaints.length > 0 ? Math.round((closedCount / complaints.length) * 100) : 0;

  const totalReceived = payments
    .filter((p: any) => p.status === 'Success')
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const pendingReceived = payments
    .filter((p: any) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const collectionRatio = totalReceived + pendingReceived > 0 
    ? Math.round((totalReceived / (totalReceived + pendingReceived)) * 100) 
    : 0;

  const totalOccupied = residents.filter((r: any) => r.status === 'Active').length;
  const totalExpected = 120; // Capacity ceiling mock
  const occupancyRate = Math.round((totalOccupied / totalExpected) * 100) || 0;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
          <BarChart3 size={22} className="text-accentPurple" />
          Analytical Reports
        </h1>
        <p className="text-xs text-gray-500">
          Visual metrics tracking fee collection rates, ticket resolution speed, and building occupancy indicators.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw size={24} className="animate-spin text-accentPurple" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Billing Collection Progress */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-accentEmerald" />
              Collections Reconciliation (Ledger Dues)
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-display font-extrabold text-white">₹{totalReceived}</span>
                <span className="text-xs text-gray-400 font-sans">Total Cleared Receipts</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-[#0d0f17] h-3.5 rounded-full overflow-hidden border border-white/5 relative">
                  <div 
                    className="bg-gradient-to-r from-accentEmerald to-accentCyan h-full rounded-full transition-all duration-1000"
                    style={{ width: `${collectionRatio}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                  <span>Reconciled: {collectionRatio}%</span>
                  <span>Pending: ₹{pendingReceived}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Resolution Progress */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={16} className="text-accentPurple" />
              Complaint Desk Resolution Ratio
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-display font-extrabold text-white">{resolveRatio}%</span>
                <span className="text-xs text-gray-400 font-sans">Tickets Resolved Ratio</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-[#0d0f17] h-3.5 rounded-full overflow-hidden border border-white/5 relative">
                  <div 
                    className="bg-gradient-to-r from-accentPurple to-accentIndigo h-full rounded-full transition-all duration-1000"
                    style={{ width: `${resolveRatio}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                  <span>Resolved: {closedCount} tickets</span>
                  <span>Open: {openCount} tickets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Triage */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-accentCyan animate-pulse" />
              AI Support Category Analysis
            </h3>

            {categoriesList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {categoriesList.map((item, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold truncate">
                      {item.name}
                    </p>
                    <p className="text-2xl font-display font-extrabold text-white">{item.count}</p>
                    <p className="text-[9px] text-gray-500">Tickets Classification</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">No categories tracked.</p>
            )}
          </div>

          {/* Occupancy Progress */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Occupancy Rates & Capacity Limits
            </h3>

            <div className="flex justify-between items-center text-xs">
              <div className="space-y-1">
                <p className="text-gray-400">Total Registered Units</p>
                <p className="text-xl font-bold text-white">{totalOccupied} / {totalExpected} Flats</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-gray-400 font-sans">Current Occupancy Rate</p>
                <p className="text-xl font-bold text-white">{occupancyRate}%</p>
              </div>
            </div>

            <div className="w-full bg-[#0d0f17] h-3.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-accentPurple via-accentIndigo to-accentCyan h-full rounded-full transition-all duration-1000"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};
