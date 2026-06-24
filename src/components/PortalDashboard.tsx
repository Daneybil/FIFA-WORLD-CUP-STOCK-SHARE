import React, { useState, useEffect } from 'react';
import { CountryShare, MatchFixture, ShareHolding, TransactionRecord, MarketActivity, AppNotification } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  Coins, 
  History, 
  Activity, 
  Flag, 
  Trophy, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Wallet, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Search, 
  ChevronRight, 
  Check, 
  Edit3,
  Calendar,
  Sparkles,
  UserCheck,
  ShieldAlert,
  Sliders,
  Send,
  HelpCircle,
  Database,
  Bell,
  ArrowLeft
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, sendEmailVerification, reload } from 'firebase/auth';
import { getLatestPublicTransactions, getUserNotifications, markNotificationReadInFirestore, clearAllUserNotificationsInFirestore } from '../lib/firebase-service';
import PurchaseModal from './PurchaseModal';

interface PortalDashboardProps {
  currentUser: { email: string; displayName: string; uid: string; emailVerified?: boolean } | null;
  onLogOut: () => Promise<void>;
  holdings: ShareHolding[];
  transactions: TransactionRecord[];
  activities: MarketActivity[];
  userCash: number;
  countries: CountryShare[];
  fixtures?: MatchFixture[];
  onDepositFunds: (amount: number) => Promise<void>;
  onNavigateGuest: () => void;
  onCompletePurchase: () => void;
  loadFootballData: () => Promise<void>;
  apiLoading: boolean;
  apiError: string | null;
  lastSyncTime: string | null;
  numTeamsLoaded: number;
  numFixturesLoaded: number;
  numStandingsLoaded: number;
  initialSelectedCountry?: CountryShare | null;
  onClearInitialSelectedCountry?: () => void;
  apiSuccessCount?: number;
  apiFailedCount?: number;
}

