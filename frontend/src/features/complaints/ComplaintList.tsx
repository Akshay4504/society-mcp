import React, { useState, useEffect } from 'react';
import { 
  Plus, MessageSquare, AlertOctagon, HelpCircle, Wrench, Shield, Trash2, CheckCircle, BrainCircuit 
} from 'lucide-react';

interface ComplaintListProps {
  token: string;
  user: any;
}

export const ComplaintList = ({ token, user }: ComplaintListProps) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/v1/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch complaints');
      }
      setComplaints(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Could not load complaints from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/v1/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to log complaint');
      }

      setComplaints(prev => [data.data, ...prev]);
      setTitle('');
      setDescription('');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Backend server was unable to save the complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Resolved', notes: 'Verified and completed by resident request.' })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: 'Resolved' } : c));
      }
    } catch (err) {
      console.error('Failed to update ticket status', err);
    }
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'Critical': return 'bg-accentRose/20 text-accentRose border-accentRose/30';
      case 'High': return 'bg-accentOrange/20 text-accentOrange border-accentOrange/30';
      case 'Medium': return 'bg-accentPurple/20 text-accentPurple border-accentPurple/30';
      default: return 'bg-accentCyan/20 text-accentCyan border-accentCyan/30';
    }
  };

  const getSentimentLabel = (score: number) => {
    if (score <= -0.6) return { text: 'Highly Frustrated 😫', color: 'text-accentRose' };
    if (score < 0) return { text: 'Dissatisfied 🙁', color: 'text-accentOrange' };
    if (score > 0.4) return { text: 'Satisfied / Polite 😊', color: 'text-accentEmerald' };
    return { text: 'Neutral 😐', color: 'text-gray-400' };
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Plumbing': return <Wrench size={14} className="text-accentCyan" />;
      case 'Electrical': return <Shield size={14} className="text-accentOrange" />;
      case 'Security': return <Shield size={14} className="text-accentRose" />;
      default: return <HelpCircle size={14} className="text-accentPurple" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Raise Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="text-accentPurple" size={24} />
            Resident Support Desk
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Complaints resolved and categorized by SMM AI Triage Agent</p>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-accentPurple to-accentIndigo text-white rounded-xl px-4 py-2.5 text-xs font-semibold hover:shadow-glow hover:brightness-110 active:scale-95 transition duration-150 flex items-center gap-2"
        >
          <Plus size={16} />
          Raise Complaint
        </button>
      </div>

      {error && (
        <div className="text-xs bg-accentRose/15 text-accentRose border border-accentRose/30 rounded-xl p-3">
          {error}
        </div>
      )}

      {/* Form Drawer (Inline Modal Overlay) */}
      {showForm && (
        <div className="p-6 rounded-2xl glass-panel neon-border-purple animate-slideDown">
          <h3 className="text-lg font-bold text-glow-purple mb-4">File a Housing Service Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Issue Headline</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Block B corridor light flickering"
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accentPurple focus:shadow-glow transition"
              />
            </div>
            
            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Elaborate Description (For AI Sentiment & Category Inferences)</label>
              <textarea 
                rows={4}
                required
                placeholder="Please describe what is broken, where it is, and its urgency level..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-darkBg/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accentPurple focus:shadow-glow transition"
              />
              <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1.5">
                <BrainCircuit size={12} className="text-accentCyan" />
                SMM NLP parser will auto-calculate priority indices based on severity keywords.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-accentPurple hover:bg-accentIndigo text-white rounded-xl px-5 py-2.5 text-xs font-semibold transition"
              >
                {isSubmitting ? 'AI Triaging...' : 'Submit to Board'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-accentPurple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-gray-400">Communicating with SMM API endpoints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-14 rounded-2xl glass-panel">
          <AlertOctagon className="text-gray-600 mx-auto mb-3" size={36} />
          <p className="text-sm font-semibold text-white">No complaints logged yet</p>
          <p className="text-xs text-gray-400 mt-1">Raise a complaint above to see the AI triage system analyze it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {complaints.map((complaint) => (
            <div 
              key={complaint._id} 
              className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col md:flex-row justify-between gap-6"
            >
              {/* Left Side: Ticket body */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                      complaint.status === 'Resolved' 
                        ? 'bg-accentEmerald/10 text-accentEmerald border border-accentEmerald/20' 
                        : 'bg-accentPurple/10 text-accentPurple border border-accentPurple/20'
                    }`}>
                      {complaint.status}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Filed on {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{complaint.title}</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{complaint.description}</p>
                </div>

                {/* AI Triage Details Box */}
                {complaint.aiAnalysis && (
                  <div className="p-4 rounded-xl bg-darkBg/60 border border-white/5 space-y-3 relative">
                    <div className="flex items-center gap-1.5 text-[10px] text-accentPurple font-bold uppercase tracking-wider">
                      <BrainCircuit size={14} className="text-accentCyan" />
                      AI Triage Agent Audit
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                      <div>
                        <span className="text-gray-500 text-[10px] uppercase block">Inferred Category</span>
                        <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                          {getCategoryIcon(complaint.aiAnalysis.detectedCategory)}
                          {complaint.aiAnalysis.detectedCategory}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] uppercase block">Estimated Priority</span>
                        <span className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-semibold border ${getPriorityColor(complaint.aiAnalysis.estimatedPriority)}`}>
                          {complaint.aiAnalysis.estimatedPriority}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] uppercase block">Resident Distress</span>
                        <span className={`font-semibold mt-0.5 block ${getSentimentLabel(complaint.aiAnalysis.sentimentScore).color}`}>
                          {getSentimentLabel(complaint.aiAnalysis.sentimentScore).text}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 border-t border-white/5 pt-2">
                      <strong className="text-white">Classification Reason:</strong> {complaint.aiAnalysis.explanation}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Resolve actions */}
              <div className="flex flex-col justify-between items-end gap-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                <div className="text-right">
                  <p className="text-[9px] text-gray-500 uppercase">Raised By</p>
                  <p className="text-xs font-semibold text-white">
                    {complaint.raisedBy?.firstName} {complaint.raisedBy?.lastName}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Flat {complaint.raisedBy?.flatDetails?.block}-{complaint.raisedBy?.flatDetails?.flatNumber}
                  </p>
                </div>

                {complaint.status !== 'Resolved' && (
                  <button 
                    onClick={() => handleResolve(complaint._id)}
                    className="w-full bg-accentEmerald/10 hover:bg-accentEmerald/20 text-accentEmerald border border-accentEmerald/30 rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle size={14} />
                    Mark Resolved
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
