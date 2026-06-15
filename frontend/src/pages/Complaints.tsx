import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
import { 
  Plus, AlertCircle, Wrench, Shield, CheckCircle2, RefreshCw, Star
} from 'lucide-react';

export const Complaints: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', images: '' });
  const [assigneeId, setAssigneeId] = useState<Record<string, string>>({});
  const [statusNotes, setStatusNotes] = useState<Record<string, string>>({});
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

  // Queries
  const { data: complaints = [], isLoading, isRefetching, refetch } = useQuery<any[]>({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await axiosClient.get('/complaints');
      return res.data.data;
    }
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosClient.get('/residents');
      return res.data.data;
    },
    enabled: user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin'
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post('/complaints', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setIsNewOpen(false);
      setFormData({ title: '', description: '', images: '' });
    }
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string }) => {
      const res = await axiosClient.patch(`/complaints/${id}/assign`, { assignedTo });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      if (selectedComplaint) {
        setSelectedComplaint(null);
      }
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, notes, feedbackRating, feedbackComments }: { id: string; status: string; notes?: string; feedbackRating?: number; feedbackComments?: string }) => {
      const res = await axiosClient.patch(`/complaints/${id}/status`, { status, notes, feedbackRating, feedbackComments });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      if (selectedComplaint) {
        setSelectedComplaint(null);
      }
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      images: formData.images ? [formData.images] : []
    });
  };

  const handleAssign = (complaintId: string) => {
    const assignedTo = assigneeId[complaintId];
    if (!assignedTo) return;
    assignMutation.mutate({ id: complaintId, assignedTo });
  };

  const handleStatusUpdate = (complaintId: string, status: string) => {
    const notes = statusNotes[complaintId];
    statusMutation.mutate({ id: complaintId, status, notes });
  };

  const handleFeedback = (complaintId: string, rating: number, comments: string) => {
    statusMutation.mutate({ id: complaintId, status: 'Closed', feedbackRating: rating, feedbackComments: comments });
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-accentRose/15 text-accentRose border-accentRose/20';
      case 'High': return 'bg-accentOrange/15 text-accentOrange border-accentOrange/20';
      case 'Medium': return 'bg-accentIndigo/15 text-accentIndigo border-accentIndigo/20';
      default: return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Closed':
      case 'Resolved': return 'bg-accentEmerald/15 text-accentEmerald border-accentEmerald/20';
      case 'In-Progress':
      case 'Assigned': return 'bg-accentIndigo/15 text-accentIndigo border-accentIndigo/20';
      case 'Pending-Approval': return 'bg-accentOrange/15 text-accentOrange border-accentOrange/20';
      default: return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  const getResolutionPeriodInfo = (createdAtStr: string, status: string) => {
    if (status === 'Resolved' || status === 'Closed') {
      return null;
    }
    const createdAt = new Date(createdAtStr);
    const sevenDaysLater = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const diffTime = sevenDaysLater.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return {
        overdue: false,
        message: `Resolution Period: ${diffDays} day${diffDays > 1 ? 's' : ''} remaining (Please wait for resolution)`,
        days: diffDays
      };
    } else {
      return {
        overdue: true,
        message: `Emergency: 7-day resolution window exceeded! Escalated to critical.`,
        days: Math.abs(diffDays)
      };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            <Wrench size={22} className="text-accentPurple" />
            Support Desk & AI Triage
          </h1>
          <p className="text-xs text-gray-500">
            Submit, monitor, and auto-triage ticket complaints using machine learning classifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"
          >
            <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={() => setIsNewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl text-xs font-bold shadow-glow hover:from-accentPurple/95 transition active:scale-[0.99]"
          >
            <Plus size={14} />
            File Ticket
          </button>
        </div>
      </div>

      {/* New Complaint Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-white/5 animate-slideUp text-left">
            <h3 className="text-lg font-display font-bold text-white mb-4">File Support Ticket</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Brief ticket summary (e.g. Water leak block B)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                required
              />
              <textarea
                placeholder="Provide details about the issue..."
                value={formData.description}
                rows={4}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                required
              />
              <input
                type="text"
                placeholder="Optional image url attachment"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
              />
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
                  {createMutation.isPending ? 'LODGING TICKET...' : 'FILE COMPLAINT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading list */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw size={24} className="animate-spin text-accentPurple" />
        </div>
      ) : complaints.length > 0 ? (
        /* Complaints List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.map((complaint: any) => (
            <div key={complaint._id} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition relative flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`border text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${getPriorityColor(complaint.aiAnalysis?.estimatedPriority)}`}>
                    {complaint.aiAnalysis?.estimatedPriority || 'Low'} Priority
                  </span>
                  <span className={`border text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="text-base font-bold text-white leading-snug">{complaint.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-3">{complaint.description}</p>
                  {(() => {
                    const resInfo = getResolutionPeriodInfo(complaint.createdAt, complaint.status);
                    if (!resInfo) return null;
                    return (
                      <div className={`mt-3 p-2.5 rounded-xl text-[10px] font-semibold border ${
                        resInfo.overdue
                          ? 'bg-accentRose/15 text-accentRose border-accentRose/20 animate-pulse font-bold'
                          : 'bg-white/5 text-gray-400 border-white/5'
                      }`}>
                        {resInfo.message}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Action Panels */}
              <div className="pt-4 border-t border-white/5 space-y-3 mt-4 text-left">
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>Filed: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  <span>Category: <strong className="text-white">{complaint.aiAnalysis?.detectedCategory}</strong></span>
                </div>

                {complaint.assignedTo && (
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-white/5 p-2 rounded-xl border border-white/5">
                    <Shield size={12} className="text-accentCyan" />
                    <span>Assignee: <strong>{complaint.assignedTo.firstName} {complaint.assignedTo.lastName}</strong></span>
                  </div>
                )}

                <button
                  onClick={() => setSelectedComplaint(complaint)}
                  className="w-full py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl transition uppercase"
                >
                  Manage Ticket Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-gray-400 rounded-3xl animate-fadeIn">
          No complaints registered in your society dashboard.
        </div>
      )}

      {/* Selected Complaint Detail Drawer/Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-white/5 max-h-[90vh] overflow-y-auto animate-slideUp text-left space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${getPriorityColor(selectedComplaint.aiAnalysis?.estimatedPriority)} mb-2`}>
                  {selectedComplaint.aiAnalysis?.estimatedPriority} Priority
                </span>
                <h2 className="text-xl font-display font-extrabold text-white leading-tight">
                  {selectedComplaint.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition"
              >
                Close
              </button>
            </div>

            {/* Progress Track */}
            <div className="w-full py-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                {/* Step 1 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedComplaint.status === 'Pending-Approval'
                      ? 'bg-accentPurple text-white border-2 border-accentPurple shadow-glow animate-pulse'
                      : ['Open', 'Assigned', 'In-Progress', 'Resolved', 'Closed'].includes(selectedComplaint.status)
                      ? 'bg-accentEmerald text-white'
                      : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}>
                    1
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400 font-semibold">Submitted</span>
                </div>
                
                <div className={`flex-1 h-0.5 ${
                  ['Open', 'Assigned', 'In-Progress', 'Resolved', 'Closed'].includes(selectedComplaint.status)
                    ? 'bg-accentEmerald'
                    : 'bg-white/5'
                }`}></div>

                {/* Step 2 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedComplaint.status === 'Open'
                      ? 'bg-accentPurple text-white border-2 border-accentPurple shadow-glow'
                      : ['Assigned', 'In-Progress', 'Resolved', 'Closed'].includes(selectedComplaint.status)
                      ? 'bg-accentEmerald text-white'
                      : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400 font-semibold">Approved</span>
                </div>

                <div className={`flex-1 h-0.5 ${
                  ['Assigned', 'In-Progress', 'Resolved', 'Closed'].includes(selectedComplaint.status)
                    ? 'bg-accentEmerald'
                    : 'bg-white/5'
                }`}></div>

                {/* Step 3 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    ['Assigned', 'In-Progress'].includes(selectedComplaint.status)
                      ? 'bg-accentPurple text-white border-2 border-accentPurple shadow-glow'
                      : ['Resolved', 'Closed'].includes(selectedComplaint.status)
                      ? 'bg-accentEmerald text-white'
                      : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}>
                    3
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400 font-semibold">In Progress</span>
                </div>

                <div className={`flex-1 h-0.5 ${
                  ['Resolved', 'Closed'].includes(selectedComplaint.status)
                    ? 'bg-accentEmerald'
                    : 'bg-white/5'
                }`}></div>

                {/* Step 4 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedComplaint.status === 'Resolved'
                      ? 'bg-accentPurple text-white border-2 border-accentPurple shadow-glow'
                      : selectedComplaint.status === 'Closed'
                      ? 'bg-accentEmerald text-white'
                      : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}>
                    4
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400 font-semibold">Resolved</span>
                </div>

                <div className={`flex-1 h-0.5 ${
                  selectedComplaint.status === 'Closed'
                    ? 'bg-accentEmerald'
                    : 'bg-white/5'
                }`}></div>

                {/* Step 5 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedComplaint.status === 'Closed'
                      ? 'bg-accentEmerald text-white border-2 border-accentEmerald shadow-glow'
                      : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}>
                    5
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400 font-semibold">Closed</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Description */}
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Description</p>
                <p className="text-xs text-gray-300 bg-[#0d0f17] border border-white/5 p-3 rounded-xl">
                  {selectedComplaint.description}
                </p>
                {(() => {
                  const resInfo = getResolutionPeriodInfo(selectedComplaint.createdAt, selectedComplaint.status);
                  if (!resInfo) return null;
                  return (
                    <div className={`mt-2 p-2.5 rounded-xl text-[10px] font-semibold border ${
                      resInfo.overdue
                        ? 'bg-accentRose/15 text-accentRose border-accentRose/20 animate-pulse font-bold'
                        : 'bg-white/5 text-gray-400 border-white/5'
                    }`}>
                      {resInfo.message}
                    </div>
                  );
                })()}
              </div>

              {/* AI Analysis Panel */}
              <div className="bg-accentPurple/5 border border-accentPurple/10 p-4 rounded-xl space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-accentPurple/10 rounded-full blur-[40px] pointer-events-none"></div>
                <h4 className="text-xs font-bold text-accentPurple flex items-center gap-1.5">
                  <Plus size={14} className="text-accentPurple animate-pulse" />
                  AI Triage Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400">
                  <p>Category: <strong className="text-white">{selectedComplaint.aiAnalysis?.detectedCategory}</strong></p>
                  <p>Confidence: <strong className="text-white">{Math.round(selectedComplaint.aiAnalysis?.confidenceScore * 100)}%</strong></p>
                  <p>Sentiment Score: <strong className="text-white">{selectedComplaint.aiAnalysis?.sentimentScore}</strong></p>
                </div>
                {selectedComplaint.aiAnalysis?.explanation && (
                  <p className="text-[10px] text-gray-500 italic mt-1.5">{selectedComplaint.aiAnalysis?.explanation}</p>
                )}
              </div>

              {/* Admin approval module */}
              {(user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin') && selectedComplaint.status === 'Pending-Approval' && (
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-white">Approve Support Ticket</h4>
                  <p className="text-[11px] text-gray-400">This ticket has been raised by a resident and is awaiting administrative validation before assignment.</p>
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint._id, 'Open')}
                    className="w-full py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl text-xs font-bold hover:shadow-glow hover:brightness-110 transition active:scale-[0.99]"
                  >
                    {statusMutation.isPending ? 'APPROVING...' : 'APPROVE TICKET'}
                  </button>
                </div>
              )}

              {/* Admin assigning module */}
              {(user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin') && selectedComplaint.status === 'Open' && (
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-white">Assign Ticket to Staff/Vendor</h4>
                  <div className="flex gap-2">
                    <select
                      value={assigneeId[selectedComplaint._id] || ''}
                      onChange={(e) => setAssigneeId({ ...assigneeId, [selectedComplaint._id]: e.target.value })}
                      className="flex-1 bg-[#0d0f17] border border-white/5 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    >
                      <option value="">Select Staff or Vendor</option>
                      {users.map((res: any) => (
                        <option key={res._id} value={res.userId?._id}>
                          {res.userId?.firstName} {res.userId?.lastName} ({res.userId?.role})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssign(selectedComplaint._id)}
                      className="px-4 py-2 bg-accentPurple text-white rounded-xl text-xs font-bold hover:bg-accentPurple/95 transition shadow-glow"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}

              {/* Staff status update module */}
              {(user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin' || user?.role === 'Staff' || (user?.role === 'Vendor' && selectedComplaint.assignedTo?._id === user?.id)) && 
                selectedComplaint.status !== 'Resolved' && selectedComplaint.status !== 'Closed' && (
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-white">Update Maintenance Status</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Resolution notes (e.g. leaking pipe replaced)"
                        value={statusNotes[selectedComplaint._id] || ''}
                        onChange={(e) => setStatusNotes({ ...statusNotes, [selectedComplaint._id]: e.target.value })}
                        className="w-full bg-[#0d0f17] border border-white/5 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 outline-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleStatusUpdate(selectedComplaint._id, 'In-Progress')}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-xl text-xs font-semibold transition"
                        >
                          Mark In-Progress
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedComplaint._id, 'Resolved')}
                          className="px-4 py-2 bg-accentEmerald text-white rounded-xl text-xs font-bold hover:bg-accentEmerald/95 transition shadow-glow"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
              )}

              {/* Resident feedback module */}
              {selectedComplaint.status === 'Resolved' && selectedComplaint.raisedBy?._id === user?.id && (
                <div className="bg-accentEmerald/5 border border-accentEmerald/10 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-accentEmerald flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Confirm Resolution & Provide Feedback
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleFeedback(selectedComplaint._id, star, 'Resolved successfully.')}
                          className="p-1 text-accentOrange hover:scale-110 transition"
                        >
                          <Star size={18} fill={star <= (selectedComplaint.resolutionDetails?.feedbackRating || 5) ? '#F59E0B' : 'transparent'} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