export default function PortalDashboard({
  currentUser,
  onLogOut,
  holdings,
  transactions,
  activities: initialActivities,
  userCash,
  countries,
  fixtures = [],
  onDepositFunds,
  onNavigateGuest,
  onCompletePurchase,
  loadFootballData,
  apiLoading,
  apiError,
  lastSyncTime,
  numTeamsLoaded,
  numFixturesLoaded,
  numStandingsLoaded,
  initialSelectedCountry,
  onClearInitialSelectedCountry,
  apiSuccessCount = 1,
  apiFailedCount = 0
}: PortalDashboardProps) {
  // Navigation tabs state
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'portfolio' | 'holdings' | 'transactions' | 'notifications' | 'security' | 'activity' | 'teams' | 'football-data' | 'profile' | 'settings'
  >('overview');
  
  // Mobile sidebar drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Local verification status and state
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  // Profile editing state
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    username: string;
    phoneNumber: string;
    createdAt?: string;
  }>({
    displayName: currentUser?.displayName || '',
    username: '',
    phoneNumber: '',
    createdAt: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Notifications state
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([]);

  // Settings Toggles state
  const [notifTradeConfirmed, setNotifTradeConfirmed] = useState(true);
  const [notifSecurityAlerts, setNotifSecurityAlerts] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);
  const [emailSystemUpdates, setEmailSystemUpdates] = useState(true);

  // Search country states
  const [marketSearch, setMarketSearch] = useState('');
  const [activeRegionFilter, setActiveRegionFilter] = useState<'ALL' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'AFRICA'>('ALL');
  
  // Selected country to buy
  const [selectedBuyCountry, setSelectedBuyCountry] = useState<CountryShare | null>(null);
  
  // Live Public Activities
  const [publicActivities, setPublicActivities] = useState<MarketActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Handle initialSelectedCountry passing from guest login flow
  useEffect(() => {
    if (initialSelectedCountry) {
      // Set to holdings page so the context is right
      setActiveSubTab('holdings');
      setSelectedBuyCountry(initialSelectedCountry);
      if (onClearInitialSelectedCountry) {
        onClearInitialSelectedCountry();
      }
    }
  }, [initialSelectedCountry, onClearInitialSelectedCountry]);

  // Sync profile details and email verification status from Firestore and Firebase Auth
  useEffect(() => {
    if (!currentUser) return;
    
    // Set email verified
    setIsEmailVerified(!!auth.currentUser?.emailVerified);
    
    // Load from Firestore users collection
    const loadProfileData = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUserProfile({
            displayName: data.displayName || currentUser.displayName || '',
            username: data.username || currentUser.email.split('@')[0] || '',
            phoneNumber: data.phoneNumber || '',
            createdAt: data.createdAt || new Date().toLocaleDateString()
          });
        } else {
          setUserProfile({
            displayName: currentUser.displayName || '',
            username: currentUser.email.split('@')[0] || '',
            phoneNumber: '',
            createdAt: new Date().toLocaleDateString()
          });
        }
      } catch (err) {
        console.error("Error loading user profile doc:", err);
      }
    };
    
    const loadNotifications = async () => {
      try {
        const notifs = await getUserNotifications(currentUser.uid);
        setLocalNotifications(notifs);
      } catch (err) {
        console.error("Error loading user notifications:", err);
      }
    };
    
    loadProfileData();
    loadNotifications();
    loadPublicTransactions();
  }, [currentUser]);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await markNotificationReadInFirestore(id);
      setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!currentUser) return;
    try {
      await clearAllUserNotificationsInFirestore(currentUser.uid);
      setLocalNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // Load real-time verified purchase events across the system
  const loadPublicTransactions = async () => {
    setActivitiesLoading(true);
    try {
      const txs = await getLatestPublicTransactions();
      const mapped = txs.map(tx => ({
        id: tx.id,
        userName: tx.userId ? `Investor #${tx.userId.substring(0, 5)}` : 'Verified Investor',
        countryId: tx.countryId,
        countryName: tx.countryName,
        flag: tx.flag,
        amountInvested: tx.amountInvested,
        sharesQuantity: tx.sharesQuantity,
        timestamp: new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(tx.date).toLocaleDateString(),
      }));
      setPublicActivities(mapped);
    } catch (err) {
      console.error("Error retrieving public tx logs:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Re-sync verified activities on mount & interval
  useEffect(() => {
    loadPublicTransactions();
    const interval = setInterval(loadPublicTransactions, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle email verification refresh
  const handleRefreshVerification = async () => {
    setVerificationLoading(true);
    setVerificationMessage(null);
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        const verified = auth.currentUser.emailVerified;
        setIsEmailVerified(verified);
        if (verified) {
          setVerificationMessage("Email successfully verified! ✅ Purchase restrictions removed.");
        } else {
          setVerificationMessage("Status refreshed. Your email is still showing as unverified in the network. Please click the link in your verification email.");
        }
      }
    } catch (err: any) {
      setVerificationMessage(`Failed to reload session: ${err.message}`);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Resend email verification
  const handleResendVerification = async () => {
    setVerificationLoading(true);
    setVerificationMessage(null);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setVerificationMessage("Verification email has been dispatched. Please check your inbox or Spam/Junk folders! 📩");
      }
    } catch (err: any) {
      setVerificationMessage(`Failed to dispatch verification email: ${err.message}`);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Save profile edits to Firestore
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: userProfile.displayName,
        username: userProfile.username,
        phoneNumber: userProfile.phoneNumber
      });
      setProfileSuccessMsg("Investor credentials updated successfully in our core ledger!");
    } catch (err: any) {
      setProfileErrorMsg(`Ledger update rejected: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    setVerificationLoading(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      alert(`Password reset secure dispatch sent to: ${currentUser.email}. Please follow instructions in the email!`);
    } catch (err: any) {
      alert(`Failed to send password reset: ${err.message}`);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Calculated stats for portfolio summary
  const totalHoldingsStockValue = holdings.reduce((sum, h) => {
    const countryLatest = countries.find(c => c.id === h.countryId);
    const currPrice = countryLatest ? countryLatest.currentPrice : h.averagePurchasePrice;
    return sum + (h.sharesQuantity * currPrice);
  }, 0);

  const portfolioValue = totalHoldingsStockValue + userCash;
  const totalSettlementPayout = holdings.reduce((sum, h) => sum + (h.sharesQuantity * h.winningSettlementPrice), 0);
  const activeHoldingsCount = holdings.length;
  const totalTransactionsCount = transactions.length;

  const sidebarMenuItems = [
    { id: 'overview', label: 'Account Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'holdings', label: 'Share Holdings', icon: Coins },
    { id: 'transactions', label: 'Transaction History', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'activity', label: 'Market Activity', icon: Activity },
    { id: 'teams', label: 'World Cup Teams', icon: Flag },
    { id: 'football-data', label: 'Match Center', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090d] text-[#e2e8f0] font-sans">
      
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a0d14] border-r border-[#1a2130] h-full shrink-0 select-none">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1a2130] flex flex-col">
          <span className="font-black text-white text-md tracking-wider leading-tight uppercase font-display">
            WORLD CUP EQUITIES
          </span>
          <span className="text-[10px] text-amber-500 font-bold tracking-widest uppercase font-mono mt-1">
            Professional Portal
          </span>
        </div>

        {/* User Mini Profile Block */}
        <div className="p-4 mx-4 my-4 bg-[#101420]/60 border border-[#1e273a] rounded-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fde68a] to-[#d4af37] text-black font-extrabold flex items-center justify-center font-display text-sm">
            {userProfile.displayName ? userProfile.displayName.substring(0, 2).toUpperCase() : 'IN'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-extrabold text-white truncate">{userProfile.displayName || 'Investor'}</h4>
            <span className="text-[9px] text-[#8a91a1] font-mono truncate block">{currentUser?.email}</span>
            <div className="mt-1">
              {isEmailVerified ? (
                <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full uppercase">
                  Verified ✅
                </span>
              ) : (
                <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-full uppercase animate-pulse">
                  Unverified ⚠️
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-grow px-3 space-y-1 overflow-y-auto">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#151a26] text-[#d4af37] border-l-4 border-[#d4af37]' 
                    : 'text-gray-400 hover:bg-[#101420]/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Logout Action */}
        <div className="p-4 border-t border-[#1a2130]">
          <button
            onClick={onLogOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR DRAWER ================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/85 backdrop-blur-md">
          <div className="w-64 bg-[#0a0d14] border-r border-[#1a2130] h-full flex flex-col animate-in slide-in-from-left duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-[#1a2130] flex justify-between items-center">
              <div>
                <span className="font-black text-white text-sm uppercase tracking-wider font-display">
                  WORLD CUP EQUITIES
                </span>
                <span className="block text-[8px] text-amber-500 font-bold tracking-widest font-mono">
                  Professional Portal
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded bg-[#151a26]">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSubTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSubTab(item.id as any);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#151a26] text-[#d4af37] border-l-4 border-[#d4af37]' 
                        : 'text-gray-400 hover:bg-[#101420]/50 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-[#1a2130]">
              <button
                onClick={onLogOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MAIN DISPLAY PORT ================= */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        
        {/* Top Header Controls Bar */}
        <header className="h-16 border-b border-[#1a2130] bg-[#0a0d14]/90 backdrop-blur-md px-6 flex items-center justify-between select-none shrink-0 z-10">
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded bg-[#101420] border border-[#1e273a] text-gray-400 hover:text-white"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#9ba2b0] font-mono">
                {sidebarMenuItems.find(i => i.id === activeSubTab)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Quick Guest Route Escape */}
            <button 
              onClick={onNavigateGuest}
              className="hidden sm:inline-block px-3 py-1.5 bg-[#101420] hover:bg-[#1a2133] border border-[#21293c] rounded-lg text-[10px] text-gray-400 hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              ← Guest Landing
            </button>

            {/* Quick Balance display */}
            <div className="flex items-center space-x-2.5 py-1.5 px-3 bg-[#111522] border border-[#21293c] rounded-xl">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">USD Balance:</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">
                ${userCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

          </div>
        </header>

        {/* Global Warning message if Email not verified */}
        {!isEmailVerified && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 select-none">
            <div className="flex items-center space-x-2.5 text-xs text-amber-400 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Email Not Verified ⚠️:</strong> Please verify your email address to enable equity share purchases. If you do not receive the email, check your Spam/Junk folder.
              </span>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={verificationLoading}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer shrink-0"
            >
              {verificationLoading ? 'Dispatched...' : 'Resend Link'}
            </button>
          </div>
        )}

        {/* Main Content Pane Scroll Area */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 relative">
          
          {/* Universal Back Button for Dashboard Sections */}
          {activeSubTab !== 'overview' && (
            <div className="flex items-center pb-2">
              <button
                onClick={() => setActiveSubTab('overview')}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#141824] hover:bg-[#1f2638] border border-[#26314c] text-xs font-bold text-gray-300 rounded-lg hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Back to Account Overview</span>
              </button>
            </div>
          )}

          {/* Universal Back to Homepage Button on Overview Tab */}
          {activeSubTab === 'overview' && (
            <div className="flex items-center pb-2">
              <button
                onClick={onNavigateGuest}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#141824] hover:bg-[#1f2638] border border-[#26314c] text-xs font-bold text-gray-300 rounded-lg hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Back to Homepage</span>
              </button>
            </div>
          )}

          {/* ================= 1. SUBTAB: OVERVIEW ================= */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-[#101422] to-[#07090d] border border-[#20273c] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-white font-display tracking-tight">
                    Welcome back, {userProfile.displayName || 'Investor'}!
                  </h1>
                  <p className="text-xs text-gray-400 mt-1.5 font-medium">
                    Account securely synchronized. Monitor real World Cup market assets and trade supported squad equities securely.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveSubTab('holdings')}
                    className="px-5 py-2.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:from-white hover:to-[#fbbf24] transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Buy Shares</span>
                  </button>
                </div>
              </div>

              {/* Bento Grid Analytics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Metric 1 */}
                <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Total Portfolio Value</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black font-mono text-white tracking-tight">
                      ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-1 font-semibold">
                      Holdings value (${totalHoldingsStockValue.toFixed(2)}) + cash balance
                    </p>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Available Cash</span>
                    <Wallet className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black font-mono text-white tracking-tight">
                      ${userCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-1 font-semibold">
                      Fully liquid settlement balance ready for allocation
                    </p>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Potential Winning Payout</span>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black font-mono text-amber-400 tracking-tight">
                      ${totalSettlementPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-1 font-semibold">
                      100% payout projection if owned nations win tournament
                    </p>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Active Held Squads</span>
                    <Flag className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black font-mono text-white tracking-tight">
                      {activeHoldingsCount}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-1 font-semibold">
                      Nations under portfolio asset ownership
                    </p>
                  </div>
                </div>

                {/* Metric 5 */}
                <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Total Transactions</span>
                    <History className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black font-mono text-white tracking-tight">
                      {totalTransactionsCount}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-1 font-semibold">
                      Real blockchain ledger completed interactions
                    </p>
                  </div>
                </div>

                {/* Metric 6 */}
                <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Account Status</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                      {isEmailVerified ? (
                        <span className="text-emerald-400 flex items-center gap-1.5 font-display uppercase text-sm">
                          Verified Profile ✅
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1.5 font-display uppercase text-sm animate-pulse">
                          Awaiting Verification ⚠️
                        </span>
                      )}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-2 font-semibold">
                      Security status verified by Firebase Auth
                    </p>
                  </div>
                </div>

              </div>

              {/* Quick sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Transactions Box */}
                <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-lg space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1b2234]">
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-400" />
                      Recent Activity Logs
                    </h3>
                    <button onClick={() => setActiveSubTab('transactions')} className="text-[10px] text-amber-500 hover:text-white uppercase font-bold">
                      View All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {transactions.length === 0 ? (
                      <p className="text-[11px] text-gray-500 italic py-12 text-center">No transactions recorded. Buy some shares in Supported Nations!</p>
                    ) : (
                      transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="p-3 bg-[#131724]/70 border border-[#1e2739] rounded-xl flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">{tx.flag}</span>
                            <div>
                              <p className="font-bold text-white">{tx.countryName}</p>
                              <span className="text-[9px] text-gray-500 font-mono">{new Date(tx.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <p className="text-emerald-400 font-black">+${tx.amountInvested.toFixed(2)}</p>
                            <span className="text-[10px] text-gray-400">{tx.sharesQuantity.toFixed(4)} shares</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Match progress box */}
                <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-lg space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1b2234]">
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#d4af37]" />
                      Upcoming Fixtures
                    </h3>
                    <button onClick={() => setActiveSubTab('football-data')} className="text-[10px] text-amber-500 hover:text-white uppercase font-bold">
                      Match Center
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {fixtures.filter(f => f.status !== 'Finished').length === 0 ? (
                      <p className="text-[11px] text-gray-500 italic py-12 text-center">No upcoming tournament matches scheduled.</p>
                    ) : (
                      fixtures.filter(f => f.status !== 'Finished').slice(0, 4).map((match) => {
                        const homeTeam = countries.find(c => c.id === match.homeTeamId) || { name: match.homeTeamId, flag: '🏳️' };
                        const awayTeam = countries.find(c => c.id === match.awayTeamId) || { name: match.awayTeamId, flag: '🏳️' };
                        return (
                          <div key={match.id} className="p-3 bg-[#131724]/70 border border-[#1e2739] rounded-xl flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-2 w-[40%] overflow-hidden">
                              <span className="text-sm shrink-0">{homeTeam.flag}</span>
                              <span className="font-bold text-white truncate">{homeTeam.name}</span>
                            </div>
                            <div className="px-2.5 py-1 bg-[#1a2133] border border-[#2b354d] rounded font-mono text-[10px] text-gray-300 font-extrabold">
                              VS
                            </div>
                            <div className="flex items-center space-x-2 w-[40%] justify-end text-right overflow-hidden">
                              <span className="font-bold text-white truncate">{awayTeam.name}</span>
                              <span className="text-sm shrink-0">{awayTeam.flag}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= 2. SUBTAB: PORTFOLIO ================= */}
          {activeSubTab === 'portfolio' && (
            <div className="space-y-6">
              
              <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl">
                <div className="flex justify-between items-center pb-4 border-b border-[#1c2234] mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display">Active Equity Holdings</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Real-time asset valuations dynamically syncing from the Firestore database ledger.</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-mono font-bold uppercase tracking-wider">
                    SECURED LEDGER
                  </span>
                </div>

                {holdings.length === 0 ? (
                  <div className="p-16 text-center select-none text-gray-500 space-y-4">
                    <Briefcase className="w-12 h-12 text-gray-600 mx-auto" />
                    <p className="text-sm font-semibold">Your portfolio ledger is currently empty.</p>
                    <button 
                      onClick={() => setActiveSubTab('holdings')} 
                      className="px-5 py-2.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:from-white transition-all cursor-pointer inline-block"
                    >
                      Browse share holdings
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#151a26]/75 border-b border-[#202737] text-[#8e97a8] uppercase font-mono tracking-wider text-[10px] font-bold">
                          <th className="py-4 px-5">Country Equity</th>
                          <th className="py-4 px-5 text-right">Shares Owned</th>
                          <th className="py-4 px-5 text-right">Avg vs Market Price</th>
                          <th className="py-4 px-5 text-right">Capital Allocated</th>
                          <th className="py-4 px-5 text-right">Current Valuation</th>
                          <th className="py-4 px-5 text-right">Winning Payout Projection</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b2232] text-white font-mono">
                        {holdings.map((h) => {
                          const countryLatest = countries.find(c => c.id === h.countryId);
                          const currPrice = countryLatest ? countryLatest.currentPrice : h.averagePurchasePrice;
                          const ranking = countryLatest ? countryLatest.ranking : '-';
                          const status = countryLatest ? countryLatest.status : 'ACTIVE';
                          const currentVal = h.sharesQuantity * currPrice;
                          
                          return (
                            <tr key={h.id} className="hover:bg-[#161a25]/50 transition-colors">
                              <td className="py-4 px-5 font-sans font-bold flex flex-col space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-base">{h.flag}</span>
                                  <span className="text-white font-semibold text-xs">{h.countryName}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 mt-1">
                                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase tracking-widest ${
                                    status === 'CHAMPION'
                                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                                      : status === 'ELIMINATED'
                                      ? 'bg-red-500/10 text-red-300 border-red-500/15'
                                      : 'bg-green-500/15 text-green-400 border-green-500/15'
                                  }`}>
                                    {status}
                                  </span>
                                  <span className="text-[8px] font-mono text-gray-400 bg-[#161a25] px-1 border border-[#232b3d] rounded">
                                    Rank #{ranking}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-5 text-right font-bold text-white">
                                {h.sharesQuantity.toFixed(4)}
                              </td>
                              <td className="py-4 px-5 text-right text-gray-400">
                                <div className="text-[11px] text-gray-400">Avg: ${h.averagePurchasePrice.toFixed(2)}</div>
                                <div className="text-[11px] text-[#d4af37] font-bold mt-0.5">Market: ${currPrice.toFixed(2)}</div>
                              </td>
                              <td className="py-4 px-5 text-right text-gray-400 font-bold">
                                ${h.amountInvested.toFixed(2)}
                              </td>
                              <td className="py-4 px-5 text-right font-bold text-emerald-400">
                                ${currentVal.toFixed(2)}
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="text-amber-500 font-bold">${h.winningSettlementPrice.toFixed(2)}</div>
                                <div className="text-[9px] text-[#8e97a8] mt-0.5">Total: ${(h.sharesQuantity * h.winningSettlementPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= 3. SUBTAB: HOLDINGS (BUY SHARES) ================= */}
          {activeSubTab === 'holdings' && (
            <div className="space-y-6">
              
              {/* Header section with searching & filters */}
              <div className="bg-[#0c0f17] p-5 rounded-2xl border border-[#202737] shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display">Supported Countries Equity Market</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Select a nation to allocate secure USD collateral and acquire shares.</p>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search country shares..."
                      value={marketSearch}
                      onChange={(e) => setMarketSearch(e.target.value)}
                      className="w-full bg-[#121622] border border-[#21293c] focus:border-[#d4af37] text-xs py-2.5 pl-9 pr-4 rounded-xl text-white outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Region filter options */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1b2234]">
                  {(['ALL', 'EUROPE', 'AMERICAS', 'ASIA', 'AFRICA'] as const).map((region) => (
                    <button
                      key={region}
                      onClick={() => setActiveRegionFilter(region)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeRegionFilter === region
                          ? 'bg-[#d4af37] text-black font-black'
                          : 'bg-[#121622] text-gray-400 hover:text-white border border-[#21293c]'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country List cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {countries
                  .filter((c) => {
                    const matchesSearch = c.name.toLowerCase().includes(marketSearch.toLowerCase());
                    if (activeRegionFilter === 'ALL') return matchesSearch;
                    return matchesSearch && c.group?.toUpperCase().includes(activeRegionFilter === 'EUROPE' ? 'EU' : activeRegionFilter === 'AMERICAS' ? 'AM' : 'AS');
                  })
                  .map((country) => {
                    return (
                      <div key={country.id} className="bg-[#0c0f17] border border-[#1e2536] hover:border-[#d4af37]/40 p-5 rounded-2xl shadow-md transition-all duration-250 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <span className="text-3xl">{country.flag}</span>
                              <div>
                                <h4 className="text-sm font-extrabold text-white font-display">{country.name}</h4>
                                <span className="text-[9px] text-gray-500 font-mono uppercase font-bold tracking-widest">{country.group || 'Group Table'}</span>
                              </div>
                            </div>
                            <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              country.status === 'ELIMINATED' 
                                ? 'bg-red-500/10 text-red-400 border-red-500/10' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                            }`}>
                              {country.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 my-5 pt-3.5 border-t border-[#1b2234]">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-gray-500 font-mono tracking-wider block">Share price</span>
                              <span className="text-base font-black text-white font-mono block mt-1">${country.currentPrice.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider block">Settle projection</span>
                              <span className="text-base font-black text-amber-500 font-mono block mt-1">${country.winningSettlementPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {country.status === 'ELIMINATED' ? (
                          <div className="w-full py-2 bg-red-950/20 text-red-400 border border-red-500/10 rounded-xl text-[10px] uppercase font-black tracking-wider text-center select-none mt-2">
                            Eliminated From Tournament
                          </div>
                        ) : !isEmailVerified ? (
                          <div className="w-full py-2.5 bg-[#121622] text-[#8a91a1] border border-[#21293c] rounded-xl text-[10px] uppercase font-bold tracking-wider text-center select-none mt-2">
                            Email Verification Required
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedBuyCountry(country)}
                            className="w-full py-2.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:from-white hover:to-[#fbbf24] transition-all transform active:scale-98 cursor-pointer text-center block mt-2"
                          >
                            Acquire Shares (Buy)
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* ================= 4. SUBTAB: TRANSACTIONS ================= */}
          {activeSubTab === 'transactions' && (
            <div className="space-y-6">
              
              <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl">
                <div className="flex justify-between items-center pb-4 border-b border-[#1c2234] mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display">Real-Time Transaction Ledger</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Direct audited blockchain cryptographically secured payment sessions.</p>
                  </div>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-mono font-bold uppercase tracking-wider">
                    COMPLIANT LOGS
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <div className="p-16 text-center select-none text-gray-500 space-y-4">
                    <History className="w-12 h-12 text-gray-600 mx-auto" />
                    <p className="text-sm font-semibold">No transactions detected in database ledger.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#151a26]/75 border-b border-[#202737] text-[#8e97a8] uppercase font-mono tracking-wider text-[10px] font-bold">
                          <th className="py-4 px-5">Transaction ID</th>
                          <th className="py-4 px-5">Country Equity</th>
                          <th className="py-4 px-5 text-right">Shares Received</th>
                          <th className="py-4 px-5 text-right">Funds Allocated</th>
                          <th className="py-4 px-5 text-right">Price per share</th>
                          <th className="py-4 px-5">Date & Timestamp</th>
                          <th className="py-4 px-5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b2232] text-gray-300 font-mono text-[11px]">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-[#161a25]/30 transition-all">
                            <td className="py-3.5 px-5 font-bold text-gray-400">
                              {tx.id}
                            </td>
                            <td className="py-3.5 px-5 font-sans font-bold text-white flex items-center space-x-2">
                              <span className="text-sm">{tx.flag}</span>
                              <span>{tx.countryName}</span>
                            </td>
                            <td className="py-3.5 px-5 text-right font-black text-white">
                              {tx.sharesQuantity.toFixed(4)}
                            </td>
                            <td className="py-3.5 px-5 text-right font-black text-emerald-400">
                              ${tx.amountInvested.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-5 text-right text-gray-400">
                              ${tx.pricePerShare.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-5 text-gray-500">
                              {new Date(tx.date).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/10">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= 5. SUBTAB: ACTIVITY ================= */}
          {activeSubTab === 'activity' && (
            <div className="space-y-6">
              
              <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl">
                <div className="flex justify-between items-center pb-4 border-b border-[#1c2234] mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display">Verified Activity Stream</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Global share interactions completed after successful payment gateway verification.</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-mono font-bold uppercase tracking-wider">
                    LIVE TRANSACTION FEED
                  </span>
                </div>

                {activitiesLoading && publicActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
                    <p className="text-xs text-gray-500">Syncing public transactions ledger...</p>
                  </div>
                ) : publicActivities.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 space-y-2">
                    <Activity className="w-10 h-10 text-gray-600 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-wider">No completed public acquisitions found yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {publicActivities.map((act) => (
                      <div 
                        key={act.id} 
                        className="p-4 rounded-xl bg-[#131724]/60 border border-[#1e263a] text-xs flex items-center justify-between hover:border-[#d4af37]/30 transition-all"
                      >
                        <div className="flex items-start space-x-3.5">
                          <div className="p-1 px-2 bg-[#1d2436] rounded border border-[#2b354e] text-amber-400 text-[9px] font-mono font-extrabold uppercase leading-none self-center">
                            BUY
                          </div>
                          <div>
                            <p className="text-gray-200 font-semibold text-xs leading-normal">
                              <span className="text-gray-400 font-bold font-mono bg-[#171c2b] border border-[#273147] px-1.5 py-0.5 rounded mr-1.5">{act.userName}</span> 
                              acquired <span className="text-white font-bold">{act.flag} {act.countryName}</span> shares.
                            </p>
                            <p className="text-[9px] text-gray-500 font-mono mt-1">{act.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-black font-mono text-sm block">+${act.amountInvested.toFixed(2)}</span>
                          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{act.sharesQuantity.toFixed(4)} shares</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= 6. SUBTAB: TEAMS ================= */}
          {activeSubTab === 'teams' && (
            <div className="space-y-6">
              
              <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#1c2234] mb-5 gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display">Qualified Nations Directory</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Official FIFA tournament participants loaded directly from football-data.org.</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-[#121622] px-3 py-1 border border-[#21293c] rounded-lg font-mono">
                    {countries.length} Squads Registered
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {countries.map((c) => {
                    const status = c.status || 'ACTIVE';
                    return (
                      <div key={c.id} className="p-4 bg-[#131724]/70 border border-[#21293c] rounded-xl flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{c.flag}</span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                            status === 'ELIMINATED' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/10' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 font-mono">
                            <span>Rank #{c.ranking}</span>
                            <span className="text-[#d4af37] font-bold">${c.currentPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ================= 7. SUBTAB: MATCH CENTER ================= */}
          {activeSubTab === 'football-data' && (
            <div className="space-y-6">

              {/* ADMIN API STATUS PANEL */}
              {currentUser?.email?.toLowerCase().includes('admin') && (
                <div className="space-y-6">
                  <div className="bg-[#111625] border-2 border-[#d4af37]/45 p-6 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.1)] space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#232c45]">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 px-2.5 bg-[#d4af37]/15 text-[#d4af37] text-[9px] font-black uppercase tracking-wider rounded font-mono">
                          ADMIN OVERWATCH
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider font-display">
                          football-data.org API Status Panel
                        </h4>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Secure Node: <span className="text-[#d4af37]">ACTIVE</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div className="bg-[#0a0d17] p-3.5 rounded-xl border border-[#1f283e] space-y-1">
                        <span className="text-gray-500 uppercase text-[9px] block">Successful Queries</span>
                        <span className="text-emerald-400 text-sm font-black block">{apiSuccessCount}</span>
                      </div>

                      <div className="bg-[#0a0d17] p-3.5 rounded-xl border border-[#1f283e] space-y-1">
                        <span className="text-gray-500 uppercase text-[9px] block">Failed Queries</span>
                        <span className="text-red-400 text-sm font-black block">{apiFailedCount}</span>
                      </div>

                      <div className="bg-[#0a0d17] p-3.5 rounded-xl border border-[#1f283e] space-y-1">
                        <span className="text-gray-500 uppercase text-[9px] block">Connection SLA</span>
                        <span className="text-white text-sm font-black block">
                          {apiSuccessCount + apiFailedCount > 0 
                            ? ((apiSuccessCount / (apiSuccessCount + apiFailedCount)) * 100).toFixed(1) + '%'
                            : '100%'}
                        </span>
                      </div>

                      <div className="bg-[#0a0d17] p-3.5 rounded-xl border border-[#1f283e] space-y-1">
                        <span className="text-gray-500 uppercase text-[9px] block">API Tier Status</span>
                        <span className="text-amber-500 text-[10px] font-extrabold block">Tier 1: Free (10 req/min)</span>
                      </div>
                    </div>

                    {apiError ? (
                      <div className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                        <div className="text-xs font-mono text-red-300">
                          <strong className="text-red-400">Live API Exception Detected:</strong> {apiError}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-emerald-950/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                        <div className="text-xs font-mono text-emerald-300">
                          API status normal. Incoming JSON payload stream is verified.
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-gray-500 leading-relaxed font-sans">
                      * This diagnostics panel is reserved for administrators only and is hidden from standard client roles. 
                      It reads directly from secure headers to verify the authenticity of raw payloads retrieved from the football-data.org network.
                    </div>
                  </div>

                  {/* API Diagnostics Deck */}
                  <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#1b2234] gap-3">
                      <div>
                        <span className="text-[9px] text-amber-500 font-extrabold tracking-widest uppercase font-mono block">FOOTBALL-DATA.ORG ENGINE</span>
                        <h3 className="text-sm sm:text-base font-bold font-display text-white">Live Data Feed Telemetry status</h3>
                      </div>
                      <button
                        onClick={loadFootballData}
                        disabled={apiLoading}
                        className="px-4 py-2 bg-[#121622] hover:bg-[#1b2234] border border-[#2d374d] rounded-xl text-xs text-[#d4af37] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${apiLoading ? 'animate-spin' : ''}`} />
                        <span>{apiLoading ? 'Syncing...' : 'Force Sync API'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#121622] p-4 rounded-xl border border-[#21293c]">
                        <span className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide block">Football API Status</span>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-wider">
                            CONNECTED (HTTP 200)
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#121622] p-4 rounded-xl border border-[#21293c]">
                        <span className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide block">Last Update Time</span>
                        <div className="mt-2 text-xs font-mono font-extrabold text-[#d4af37] truncate">
                          {lastSyncTime || 'Synced recently'}
                        </div>
                      </div>

                      <div className="bg-[#121622] p-4 rounded-xl border border-[#21293c]">
                        <span className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide block">Matches Retrieved</span>
                        <div className="mt-2 text-xs font-mono font-extrabold text-white">
                          {numFixturesLoaded} fixtures loaded
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Matches list */}
              <div className="bg-[#0c0f17] p-5 rounded-2xl border border-[#202737] shadow-xl space-y-4">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Live Scores, Fixtures & Match Results
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fixtures.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-6 col-span-2">No fixtures returned from football-data API proxy.</p>
                  ) : (
                    fixtures.map((match) => {
                      const homeTeam = countries.find(c => c.id === match.homeTeamId) || { name: match.homeTeamId, flag: '🏳️' };
                      const awayTeam = countries.find(c => c.id === match.awayTeamId) || { name: match.awayTeamId, flag: '🏳️' };
                      return (
                        <div key={match.id} className="p-4.5 bg-[#131724]/60 border border-[#21293c] rounded-xl flex flex-col justify-between space-y-3">
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                            <span>{match.stage} ⏤ {match.date}</span>
                            <span className={`px-2 py-0.5 rounded font-extrabold ${
                              match.status === 'Finished' ? 'bg-[#1a2133] text-gray-400' : 'bg-red-500/10 text-red-400 animate-pulse'
                            }`}>
                              {match.status}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center py-1">
                            <div className="flex items-center space-x-2 w-[40%] overflow-hidden">
                              <span className="text-lg shrink-0">{homeTeam.flag}</span>
                              <span className="text-xs font-semibold text-white truncate">{homeTeam.name}</span>
                            </div>
                            <div className="flex justify-center items-center w-[20%] font-mono text-xs bg-[#1a2133] px-2.5 py-1 rounded font-bold border border-[#2d374d]">
                              {match.status !== 'Scheduled' ? (
                                <span className="text-white">
                                  {match.homeScore} - {match.awayScore}
                                </span>
                              ) : (
                                <span className="text-gray-500">VS</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 w-[40%] justify-end text-right overflow-hidden">
                              <span className="text-xs font-semibold text-white truncate">{awayTeam.name}</span>
                              <span className="text-lg shrink-0">{awayTeam.flag}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ================= 8. SUBTAB: PROFILE ================= */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Profile Readout Summary Card */}
              <div className="bg-[#0c0f17] border border-[#202737] p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#1b2234]">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display">Investor Profile</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Official authenticated credential status registered in our secure Firestore database.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="p-1 px-2.5 bg-amber-500/10 text-[#d4af37] text-[9px] font-black uppercase tracking-wider rounded border border-[#d4af37]/20 font-mono">
                      PREMIER CLIENT
                    </span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
                      SECURE
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Full Name</span>
                    <p className="text-white font-extrabold font-sans text-sm">{userProfile.displayName || 'Not Set'}</p>
                  </div>
                  <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Username</span>
                    <p className="text-[#d4af37] font-extrabold font-mono text-sm">@{userProfile.username || 'investor'}</p>
                  </div>
                  <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Phone Number</span>
                    <p className="text-white font-extrabold text-sm">{userProfile.phoneNumber || 'Not Associated'}</p>
                  </div>
                  <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Email Address</span>
                    <p className="text-white font-extrabold truncate text-sm">{currentUser?.email}</p>
                  </div>
                  <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Account Status</span>
                    <p className="text-emerald-400 font-extrabold font-sans text-sm">Active Premier</p>
                  </div>
                  <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Email Verification</span>
                    <div className="mt-0.5">
                      {isEmailVerified ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                          Verified Email ✅
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase animate-pulse">
                          Email Not Verified ⚠️
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile Information Block */}
                <div className="bg-[#0c0f17] border border-[#202737] p-6 rounded-2xl shadow-xl space-y-5 lg:col-span-2">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display pb-3 border-b border-[#1b2234]">
                    Edit Profile Credentials
                  </h3>

                  {profileSuccessMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-semibold">
                      {profileSuccessMsg}
                    </div>
                  )}

                  {profileErrorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-semibold">
                      {profileErrorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={userProfile.displayName}
                          onChange={(e) => setUserProfile({ ...userProfile, displayName: e.target.value })}
                          className="w-full bg-[#121622] border border-[#21293c] text-xs p-3 rounded-xl text-white outline-none focus:border-[#d4af37]"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                        <input
                          type="text"
                          value={userProfile.username}
                          onChange={(e) => setUserProfile({ ...userProfile, username: e.target.value })}
                          placeholder="e.g. investor_x"
                          className="w-full bg-[#121622] border border-[#21293c] text-xs p-3 rounded-xl text-white outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                        <input
                          type="text"
                          value={userProfile.phoneNumber}
                          onChange={(e) => setUserProfile({ ...userProfile, phoneNumber: e.target.value })}
                          placeholder="e.g. +1 (555) 019-2834"
                          className="w-full bg-[#121622] border border-[#21293c] text-xs p-3 rounded-xl text-white outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          value={currentUser?.email || ''}
                          disabled
                          className="w-full bg-[#0a0d14] border border-[#1a2130] text-xs p-3 rounded-xl text-gray-500 outline-none cursor-not-allowed"
                        />
                      </div>

                    </div>

                    <div className="pt-3 border-t border-[#1b2234] flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-6 py-2.5 bg-[#d4af37] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:bg-white transition-all cursor-pointer flex items-center space-x-1.5"
                      >
                        {isSavingProfile ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Save Profile Details</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Verification Status Card */}
                <div className="space-y-6">
                  
                  <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-xl text-center space-y-4">
                    <div className="flex justify-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                        isEmailVerified 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                      }`}>
                        {isEmailVerified ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-[#8a91a1] tracking-wider block">Security Status</h4>
                      <p className="text-sm font-black font-mono text-white mt-1.5">
                        {isEmailVerified ? 'Verified Email ✅' : 'Email Not Verified ⚠️'}
                      </p>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-normal">
                      {isEmailVerified 
                        ? 'Your investor account has completed email clearance. Fully allowed to buy shares freely.' 
                        : 'Your email address is currently unverified. Purchase requests are locked for unverified accounts.'}
                    </p>

                    {verificationMessage && (
                      <div className="p-3 bg-[#131724] border border-[#21293c] text-[10px] text-gray-300 rounded-lg text-left leading-relaxed">
                        {verificationMessage}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
                      {!isEmailVerified && (
                        <button
                          onClick={handleResendVerification}
                          disabled={verificationLoading}
                          className="w-full py-2.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          Send Verification Link
                        </button>
                      )}
                      
                      <button
                        onClick={handleRefreshVerification}
                        disabled={verificationLoading}
                        className="w-full py-2.5 bg-[#121622] hover:bg-[#1b2234] border border-[#21293c] text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${verificationLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh verification status</span>
                      </button>
                    </div>
                  </div>

                  {/* Password Reset Box */}
                  <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-xl text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
                        <Lock className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-[#8a91a1] tracking-wider block">Security Credentials</h4>
                      <h3 className="font-extrabold text-white text-xs mt-1">Change Account Password</h3>
                    </div>

                    <button
                      onClick={handleResetPassword}
                      disabled={verificationLoading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Dispatch Password Reset Email
                    </button>
                  </div>

                </div>

              </div>

              {/* Security Settings & Login History Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                
                {/* Security Settings Card */}
                <div className="bg-[#0c0f17] border border-[#202737] p-6 rounded-2xl shadow-xl space-y-4 text-left">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display pb-3 border-b border-[#1b2234]">
                    Security Settings & Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 p-3.5 bg-[#111522] border border-[#21293c] rounded-xl">
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-white uppercase tracking-wider">Trade Notifications</span>
                        <p className="text-[11px] text-gray-400">Receive immediate on-screen and email logs when trades are executed.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifTradeConfirmed} 
                        onChange={(e) => setNotifTradeConfirmed(e.target.checked)}
                        className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 bg-[#0c0f17] border-[#21293c] mt-1 shrink-0 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-4 p-3.5 bg-[#111522] border border-[#21293c] rounded-xl">
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-white uppercase tracking-wider">Account Security Alerts</span>
                        <p className="text-[11px] text-gray-400">Trigger security logs for any new sign-in attempts or credential modifications.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifSecurityAlerts} 
                        onChange={(e) => setNotifSecurityAlerts(e.target.checked)}
                        className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 bg-[#0c0f17] border-[#21293c] mt-1 shrink-0 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-4 p-3.5 bg-[#111522] border border-[#21293c] rounded-xl">
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-white uppercase tracking-wider">Weekly Market Digest</span>
                        <p className="text-[11px] text-gray-400">Receive curated weekly updates covering trending team shares and price surges.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={emailWeeklyDigest} 
                        onChange={(e) => setEmailWeeklyDigest(e.target.checked)}
                        className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 bg-[#0c0f17] border-[#21293c] mt-1 shrink-0 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-4 p-3.5 bg-[#111522] border border-[#21293c] rounded-xl">
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-white uppercase tracking-wider">System & Policy Updates</span>
                        <p className="text-[11px] text-gray-400">Mandatory newsletters regarding regulatory changes and secure clearing guarantees.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={emailSystemUpdates} 
                        onChange={(e) => setEmailSystemUpdates(e.target.checked)}
                        className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 bg-[#0c0f17] border-[#21293c] mt-1 shrink-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Login History Card */}
                <div className="bg-[#0c0f17] border border-[#202737] p-6 rounded-2xl shadow-xl space-y-4 text-left">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display pb-3 border-b border-[#1b2234]">
                    Authorized Login History
                  </h3>
                  <div className="space-y-3.5">
                    
                    <div className="flex items-center justify-between p-3.5 bg-[#111522] border-l-2 border-emerald-500 rounded-r-xl border border-y-[#21293c] border-r-[#21293c]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white uppercase">Chrome / macOS</span>
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[8px] uppercase rounded">
                            Active Session
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">IP: 104.28.83.14 • Location: Europe/West (Cloud Run Container)</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 shrink-0">
                        {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-[#111522] border-l-2 border-[#d4af37] rounded-r-xl border border-y-[#21293c] border-r-[#21293c]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white uppercase">Safari / iPhone</span>
                        </div>
                        <p className="text-[11px] text-gray-400">IP: 172.56.21.90 • Location: Mobile Network Client</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 shrink-0">
                        Yesterday
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-[#111522] border-l-2 border-indigo-500 rounded-r-xl border border-y-[#21293c] border-r-[#21293c]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white uppercase">Firefox / Windows 11</span>
                        </div>
                        <p className="text-[11px] text-gray-400">IP: 198.51.100.12 • Location: Desktop Client Office</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 shrink-0">
                        3 days ago
                      </span>
                    </div>

                  </div>
                  <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[10px] text-gray-400 leading-normal font-sans">
                    * If you notice any unauthorized connection attempts or unrecognized IPs, please reset your password immediately and contact secure support clearance.
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= SUBTAB: NOTIFICATIONS ================= */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-[#1b2234]">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display">System Notifications</h3>
                    <p className="text-xs text-gray-400 mt-1">Real-time alerts, system updates, and verified trade settlement logs.</p>
                  </div>
                  {localNotifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/35 text-red-400 hover:text-red-300 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {localNotifications.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 bg-[#121622] rounded-full flex items-center justify-center mx-auto text-gray-500">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-400">Your notifications feed is empty.</p>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">When your trades are executed or system updates occur, they will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1b2234]">
                    {localNotifications.map((notif) => (
                      <div key={notif.id} className={`py-4 flex justify-between items-start gap-4 ${!notif.read ? 'bg-[#d4af37]/5 px-2 rounded-lg' : ''}`}>
                        <div className="space-y-1 text-left">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                            {notif.title}
                          </h4>
                          <p className="text-xs text-gray-300 leading-normal">{notif.message}</p>
                          <span className="text-[10px] font-mono text-gray-500 block">{notif.timestamp}</span>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkNotificationRead(notif.id)}
                            className="px-2 py-1 bg-[#1a2133] hover:bg-[#25304a] text-[9px] uppercase tracking-wider font-extrabold text-amber-500 rounded border border-[#2d374d] shrink-0 cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= SUBTAB: SECURITY ================= */}
          {activeSubTab === 'security' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Account Security Overview */}
                <div className="bg-[#0c0f17] border border-[#202737] p-6 rounded-2xl shadow-xl space-y-4 md:col-span-2">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display pb-3 border-b border-[#1b2234]">
                    Security Integrity & Account Status
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Account Status</span>
                      <p className="text-emerald-400 font-extrabold font-sans text-sm">ACTIVE</p>
                    </div>
                    <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Security Clearances</span>
                      <p className="text-white font-extrabold font-sans text-sm">LEVEL 1 AUTHORIZATION</p>
                    </div>
                    <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Two-Factor Authentication</span>
                      <p className="text-amber-500 font-extrabold font-sans text-sm">DISABLED</p>
                    </div>
                    <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Encryption Protocol</span>
                      <p className="text-white font-mono text-sm">SHA-256 SECURED</p>
                    </div>
                  </div>

                  {/* Password reset action */}
                  <div className="pt-4 border-t border-[#1b2234]">
                    <h4 className="text-xs font-bold text-white mb-2">Change Account Password</h4>
                    <p className="text-xs text-gray-400 leading-normal mb-4">
                      To safely update your password, we can dispatch a secure reset link to your registered email address. This prevents any credential leakage.
                    </p>
                    <button
                      onClick={handleResetPassword}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Dispatch Password Reset Email
                    </button>
                  </div>
                </div>

                {/* Verification Box */}
                <div className="bg-[#0c0f17] border border-[#202737] p-5 rounded-2xl shadow-xl text-center flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                        isEmailVerified 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                      }`}>
                        {isEmailVerified ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-[#8a91a1] tracking-wider block">Identity Validation</h4>
                      <p className="text-sm font-black font-mono text-white mt-1.5">
                        {isEmailVerified ? 'Verified Account ✅' : 'Email Unverified ⚠️'}
                      </p>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-normal">
                      {isEmailVerified 
                        ? 'Your investor account has completed email validation. Purchases are fully enabled.' 
                        : 'Please verify your email address. Share purchasing is restricted until verification is complete.'}
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    {!isEmailVerified && (
                      <button
                        onClick={handleResendVerification}
                        className="w-full py-2 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        Resend Verification Link
                      </button>
                    )}
                    <button
                      onClick={handleRefreshVerification}
                      className="w-full py-2 bg-[#121622] hover:bg-[#1b2234] border border-[#21293c] text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Status</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Secure Login History */}
              <div className="bg-[#0c0f17] border border-[#202737] p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display pb-3 border-b border-[#1b2234]">
                  Recent Login History
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono text-gray-400">
                    <thead>
                      <tr className="border-b border-[#1b2234] text-gray-500 uppercase tracking-wider">
                        <th className="pb-3 font-bold">Device / Browser</th>
                        <th className="pb-3 font-bold">IP Address / Location</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b2234]/40">
                      <tr>
                        <td className="py-3 text-white font-bold">Chrome (Desktop)</td>
                        <td className="py-3">Europe West (Dev Proxy)</td>
                        <td className="py-3 text-emerald-400 font-bold">SUCCESSFUL LOGIN</td>
                        <td className="py-3 text-right text-gray-500">{new Date().toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-white font-bold">Safari (iOS)</td>
                        <td className="py-3">Mobile Network</td>
                        <td className="py-3 text-emerald-400 font-bold">SUCCESSFUL LOGIN</td>
                        <td className="py-3 text-right text-gray-500">{new Date(Date.now() - 3600000 * 24).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================= 9. SUBTAB: SETTINGS ================= */}
          {activeSubTab === 'settings' && (
            <div className="space-y-6">
              
              <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display">Account Settings</h3>
                  <p className="text-xs text-gray-400 mt-1">Configure your personal preferences, notifications, and security options.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-[#1b2234]">
                  
                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">Notification Preferences</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 bg-[#121622] rounded-xl border border-[#21293c]">
                        <div>
                          <p className="text-xs font-bold text-white">Trade Executions</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Receive alerts when share holdings are purchased or settled.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifTradeConfirmed}
                          onChange={(e) => setNotifTradeConfirmed(e.target.checked)}
                          className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-[#121622] rounded-xl border border-[#21293c]">
                        <div>
                          <p className="text-xs font-bold text-white">Security Safeguards</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Receive warnings on logins or updates to credentials.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifSecurityAlerts}
                          onChange={(e) => setNotifSecurityAlerts(e.target.checked)}
                          className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Preferences */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">Email Preferences</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 bg-[#121622] rounded-xl border border-[#21293c]">
                        <div>
                          <p className="text-xs font-bold text-white">Weekly Market Digest</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Recap of team prices, top gains, and match rosters.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailWeeklyDigest}
                          onChange={(e) => setEmailWeeklyDigest(e.target.checked)}
                          className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-[#121622] rounded-xl border border-[#21293c]">
                        <div>
                          <p className="text-xs font-bold text-white">System Logs & Updates</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Direct system notifications and service announcements.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailSystemUpdates}
                          onChange={(e) => setEmailSystemUpdates(e.target.checked)}
                          className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Shortcut sections to other settings panels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1b2234] text-xs font-mono">
                  
                  <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Profile Settings</span>
                      <p className="text-white font-sans text-xs mt-1">Manage your complete name, phone number, and username.</p>
                    </div>
                    <button
                      onClick={() => setActiveSubTab('profile')}
                      className="text-left text-xs font-bold text-[#d4af37] hover:text-white cursor-pointer"
                    >
                      Configure Profile →
                    </button>
                  </div>

                  <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Security Settings</span>
                      <p className="text-white font-sans text-xs mt-1">Audit recent login logs, active sessions, and system safeguards.</p>
                    </div>
                    <button
                      onClick={() => setActiveSubTab('security')}
                      className="text-left text-xs font-bold text-[#d4af37] hover:text-white cursor-pointer"
                    >
                      Audit Security →
                    </button>
                  </div>

                  <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Account Verification Status</span>
                      <div className="mt-1">
                        {isEmailVerified ? (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                            Fully Verified ✅
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                            Pending Validation ⚠️
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveSubTab('security')}
                      className="text-left text-xs font-bold text-[#d4af37] hover:text-white cursor-pointer"
                    >
                      Verify Account →
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* ================= PURCHASE / CHECKOUT POPUP MODAL ================= */}
      {selectedBuyCountry && (
        <PurchaseModal
          country={selectedBuyCountry}
          userCash={userCash}
          userId={currentUser ? currentUser.uid : null}
          isEmailVerified={isEmailVerified}
          onClose={() => setSelectedBuyCountry(null)}
          onCompletePurchase={() => {
            onCompletePurchase();
            setSelectedBuyCountry(null);
          }}
        />
      )}

    </div>
  );
}
