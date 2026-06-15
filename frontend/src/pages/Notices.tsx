import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
import { 
  Megaphone, Plus, Trash2, Pin, ShieldAlert, Sparkles, RefreshCw, Calendar, Mail
} from 'lucide-react';

export const Notices: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'All',
    isPinned: false,
    expiresAt: '',
    attachment: ''
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: notices = [], isLoading, refetch, isRefetching } = useQuery<any[]>({
    queryKey: ['notices'],
    queryFn: async () => {
      const res = await axiosClient.get('/notices');
      return res.data.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post('/notices', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setIsNewOpen(false);
      setFormData({
        title: '',
        content: '',
        category: 'General',
        targetAudience: 'All',
        isPinned: false,
        expiresAt: '',
        attachment: ''
      });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to publish notice. Check validators.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosClient.delete(`/notices/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.title || !formData.content) {
      setErrorMsg('Title and content are required.');
      return;
    }
    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      targetAudience: formData.targetAudience,
      isPinned: formData.isPinned,
      expiresAt: formData.expiresAt || undefined,
      attachments: formData.attachment ? [formData.attachment] : []
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      deleteMutation.mutate(id);
    }
  };

  const canPublish = user?.role === 'SuperAdmin' || user?.role === 'SocietyAdmin' || user?.role === 'Staff';

  const filteredNotices = filterCategory 
    ? notices.filter((n: any) => n.category === filterCategory) 
    : notices;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            <Megaphone size={22} className="text-accentPurple" />
            Society Announcements Board
          </h1>
          <p className="text-xs text-gray-500">
            Publish general updates, financial reports, emergency notifications, and community events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"
          >
            <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
          </button>
          
          {canPublish && (
            <button
              onClick={() => setIsNewOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl text-xs font-bold shadow-glow hover:from-accentPurple/95 transition active:scale-[0.99]"
            >
              <Plus size={14} />
              Publish Notice
            </button>
          )}
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {['', 'General', 'Financial', 'Emergency', 'Event'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
              filterCategory === cat 
                ? 'bg-accentPurple/15 text-accentPurple border-accentPurple/25 shadow-glow' 
                : 'bg-white/5 text-gray-400 border-transparent hover:text-white hover:bg-white/10'
            }`}
          >
            {cat || 'All Bulletins'}
          </button>
        ))}
      </div>

      {/* New Notice Form Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-white/5 animate-slideUp text-left">
            <h3 className="text-lg font-display font-bold text-white mb-4">Publish New Notice</h3>

            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 bg-accentRose/10 border border-accentRose/20 rounded-xl p-3 text-xs text-accentRose">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Notice title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                required
              />
              <textarea
                placeholder="Notice content details *"
                value={formData.content}
                rows={5}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none transition"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                >
                  <option value="General">General Category</option>
                  <option value="Financial">Financial Dues</option>
                  <option value="Emergency">Emergency Alert</option>
                  <option value="Event">Community Event</option>
                </select>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                >
                  <option value="All">Target: All Members</option>
                  <option value="Owners">Target: Home Owners</option>
                  <option value="Tenants">Target: Tenants Only</option>
                  <option value="Staff">Target: Staff Members</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="bg-[#0d0f17] border border-white/5 focus:border-accentPurple/30 rounded-xl py-3 px-4 text-xs text-white outline-none transition"
                />
                <label className="flex items-center gap-2 text-xs text-gray-400 px-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="accent-accentPurple w-4 h-4 cursor-pointer"
                  />
                  <span>Pin to notice top</span>
                </label>
              </div>

              <input
                type="text"
                placeholder="Optional attachment URL (PDF, image)"
                value={formData.attachment}
                onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
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
                  {createMutation.isPending ? 'PUBLISHING...' : 'PUBLISH NOTICE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Feed */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw size={24} className="animate-spin text-accentPurple" />
        </div>
      ) : filteredNotices.length > 0 ? (
        <div className="space-y-6">
          {filteredNotices.map((notice: any) => (
            <div key={notice._id} className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
              
              {/* Emergency indicator glow */}
              {notice.category === 'Emergency' && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-accentRose pointer-events-none"></div>
              )}

              <div className="space-y-4 text-left">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    {notice.isPinned && (
                      <span className="flex items-center gap-0.5 text-accentPurple bg-accentPurple/10 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border border-accentPurple/25">
                        <Pin size={10} />
                        Pinned
                      </span>
                    )}
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      notice.category === 'Emergency' 
                        ? 'bg-accentRose/15 text-accentRose' 
                        : notice.category === 'Financial'
                        ? 'bg-accentOrange/15 text-accentOrange'
                        : notice.category === 'Event'
                        ? 'bg-accentCyan/15 text-accentCyan'
                        : 'bg-white/5 text-gray-400'
                    }`}>
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 font-sans">
                      <Calendar size={12} />
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Creator details or delete */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400">
                      Target: <strong className="text-white capitalize">{notice.targetAudience}</strong>
                    </span>
                    {canPublish && (
                      <button
                        onClick={() => handleDelete(notice._id)}
                        className="text-gray-500 hover:text-accentRose transition p-1 hover:bg-accentRose/10 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-display font-extrabold text-white leading-tight">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {notice.content}
                  </p>
                </div>

                {notice.attachments && notice.attachments.length > 0 && (
                  <div className="pt-2">
                    <a
                      href={notice.attachments[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-accentCyan hover:underline font-semibold bg-accentCyan/5 border border-accentCyan/10 rounded-lg px-2.5 py-1 transition"
                    >
                      <Mail size={12} />
                      View Attachment File
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-gray-400 rounded-3xl">
          No notices posted on this bulletin board.
        </div>
      )}
    </div>
  );
};
