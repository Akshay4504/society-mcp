import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
import { 
  Users, Plus, Search, ShieldAlert, Trash2, Edit, Check, X, Sparkles, RefreshCw
} from 'lucide-react';

export const Residents: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [filterBlock, setFilterBlock] = useState('');
  const [filterFlat, setFilterFlat] = useState('');
  const [selectedResident, setSelectedResident] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    userId: '',
    block: '',
    flatNumber: '',
    occupancyType: 'Owner',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: ''
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: residents = [], isLoading, refetch, isRefetching } = useQuery<any[]>({
    queryKey: ['residents', filterBlock, filterFlat],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterBlock) params.append('block', filterBlock);
      if (filterFlat) params.append('flatNumber', filterFlat);
      const res = await axiosClient.get(`/residents?${params.toString()}`);
      return res.data.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post('/residents', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      setIsNewOpen(false);
      setFormData({
        userId: '',
        block: '',
        flatNumber: '',
        occupancyType: 'Owner',
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactPhone: ''
      });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create resident profile.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosClient.delete(`/residents/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      setSelectedResident(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.userId || !formData.block || !formData.flatNumber || !formData.emergencyContactName || !formData.emergencyContactPhone) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    createMutation.mutate({
      userId: formData.userId,
      block: formData.block,
      flatNumber: formData.flatNumber,
      occupancyType: formData.occupancyType,
      emergencyContact: {
        name: formData.emergencyContactName,
        relation: formData.emergencyContactRelation,
        contactNumber: formData.emergencyContactPhone
      }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this resident profile?')) {
      deleteMutation.mutate(id);
    }
  };

  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin';

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            <Users size={22} className="text-accentPurple" />
            Society Member Directory
          </h1>
          <p className="text-xs text-gray-500">
            View occupied flats, vehicle parking logs, family rosters, and emergency contact lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"
          >
            <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
          </button>
          
          {isAdmin && (
            <button
              onClick={() => setIsNewOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl text-xs font-bold shadow-glow hover:from-accentPurple/95 transition active:scale-[0.99]"
            >
              <Plus size={14} />
              Add Resident Profile
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-3 text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Filter by Block (e.g. A)"
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
          />
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-3 text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Filter by Flat No. (e.g. 101)"
            value={filterFlat}
            onChange={(e) => setFilterFlat(e.target.value)}
            className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
          />
        </div>
      </div>

      {/* New Resident Form Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-white/5 animate-slideUp text-left">
            <h3 className="text-lg font-display font-bold text-white mb-4">Register Resident Profile</h3>

            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 bg-accentRose/10 border border-accentRose/20 rounded-xl p-3 text-xs text-accentRose">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="User Account ID Reference (24-char ObjectId) *"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                required
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Block (A, B) *"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                  required
                />
                <input
                  type="text"
                  placeholder="Flat No. *"
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                  className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                  required
                />
                <select
                  value={formData.occupancyType}
                  onChange={(e) => setFormData({ ...formData, occupancyType: e.target.value })}
                  className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                >
                  <option value="Owner">Owner</option>
                  <option value="Tenant">Tenant</option>
                </select>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-white">Emergency Contact Details</h4>
                <input
                  type="text"
                  placeholder="Contact Full Name *"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Relation (e.g. Spouse) *"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                    className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone number *"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl text-xs font-bold transition shadow-glow"
                >
                  {createMutation.isPending ? 'CREATING PROFILE...' : 'SAVE PROFILE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Directory Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw size={24} className="animate-spin text-accentPurple" />
        </div>
      ) : residents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {residents.map((resident: any) => (
            <div key={resident._id} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition relative flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-display font-extrabold text-white">
                    Flat {resident.block}-{resident.flatNumber}
                  </span>
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    resident.occupancyType === 'Owner' 
                      ? 'bg-accentPurple/10 text-accentPurple' 
                      : 'bg-accentCyan/10 text-accentCyan'
                  }`}>
                    {resident.occupancyType}
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <p className="text-sm font-bold text-white">
                    {resident.userId?.firstName} {resident.userId?.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{resident.userId?.email}</p>
                  <p className="text-xs text-gray-500">{resident.userId?.phone}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-2">
                <button
                  onClick={() => setSelectedResident(resident)}
                  className="flex-1 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl transition uppercase"
                >
                  Full Profile Details
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(resident._id)}
                    className="p-2 bg-white/5 hover:bg-accentRose/10 hover:text-accentRose text-gray-400 rounded-xl border border-white/5 hover:border-accentRose/20 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-gray-400 rounded-3xl">
          No registered residents fit the query criteria.
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-panel p-6 rounded-2xl border border-white/5 animate-slideUp text-left space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-accentPurple uppercase tracking-widest font-bold">Resident Profile Details</span>
                <h2 className="text-xl font-display font-extrabold text-white">
                  Flat {selectedResident.block}-{selectedResident.flatNumber}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedResident(null)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Resident Name</p>
                <p className="text-white font-semibold">{selectedResident.userId?.firstName} {selectedResident.userId?.lastName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Occupancy Type</p>
                <p className="text-white font-semibold">{selectedResident.occupancyType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Move-in Date</p>
                <p className="text-white font-semibold">
                  {new Date(selectedResident.moveInDate).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Emergency Contact</p>
                <p className="text-white font-semibold">
                  {selectedResident.emergencyContact?.name} ({selectedResident.emergencyContact?.relation}) - {selectedResident.emergencyContact?.contactNumber}
                </p>
              </div>
            </div>

            {/* Vehicles log */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1">
                <Sparkles size={12} className="text-accentCyan" />
                Registered Vehicles
              </h4>
              {selectedResident.vehicles && selectedResident.vehicles.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {selectedResident.vehicles.map((v: any, index: number) => (
                    <div key={index} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                      <p className="font-mono font-bold text-white">{v.vehicleNumber}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{v.vehicleType} • Slot {v.parkingSlotNumber}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-500">No vehicles registered for this flat.</p>
              )}
            </div>

            {/* Family roster */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1">
                <Sparkles size={12} className="text-accentIndigo" />
                Family Members
              </h4>
              {selectedResident.familyMembers && selectedResident.familyMembers.length > 0 ? (
                <div className="space-y-2">
                  {selectedResident.familyMembers.map((m: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="font-semibold text-white">{m.name}</span>
                      <span className="text-gray-400 capitalize">{m.relation}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-500">No other family members recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
