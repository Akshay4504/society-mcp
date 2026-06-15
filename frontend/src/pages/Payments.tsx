import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
import { 
  Plus, CreditCard, CheckCircle2, AlertCircle, RefreshCw, Check, X, ShieldAlert, FileText, Receipt
} from 'lucide-react';

export const Payments: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);

  const [activeTab, setActiveTab] = useState<'bills' | 'payments'>('bills');
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [formData, setFormData] = useState({
    billId: '',
    amountPaid: 0,
    paymentMethod: 'UPI',
    transactionId: '',
    receiptUrl: ''
  });
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);
  const [billFormData, setBillFormData] = useState({
    userId: '',
    billingPeriod: 'June 2026',
    baseAmount: 2800,
    utilityCharges: 400,
    penaltyAmount: 0,
    dueDate: ''
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: residents = [] } = useQuery<any[]>({
    queryKey: ['residents'],
    queryFn: async () => {
      const res = await axiosClient.get('/residents');
      return res.data.data;
    },
    enabled: user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin'
  });

  const { data: payments = [], isLoading: isPaymentsLoading, refetch: refetchPayments, isRefetching: isRefetchingPayments } = useQuery<any[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await axiosClient.get('/payments');
      return res.data.data;
    }
  });

  const { data: bills = [], isLoading: isBillsLoading, refetch: refetchBills, isRefetching: isRefetchingBills } = useQuery<any[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      const res = await axiosClient.get('/bills');
      return res.data.data;
    }
  });

  // Mutations
  const recordMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post('/payments', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setIsRecordOpen(false);
      setFormData({ billId: '', amountPaid: 0, paymentMethod: 'UPI', transactionId: '', receiptUrl: '' });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to submit payment log. Check validator parameters.');
    }
  });

  const reconcileMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axiosClient.patch(`/payments/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    }
  });

  const createBillMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post('/bills', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setIsCreateBillOpen(false);
      setBillFormData({
        userId: '',
        billingPeriod: 'June 2026',
        baseAmount: 2800,
        utilityCharges: 400,
        penaltyAmount: 0,
        dueDate: ''
      });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to generate maintenance bill.');
    }
  });

  const handleCreateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!billFormData.userId || !billFormData.billingPeriod || !billFormData.baseAmount || !billFormData.dueDate) {
      setErrorMsg('All fields except utility/penalty charges are required.');
      return;
    }
    createBillMutation.mutate({
      userId: billFormData.userId,
      billingPeriod: billFormData.billingPeriod,
      baseAmount: Number(billFormData.baseAmount),
      utilityCharges: Number(billFormData.utilityCharges),
      penaltyAmount: Number(billFormData.penaltyAmount),
      dueDate: billFormData.dueDate
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.billId || !formData.amountPaid || !formData.transactionId) {
      setErrorMsg('Bill ID, Amount, and Transaction ID are required.');
      return;
    }
    recordMutation.mutate({
      billId: formData.billId,
      amountPaid: Number(formData.amountPaid),
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId,
      receiptUrl: formData.receiptUrl || undefined,
      status: 'Pending'
    });
  };

  const handleReconcile = (id: string, status: string) => {
    reconcileMutation.mutate({ id, status });
  };

  const handlePayBillClick = (bill: any) => {
    setFormData({
      billId: bill._id,
      amountPaid: bill.totalAmount,
      paymentMethod: 'UPI',
      transactionId: '',
      receiptUrl: ''
    });
    setIsRecordOpen(true);
  };

  const handleManualRecordClick = () => {
    setFormData({
      billId: '',
      amountPaid: 0,
      paymentMethod: 'UPI',
      transactionId: '',
      receiptUrl: ''
    });
    setIsRecordOpen(true);
  };

  // Calculations
  const totalPaid = payments
    .filter((p: any) => p.status === 'Success')
    .reduce((sum: number, p: any) => sum + p.amountPaid, 0);

  const outstandingBills = bills.filter((b: any) => b.status === 'Unpaid' || b.status === 'Partially-Paid');

  const isRefetching = isRefetchingPayments || isRefetchingBills;
  const isLoading = isPaymentsLoading || isBillsLoading;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            <CreditCard size={22} className="text-accentPurple" />
            Maintenance Payments Ledger
          </h1>
          <p className="text-xs text-gray-500">
            Log flat maintenance receipts, track invoices, and reconcile pending transaction states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { refetchPayments(); refetchBills(); }}
            className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"
          >
            <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
          </button>
          
          {(user?.role === 'ResidentOwner' || user?.role === 'ResidentTenant') && (
            <button
              onClick={handleManualRecordClick}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl text-xs font-bold shadow-glow hover:from-accentPurple/95 transition active:scale-[0.99]"
            >
              <Plus size={14} />
              Record Payment
            </button>
          )}

          {(user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin') && (
            <button
              onClick={() => setIsCreateBillOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl text-xs font-bold shadow-glow hover:from-accentPurple/95 transition active:scale-[0.99]"
            >
              <Plus size={14} />
              Generate Maintenance Bill
            </button>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-accentEmerald/10 text-accentEmerald">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Total Cleared Fees</p>
            <p className="text-2xl font-display font-extrabold text-white">₹{totalPaid}</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-accentOrange/10 text-accentOrange">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Pending Reconciliation</p>
            <p className="text-2xl font-display font-extrabold text-white">
              {payments.filter((p: any) => p.status === 'Pending').length} Logs
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => setActiveTab('bills')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition outline-none ${
            activeTab === 'bills'
              ? 'text-accentPurple border-b-2 border-accentPurple'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Outstanding Bills ({outstandingBills.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition outline-none ${
            activeTab === 'payments'
              ? 'text-accentPurple border-b-2 border-accentPurple'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Transaction History ({payments.length})
        </button>
      </div>

      {/* Record Payment Form Modal */}
      {isRecordOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-white/5 animate-slideUp text-left">
            <h3 className="text-lg font-display font-bold text-white mb-4">Record Maintenance Payment</h3>
            
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 bg-accentRose/10 border border-accentRose/20 rounded-xl p-3 text-xs text-accentRose">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Maintenance Bill Reference ID</label>
                <input
                  type="text"
                  placeholder="Maintenance Bill ID reference (24-char ObjectId)"
                  value={formData.billId}
                  onChange={(e) => setFormData({ ...formData, billId: e.target.value })}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    placeholder="Amount Paid (₹) *"
                    value={formData.amountPaid || ''}
                    onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                    className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="NetBanking">Net Banking</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Transaction ID / Reference Number</label>
                <input
                  type="text"
                  placeholder="Transaction ID / Reference Number *"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Receipt Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="Optional Receipt URL (https://...)"
                  value={formData.receiptUrl}
                  onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordMutation.isPending}
                  className="px-4 py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl text-xs font-bold transition shadow-glow"
                >
                  {recordMutation.isPending ? 'SUBMITTING RECEIPT...' : 'LOG TRANSACTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Maintenance Bill Modal */}
      {isCreateBillOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-white/5 animate-slideUp text-left">
            <h3 className="text-lg font-display font-bold text-white mb-4">Generate Maintenance Bill</h3>
            
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 bg-accentRose/10 border border-accentRose/20 rounded-xl p-3 text-xs text-accentRose">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateBillSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Flat Resident *</label>
                <select
                  value={billFormData.userId}
                  onChange={(e) => setBillFormData({ ...billFormData, userId: e.target.value })}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                  required
                >
                  <option value="">Select Resident Flat</option>
                  {residents.map((r: any) => (
                    <option key={r._id} value={r.userId?._id}>
                      Flat {r.block}-{r.flatNumber} ({r.userId?.firstName} {r.userId?.lastName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Billing Period *</label>
                  <input
                    type="text"
                    placeholder="e.g. June 2026"
                    value={billFormData.billingPeriod}
                    onChange={(e) => setBillFormData({ ...billFormData, billingPeriod: e.target.value })}
                    className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={billFormData.dueDate}
                    onChange={(e) => setBillFormData({ ...billFormData, dueDate: e.target.value })}
                    className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Base Maintenance (₹) *</label>
                  <input
                    type="number"
                    value={billFormData.baseAmount}
                    onChange={(e) => setBillFormData({ ...billFormData, baseAmount: Number(e.target.value) })}
                    className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Utility Charges (₹)</label>
                  <input
                    type="number"
                    value={billFormData.utilityCharges}
                    onChange={(e) => setBillFormData({ ...billFormData, utilityCharges: Number(e.target.value) })}
                    className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Penalty Amount (₹)</label>
                  <input
                    type="number"
                    value={billFormData.penaltyAmount}
                    onChange={(e) => setBillFormData({ ...billFormData, penaltyAmount: Number(e.target.value) })}
                    className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateBillOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBillMutation.isPending}
                  className="px-4 py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl text-xs font-bold transition shadow-glow"
                >
                  {createBillMutation.isPending ? 'GENERATING...' : 'GENERATE BILL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Panels */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw size={24} className="animate-spin text-accentPurple" />
        </div>
      ) : activeTab === 'bills' ? (
        /* Bills Tab */
        bills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bills.map((bill: any) => (
              <div 
                key={bill._id} 
                className="glass-panel p-6 rounded-2xl border border-white/5 relative flex flex-col justify-between hover:border-accentPurple/20 transition duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Billing Cycle</span>
                      <h4 className="text-sm font-bold text-white">{bill.billingPeriod}</h4>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                      bill.status === 'Paid'
                        ? 'bg-accentEmerald/15 text-accentEmerald border-accentEmerald/20'
                        : bill.status === 'Unpaid'
                        ? 'bg-accentRose/15 text-accentRose border-accentRose/20'
                        : 'bg-accentOrange/15 text-accentOrange border-accentOrange/20'
                    }`}>
                      {bill.status}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-b border-white/5 py-4 mb-4 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Base Maintenance:</span>
                      <span className="text-white">₹{bill.baseAmount}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Utility & Amenities:</span>
                      <span className="text-white">₹{bill.utilityCharges}</span>
                    </div>
                    {bill.penaltyAmount > 0 && (
                      <div className="flex justify-between text-accentRose font-medium">
                        <span>Late Penalty Dues:</span>
                        <span>₹{bill.penaltyAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-white pt-1 text-sm">
                      <span>Total Invoice Amount:</span>
                      <span>₹{bill.totalAmount}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px] text-gray-400 mb-6">
                    <div className="flex items-center gap-1.5">
                      <FileText size={12} className="text-gray-500" />
                      <span>Ref: <span className="font-mono text-gray-500">{bill._id}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertCircle size={12} className="text-gray-500" />
                      <span>Due Date: <span className="font-medium">{new Date(bill.dueDate).toLocaleDateString()}</span></span>
                    </div>
                  </div>
                </div>

                {(bill.status === 'Unpaid' || bill.status === 'Partially-Paid') && (user?.role === 'ResidentOwner' || user?.role === 'ResidentTenant') && (
                  <button
                    onClick={() => handlePayBillClick(bill)}
                    className="w-full py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white font-bold rounded-xl text-xs transition hover:brightness-110"
                  >
                    Clear Bill Dues
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-gray-400 rounded-3xl">
            No bills registered in this billing cycle.
          </div>
        )
      ) : (
        /* Payments Tab */
        payments.length > 0 ? (
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 font-semibold border-b border-white/5">
                    <th className="p-4">Resident</th>
                    <th className="p-4">Bill Details</th>
                    <th className="p-4">Paid Date</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    {(user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin') && <th className="p-4 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr key={payment._id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-4 font-semibold text-white">
                        {payment.userId?.firstName} {payment.userId?.lastName}
                      </td>
                      <td className="p-4 text-gray-400">
                        {payment.billId?.billingPeriod || 'Maintenance bill'}
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-400">{payment.paymentMethod}</td>
                      <td className="p-4 font-mono text-gray-500">{payment.transactionId || '--'}</td>
                      <td className="p-4 font-bold text-white">₹{payment.amountPaid}</td>
                      <td className="p-4">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                          payment.status === 'Success' 
                            ? 'bg-accentEmerald/15 text-accentEmerald border-accentEmerald/20' 
                            : payment.status === 'Pending'
                            ? 'bg-accentOrange/15 text-accentOrange border border-accentOrange/20'
                            : 'bg-accentRose/15 text-accentRose border border-accentRose/20'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      {(user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin') && (
                        <td className="p-4 text-center">
                          {payment.status === 'Pending' ? (
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => handleReconcile(payment._id, 'Success')}
                                className="p-1.5 bg-accentEmerald/10 hover:bg-accentEmerald/25 text-accentEmerald rounded-lg border border-accentEmerald/20 transition"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => handleReconcile(payment._id, 'Failed')}
                                className="p-1.5 bg-accentRose/10 hover:bg-accentRose/25 text-accentRose rounded-lg border border-accentRose/20 transition"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-semibold uppercase">Reconciled</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-gray-400 rounded-3xl">
            No maintenance payment transactions logged in this portal.
          </div>
        )
      )}
    </div>
  );
};
