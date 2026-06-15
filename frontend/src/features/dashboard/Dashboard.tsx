import React, { useState } from 'react';
import { 
  Building, Wrench, ShieldAlert, CreditCard, Activity, 
  Sparkles, Globe, Calendar, CheckCircle2, ChevronRight, Play 
} from 'lucide-react';

interface DashboardProps {
  user: any;
  token: string;
  onNavigate: (page: any) => void;
}

export const Dashboard = ({ user, token, onNavigate }: DashboardProps) => {
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('hi');
  
  // Localized mock notice data to show translation capabilities
  const [notices, setNotices] = useState([
    {
      id: 'n1',
      title: 'Water Supply Shutdown for Maintenance',
      category: 'Emergency',
      content: 'Please note there will be a scheduled water outage on Sunday from 9:00 AM to 1:00 PM for water tank cleaning.',
      date: 'June 14, 2026',
      originalTitle: 'Water Supply Shutdown for Maintenance',
      originalContent: 'Please note there will be a scheduled water outage on Sunday from 9:00 AM to 1:00 PM for water tank cleaning.'
    },
    {
      id: 'n2',
      title: 'Annual Society General Body Meeting (AGM)',
      category: 'General',
      content: 'The AGM is scheduled for June 28 in the clubhouse. All owners are requested to attend. Agenda items include budget approval.',
      date: 'June 12, 2026',
      originalTitle: 'Annual Society General Body Meeting (AGM)',
      originalContent: 'The AGM is scheduled for June 28 in the clubhouse. All owners are requested to attend. Agenda items include budget approval.'
    }
  ]);

  // Telemetry items for physical infrastructure
  const [assets, setAssets] = useState([
    {
      name: 'Main Lift - Block A',
      type: 'Elevator',
      vibration: 1.8,
      temperature: 42,
      risk: 15,
      status: 'Operational',
      action: 'Routine inspection.'
    },
    {
      name: 'Back-up Generator',
      type: 'Generator',
      vibration: 5.6,
      temperature: 88,
      risk: 88,
      status: 'Critical-Failure',
      action: 'Emergency overhaul recommended. High motor vibrations.'
    },
    {
      name: 'Primary Borewell Pump',
      type: 'Water Pump',
      vibration: 2.9,
      temperature: 71,
      risk: 45,
      status: 'Under-Maintenance',
      action: 'Schedule capacitor check. Operating temperature high.'
    }
  ]);

  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [billPaid, setBillPaid] = useState(false);

  const handleTranslate = async (noticeId: string) => {
    setTranslatingId(noticeId);
    
    // Simulate translation backend API call or fall back locally
    setTimeout(() => {
      setNotices(prev => prev.map(n => {
        if (n.id === noticeId) {
          if (selectedLang === 'hi') {
            return {
              ...n,
              title: noticeId === 'n1' ? 'पानी की आपूर्ति रखरखाव के लिए बंद' : 'वार्षिक आम बैठक (AGM)',
              content: noticeId === 'n1' 
                ? 'कृपया ध्यान दें कि पानी की टंकी की सफाई के लिए रविवार को सुबह 9:00 बजे से दोपहर 1:00 बजे तक पानी की आपूर्ति बंद रहेगी।' 
                : 'AGM 28 जून को क्लब हाउस में होने वाली है। सभी मालिकों से उपस्थित रहने का अनुरोध है।'
            };
          } else {
            return {
              ...n,
              title: noticeId === 'n1' ? 'पाणी पुरवठा देखभाल दुरुस्तीसाठी बंद' : 'वार्षिक सर्वसाधारण सभा (AGM)',
              content: noticeId === 'n1'
                ? 'कृपया नोंद घ्या की पाण्याच्या टाकीच्या साफसफाईसाठी रविवारी सकाळी 9:00 ते दुपारी 1:00 या वेळेत पाणी पुरवठा बंद राहील.'
                : 'AGM 28 जून रोजी क्लब हाऊसमध्ये नियोजित आहे. सर्व मालकांना उपस्थित राहण्याची विनंती आहे.'
            };
          }
        }
        return n;
      }));
      setTranslatingId(null);
    }, 800);
  };

  const handleResetTranslation = (noticeId: string) => {
    setNotices(prev => prev.map(n => {
      if (n.id === noticeId) {
        return {
          ...n,
          title: n.originalTitle,
          content: n.originalContent
        };
      }
      return n;
    }));
  };

  const triggerMockTelemetryLog = (index: number) => {
    setAssets(prev => prev.map((asset, idx) => {
      if (idx === index) {
        const newVib = Number((1.5 + Math.random() * 5).toFixed(1));
        const newTemp = Math.floor(35 + Math.random() * 60);
        let status = 'Operational';
        let action = 'Routine inspection.';
        let risk = 12;

        if (newTemp > 80 || newVib > 5.0) {
          status = 'Critical-Failure';
          risk = 90;
          action = 'Overload flag: Urgent dispatch.';
        } else if (newTemp > 65 || newVib > 3.0) {
          status = 'Under-Maintenance';
          risk = 52;
          action = 'Schedule preventive assessment.';
        }

        return {
          ...asset,
          vibration: newVib,
          temperature: newTemp,
          status,
          risk,
          action
        };
      }
      return asset;
    }));
  };

  const handlePayBill = (billId: string) => {
    setPayingBillId(billId);
    setTimeout(() => {
      setPayingBillId(null);
      setBillPaid(true);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-accentPurple/10 rounded-full blur-3xl -z-10"></div>
        <div>
          <div className="flex items-center gap-2 text-xs text-accentPurple font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={14} className="animate-pulse" />
            AI Operations Online
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white">
            Welcome back, <span className="gradient-text-purple-cyan">{user.firstName}</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Flat {user.flatDetails?.block}-{user.flatDetails?.flatNumber} • Emerald Greens Society
          </p>
        </div>

        <div className="flex items-center gap-3 bg-darkBg/50 border border-white/5 rounded-xl px-4 py-3">
          <Calendar size={18} className="text-accentCyan" />
          <div className="text-left">
            <p className="text-[10px] text-gray-500 uppercase">Operational Date</p>
            <p className="text-xs font-semibold text-white">June 13, 2026</p>
          </div>
        </div>
      </div>

      {/* Main KPI Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Complaints</p>
            <p className="text-3xl font-display font-extrabold text-white mt-2">2</p>
            <button 
              onClick={() => onNavigate('complaints')}
              className="text-[11px] text-accentPurple hover:text-white transition mt-2 flex items-center gap-1"
            >
              View tickets <ChevronRight size={12} />
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-accentPurple/10 text-accentPurple shadow-glow">
            <Wrench size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Anomalies Detected</p>
            <p className="text-3xl font-display font-extrabold text-accentOrange mt-2">2</p>
            <span className="text-[10px] text-gray-500 block mt-2">Telemetry alerts active</span>
          </div>
          <div className="p-3.5 rounded-xl bg-accentOrange/10 text-accentOrange">
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Society Notices</p>
            <p className="text-3xl font-display font-extrabold text-accentCyan mt-2">2</p>
            <span className="text-[10px] text-gray-500 block mt-2">1 emergency broadcast</span>
          </div>
          <div className="p-3.5 rounded-xl bg-accentCyan/10 text-accentCyan shadow-cyanGlow">
            <Building size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Maintenance Dues</p>
            <p className="text-3xl font-display font-extrabold text-white mt-2">
              {billPaid ? 'Paid' : '$3,400'}
            </p>
            <span className="text-[10px] text-gray-500 block mt-2">
              {billPaid ? 'Receipt sent to S3' : 'Due date: June 20, 2026'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-accentEmerald/10 text-accentEmerald shadow-emeraldGlow">
            <CreditCard size={22} />
          </div>
        </div>

      </div>

      {/* Grid: Notice Board & Billing Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Notices Board (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <Building className="text-accentPurple" size={20} />
                Society Bulletins & Board
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Community alerts translated automatically</p>
            </div>
            
            <div className="flex items-center gap-2 bg-darkBg/60 p-1.5 rounded-xl border border-white/5">
              <Globe size={13} className="text-gray-400" />
              <select 
                value={selectedLang} 
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {notices.map((notice) => (
              <div 
                key={notice.id} 
                className="p-5 rounded-xl glass-panel border-l-4 border-l-accentPurple hover:border-l-accentCyan transition duration-300 relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                    notice.category === 'Emergency' 
                      ? 'bg-accentRose/10 text-accentRose border border-accentRose/20' 
                      : 'bg-accentIndigo/10 text-accentIndigo border border-accentIndigo/20'
                  }`}>
                    {notice.category}
                  </span>
                  
                  <div className="flex gap-2">
                    {notice.title !== notice.originalTitle && (
                      <button 
                        onClick={() => handleResetTranslation(notice.id)}
                        className="text-[10px] text-gray-500 hover:text-white transition"
                      >
                        Reset
                      </button>
                    )}
                    <button 
                      onClick={() => handleTranslate(notice.id)}
                      disabled={translatingId === notice.id}
                      className="text-[10px] text-accentPurple hover:text-accentCyan flex items-center gap-1 transition"
                    >
                      {translatingId === notice.id ? (
                        <span className="w-3 h-3 border border-accentPurple border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>Translate</>
                      )}
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-semibold text-white mb-2">{notice.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{notice.content}</p>
                
                <div className="text-[10px] text-gray-500 mt-4">
                  Posted on {notice.date} • SMM Admin Broadcast
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding Billing Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <CreditCard className="text-accentCyan" size={20} />
              Maintenance Bill
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Secure Razorpay interface</p>
          </div>

          <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accentEmerald/5 rounded-full blur-2xl"></div>
            
            <p className="text-xs text-gray-500 uppercase tracking-wider">Billing Period</p>
            <h4 className="text-lg font-bold text-white mt-1">June 2026</h4>
            
            <div className="my-5 border-t border-b border-white/5 py-4 space-y-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Base Society charges</span>
                <span>$2,500</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Utility & water backup</span>
                <span>$900</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Penalties computed</span>
                <span className="text-accentEmerald">$0</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-white pt-2 border-t border-white/5">
                <span>Total Amount Due</span>
                <span>$3,400</span>
              </div>
            </div>

            {billPaid ? (
              <div className="text-center py-4 bg-accentEmerald/10 border border-accentEmerald/30 rounded-xl">
                <CheckCircle2 className="mx-auto text-accentEmerald mb-2" size={26} />
                <p className="text-sm font-semibold text-white">Payment Received</p>
                <p className="text-[10px] text-gray-400 mt-1">Transaction: tx_983178239</p>
              </div>
            ) : (
              <button 
                onClick={() => handlePayBill('bill_june')}
                disabled={payingBillId !== null}
                className="w-full bg-accentPurple hover:bg-accentIndigo text-white rounded-xl py-3 text-xs font-semibold hover:shadow-glow transition"
              >
                {payingBillId ? (
                  <span className="flex justify-center items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Initializing checkout...
                  </span>
                ) : (
                  <>Pay Maintenance Online</>
                )}
              </button>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-500">
              <ShieldAlert size={12} />
              SSL Encrypted Sandbox Payments
            </div>
          </div>
        </div>

      </div>

      {/* Infrastructure AI Telemetry Monitoring Area */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Activity className="text-accentOrange" size={20} />
            Asset Telemetry & AI Predictive Maintenance
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Simulated IoT sensors alerting automatic technician dispatches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assets.map((asset, index) => (
            <div key={asset.name} className="p-5 rounded-2xl glass-panel relative overflow-hidden">
              {/* Highlight background if asset is critical */}
              {asset.status === 'Critical-Failure' && (
                <div className="absolute inset-0 bg-accentRose/5 pointer-events-none border border-accentRose/20 rounded-2xl"></div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">{asset.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase mt-0.5">{asset.type}</p>
                </div>
                
                <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${
                  asset.status === 'Operational' 
                    ? 'bg-accentEmerald/10 text-accentEmerald' 
                    : asset.status === 'Under-Maintenance'
                    ? 'bg-accentOrange/10 text-accentOrange'
                    : 'bg-accentRose/10 text-accentRose'
                }`}>
                  {asset.status}
                </span>
              </div>

              {/* Sensor stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 border-t border-b border-white/5 py-3 text-center">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Vibration</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{asset.vibration} mm/s</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Temp</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{asset.temperature}°C</p>
                </div>
              </div>

              {/* Risk meter */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>AI Predicted Failure Risk</span>
                  <span className={asset.risk > 70 ? 'text-accentRose font-bold' : ''}>{asset.risk}%</span>
                </div>
                <div className="w-full bg-darkBg/60 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      asset.risk > 70 
                        ? 'bg-accentRose shadow-roseGlow' 
                        : asset.risk > 40 
                        ? 'bg-accentOrange' 
                        : 'bg-accentEmerald'
                    }`} 
                    style={{ width: `${asset.risk}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 bg-darkBg/30 p-2.5 rounded-lg border border-white/5 min-h-[46px]">
                <strong className="text-white">AI Suggests:</strong> {asset.action}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-[9px] text-gray-500">Live monitoring socket active</span>
                
                <button 
                  onClick={() => triggerMockTelemetryLog(index)}
                  className="p-1 text-[10px] text-accentPurple hover:text-accentCyan flex items-center gap-1 transition"
                >
                  <Play size={10} />
                  Simulate Telemetry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
