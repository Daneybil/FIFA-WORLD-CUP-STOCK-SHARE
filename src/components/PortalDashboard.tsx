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
  ArrowLeft,
  Users,
  Copy,
  Gift,
  Ticket,
  ExternalLink,
  Upload
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, sendEmailVerification, reload } from 'firebase/auth';
import { getLatestPublicTransactions, getUserNotifications, markNotificationReadInFirestore, clearAllUserNotificationsInFirestore, createSupportTicket } from '../lib/firebase-service';
import PurchaseModal from './PurchaseModal';
import SellModal from './SellModal';
import { Logo } from './Logo';

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
    'overview' | 'portfolio' | 'holdings' | 'transactions' | 'notifications' | 'security' | 'activity' | 'teams' | 'football-data' | 'profile' | 'settings' | 'referrals' | 'support'
  >('overview');
  
  // Mobile sidebar drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Local verification status and state
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  // Profile editing state
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    username: string;
    phoneNumber: string;
    createdAt?: string;
    referralCode?: string;
    referredBy?: string;
    referralWallet?: number;
    referralCount?: number;
    referralEarnings?: number;
  }>({
    displayName: currentUser?.displayName || '',
    username: '',
    phoneNumber: '',
    createdAt: '',
    referralCode: '',
    referralWallet: 0,
    referralCount: 0,
    referralEarnings: 0
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Copy status feedback states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Support ticket form states
  const [supportFullName, setSupportFullName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportScreenshot, setSupportScreenshot] = useState<string | null>(null);
  const [supportScreenshotName, setSupportScreenshotName] = useState<string | null>(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState<{ ticketId: string; message: string } | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Referral withdrawal states
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

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
  const [selectedSellHolding, setSelectedSellHolding] = useState<{ holding: ShareHolding; marketPrice: number } | null>(null);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  
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
    
    // Set email verified - Always verified for demo testing as requested
    setIsEmailVerified(true);
    
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
            createdAt: data.createdAt || new Date().toLocaleDateString(),
            referralCode: data.referralCode || '',
            referredBy: data.referredBy || '',
            referralWallet: data.referralWallet || 0,
            referralCount: data.referralCount || 0,
            referralEarnings: data.referralEarnings || 0
          });
        } else {
          setUserProfile({
            displayName: currentUser.displayName || '',
            username: currentUser.email.split('@')[0] || '',
            phoneNumber: '',
            createdAt: new Date().toLocaleDateString(),
            referralCode: '',
            referralWallet: 0,
            referralCount: 0,
            referralEarnings: 0
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
  }, [currentUser, activeSubTab]);

  // Prefill Support form details
  useEffect(() => {
    if (currentUser) {
      setSupportEmail(currentUser.email || '');
    }
    if (userProfile && userProfile.displayName) {
      setSupportFullName(userProfile.displayName);
    }
  }, [currentUser, userProfile.displayName]);

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

  // Drag-and-drop / File upload helpers for support ticket
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Invalid file type: Please select an image file (PNG/JPG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please select an image under 5MB.");
      return;
    }
    
    setSupportScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSupportScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Calculated stats for portfolio summary
  const totalHoldingsStockValue = holdings.reduce((sum, h) => {
    const countryLatest = countries.find(c => c.id === h.countryId);
    const currPrice = countryLatest ? countryLatest.currentPrice : h.averagePurchasePrice;
    return sum + (h.sharesQuantity * currPrice);
  }, 0);

  const portfolioValue = totalHoldingsStockValue;
  const totalSettlementPayout = holdings.reduce((sum, h) => sum + (h.sharesQuantity * h.winningSettlementPrice), 0);
  const activeHoldingsCount = holdings.length;
  const totalTransactionsCount = transactions.length;

  const sidebarMenuItems = [
    { id: 'overview', label: 'Account Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'holdings', label: 'Share Holdings', icon: Coins },
    { id: 'transactions', label: 'Transaction History', icon: History },
    { id: 'referrals', label: 'Refer & Earn', icon: Users },
    { id: 'support', label: 'Support Center', icon: HelpCircle },
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
        <div className="p-6 border-b border-[#1a2130] flex items-center space-x-3 select-none">
          <Logo size={40} className="shrink-0" />
          <div className="flex flex-col">
            <span className="font-black text-white text-sm tracking-wider leading-tight uppercase font-display">
              FIFA World Cup
            </span>
            <span className="text-[10px] text-amber-500 font-bold tracking-widest uppercase font-mono">
              Stock Shares
            </span>
          </div>
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
        <header className="h-16 border-b border-[#1a2130] bg-[#0a0d14]/95 backdrop-blur-md px-6 flex items-center justify-between select-none shrink-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded bg-[#101420] border border-[#1e273a] text-gray-400 hover:text-white"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            
            {/* Logo and Brand Title on left of header */}
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveSubTab('overview')}>
              <Logo size={32} className="shrink-0" />
              <span className="font-extrabold text-white text-[13px] sm:text-[14px] tracking-wide leading-tight uppercase font-display bg-gradient-to-r from-white via-gray-100 to-amber-200 bg-clip-text text-transparent">
                FIFA World Cup Stock Shares
              </span>
            </div>
          </div>

          {/* Center Navigation Links - replica layout */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-gray-400">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`transition-all duration-250 cursor-pointer tracking-wider uppercase font-display ${
                activeSubTab === 'overview' ? 'text-[#d4af37] border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveSubTab('portfolio')}
              className={`transition-all duration-250 cursor-pointer tracking-wider uppercase font-display ${
                activeSubTab === 'portfolio' ? 'text-[#d4af37] border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveSubTab('holdings')}
              className={`transition-all duration-250 cursor-pointer tracking-wider uppercase font-display ${
                activeSubTab === 'holdings' ? 'text-[#d4af37] border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setActiveSubTab('transactions')}
              className={`transition-all duration-250 cursor-pointer tracking-wider uppercase font-display ${
                activeSubTab === 'transactions' ? 'text-[#d4af37] border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`transition-all duration-250 cursor-pointer tracking-wider uppercase font-display ${
                activeSubTab === 'settings' ? 'text-[#d4af37] border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
              }`}
            >
              Settings
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            
            {/* Quick Guest Route Escape */}
            <button 
              onClick={onNavigateGuest}
              className="hidden xl:inline-block px-3 py-1.5 bg-[#101420] hover:bg-[#1a2133] border border-[#21293c] rounded-lg text-[10px] text-gray-400 hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              ← Guest Landing
            </button>

            {/* Logout button */}
            <button
              onClick={onLogOut}
              className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/30 border border-red-500/25 hover:border-red-500/50 rounded-xl text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

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
              
              {/* Top Welcome Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 pb-4 select-none">
                <div>
                  <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-[#eec765] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    Welcome back, {userProfile.displayName || 'Ani Odinaka John'}!
                  </h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto shrink-0">
                  {/* Gold Buy Shares Button */}
                  <button 
                    onClick={() => setActiveSubTab('holdings')}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-b from-[#f9d976] via-[#d4af37] to-[#8a640f] text-black font-black text-xs uppercase tracking-widest rounded-lg border-t border-[#ffeb99] border-b-2 border-[#5c4308] shadow-[0_0_20px_rgba(212,175,55,0.45),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:shadow-[0_0_30px_rgba(212,175,55,0.75),inset_0_1.5px_1.5px_rgba(255,255,255,0.6)] active:translate-y-0.5 hover:brightness-110 active:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>Buy Shares</span>
                  </button>
                </div>
              </div>

              {/* Bento Grid Analytics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Metric 1 - TOTAL PORTFOLIO VALUE */}
                <div className="bg-[#0b0d15]/90 backdrop-blur-md border border-[#d4af37]/20 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-[#d4af37]/40 hover:shadow-[0_12px_40px_rgba(16,185,129,0.1)] transition-all duration-300 select-none flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#10b981]/5 to-transparent blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider font-mono">TOTAL PORTFOLIO VALUE</span>
                    <TrendingUp className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold font-mono text-[#10b981] tracking-tight">
                      ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-1.5 font-semibold">
                      Total valuation of active equity holdings
                    </p>
                  </div>
                </div>

                {/* Metric 3 - POTENTIAL WINNING PAYOUT */}
                <div className="bg-[#0c0f1a]/95 backdrop-blur-md border-2 border-[#d4af37] p-5 rounded-2xl shadow-[0_10px_35px_rgba(212,175,55,0.15)] hover:shadow-[0_12px_45px_rgba(212,175,55,0.25)] transition-all duration-300 select-none flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#d4af37]/15 to-transparent blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black text-[#d4af37] tracking-wider font-mono">POTENTIAL WINNING PAYOUT</span>
                    <Trophy className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="mt-4 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
                        ${totalSettlementPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <p className="text-[9px] text-[#d4af37]/80 mt-1.5 font-semibold">
                        100% winning projection if owned nations win tournament
                      </p>
                    </div>
                    
                    {/* Golden Withdrawal Button - Directly Inside the Card, Bold, Golden, No Lock Icon */}
                    <div className="mt-4">
                      <button
                        onClick={() => setIsWithdrawalModalOpen(true)}
                        className="w-full py-2 bg-gradient-to-b from-[#f9d976] via-[#d4af37] to-[#8a640f] text-black font-black text-xs uppercase tracking-widest rounded-lg border-t border-[#ffeb99] border-b-2 border-[#5c4308] shadow-[0_2px_8px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_15px_rgba(212,175,55,0.6)] hover:brightness-110 active:translate-y-0.5 transition-all duration-150 cursor-pointer text-center"
                      >
                        Withdrawal
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metric 4 - ACTIVE HOLDINGS */}
                <div className="bg-[#0b0d15]/90 backdrop-blur-md border border-[#d4af37]/20 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-[#d4af37]/40 hover:shadow-[0_12px_40px_rgba(212,175,55,0.1)] transition-all duration-300 select-none flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#3b82f6]/5 to-transparent blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider font-mono">ACTIVE HOLDINGS</span>
                    <Flag className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                      {activeHoldingsCount}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-1.5 font-semibold">
                      Nations under portfolio asset ownership
                    </p>
                  </div>
                </div>

                {/* Metric 5 - TOTAL TRANSACTIONS */}
                <div className="bg-[#0b0d15]/90 backdrop-blur-md border border-[#d4af37]/20 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-[#d4af37]/40 hover:shadow-[0_12px_40px_rgba(212,175,55,0.1)] transition-all duration-300 select-none flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/5 to-transparent blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider font-mono">TOTAL TRANSACTIONS</span>
                    <History className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                      {totalTransactionsCount}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-1.5 font-semibold">
                      Ledger completed interactions
                    </p>
                  </div>
                </div>

                {/* Metric 6 - ACCOUNT STATUS */}
                <div className="bg-[#0b0d15]/90 backdrop-blur-md border border-[#d4af37]/20 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-[#d4af37]/40 hover:shadow-[0_12px_40px_rgba(16,185,129,0.1)] transition-all duration-300 select-none flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#10b981]/5 to-transparent blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider font-mono">ACCOUNT STATUS</span>
                    <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      {isEmailVerified ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/35 text-[#10b981] text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                          <span>VERIFIED</span>
                          <span className="text-[10px]">✅</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/35 text-amber-400 text-xs font-black uppercase tracking-wider animate-pulse">
                          <span>UNVERIFIED</span>
                          <span className="text-[10px]">⚠️</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 mt-2 font-semibold">
                      Security status active & verified
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
                        const homeTeam = countries.find(c => c.id === match.homeTeamId) || { name: match.homeTeamId === 'TBD' ? 'To Be Decided' : match.homeTeamId, flag: '🏳️' };
                        const awayTeam = countries.find(c => c.id === match.awayTeamId) || { name: match.awayTeamId === 'TBD' ? 'To Be Decided' : match.awayTeamId, flag: '🏳️' };
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
                    <p className="text-[11px] text-gray-400 mt-1">Official valuations and active squad equities under active contract.</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-mono font-bold uppercase tracking-wider">
                    LIVE ASSETS
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
                          <th className="py-4 px-5 text-center">Actions</th>
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
                              <td className="py-4 px-5 text-center">
                                <button
                                  onClick={() => setSelectedSellHolding({ holding: h, marketPrice: currPrice })}
                                  className="px-3 py-1.5 bg-gradient-to-br from-red-500/10 via-red-600/15 to-red-800/10 hover:from-red-600 hover:to-red-800 text-red-400 hover:text-white border border-red-500/25 hover:border-red-500/50 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md active:translate-y-0.5"
                                >
                                  Liquidate
                                </button>
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
                    <p className="text-sm font-semibold">No transactions detected in your portfolio ledger.</p>
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
                      const homeTeam = countries.find(c => c.id === match.homeTeamId) || { name: match.homeTeamId === 'TBD' ? 'To Be Decided' : match.homeTeamId, flag: '🏳️' };
                      const awayTeam = countries.find(c => c.id === match.awayTeamId) || { name: match.awayTeamId === 'TBD' ? 'To Be Decided' : match.awayTeamId, flag: '🏳️' };
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
                    <p className="text-[11px] text-gray-400 mt-1">Official authenticated credential status registered in our secure system.</p>
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
                    <div className="p-4 bg-[#111522] border border-[#21293c] rounded-xl flex justify-between items-center col-span-1">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Two-Factor Authentication (2FA)</span>
                        <p className={`font-extrabold font-sans text-sm ${is2FAEnabled ? 'text-emerald-400' : 'text-amber-500'}`}>
                          {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        {is2FAEnabled ? "Disable" : "Enable"}
                      </button>
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

          {/* ================= SUBTAB: REFERRALS ================= */}
          {activeSubTab === 'referrals' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display flex items-center gap-2">
                      <Gift className="w-5 h-5 text-[#d4af37]" />
                      Refer & Earn Program
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                      Invite fellow investors to join World Cup Equities. Earn a 15% bonus on their first successful investment!
                    </p>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-[#d4af37] px-3 py-1.5 rounded-full uppercase font-extrabold self-start md:self-auto tracking-wider">
                    15% Commission 🎁
                  </span>
                </div>

                {/* Referral Link & Code Copy Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#1c2335]">
                  <div className="bg-[#121622] p-4.5 rounded-xl border border-[#21293c] space-y-3">
                    <span className="text-[10px] font-extrabold text-[#d4af37] uppercase tracking-wider block text-left">Your Unique Referral Code</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#080a10] border border-white/10 px-4 py-3 rounded-lg text-sm font-mono font-black text-white flex-grow tracking-widest text-center select-all">
                        {userProfile.referralCode || 'WCS-PENDING'}
                      </div>
                      <button
                        onClick={() => {
                          if (userProfile.referralCode) {
                            navigator.clipboard.writeText(userProfile.referralCode);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }
                        }}
                        className="bg-[#1c2335] hover:bg-[#d4af37] hover:text-black border border-white/10 px-4 py-3.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedCode ? 'COPIED' : 'COPY'}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 text-left">Share this code with new users to enter during registration.</p>
                  </div>

                  <div className="bg-[#121622] p-4.5 rounded-xl border border-[#21293c] space-y-3">
                    <span className="text-[10px] font-extrabold text-[#d4af37] uppercase tracking-wider block text-left">Your Direct Invitation Link</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#080a10] border border-white/10 px-3 py-3 rounded-lg text-xs font-mono text-gray-400 flex-grow truncate select-all text-left">
                        {window.location.origin}?ref={userProfile.referralCode}
                      </div>
                      <button
                        onClick={() => {
                          const link = `${window.location.origin}?ref=${userProfile.referralCode}`;
                          navigator.clipboard.writeText(link);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="bg-[#1c2335] hover:bg-[#d4af37] hover:text-black border border-white/10 px-4 py-3.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedLink ? 'COPIED' : 'COPY'}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 text-left">Automatically pre-fills your referral code on registration.</p>
                  </div>
                </div>

                {/* Referral Wallet Stats Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1c2335]">
                  <div className="p-4.5 bg-[#121622] border border-[#21293c] rounded-xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Referrals</span>
                    <div className="text-2xl font-black text-white font-display">
                      {userProfile.referralCount || 0}
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono">Verified successful sign-ups</span>
                  </div>

                  <div className="p-4.5 bg-[#121622] border border-[#21293c] rounded-xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Referral Earnings</span>
                    <div className="text-2xl font-black text-[#d4af37] font-display">
                      ${(userProfile.referralEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono">15% share accrued historically</span>
                  </div>

                  <div className="p-4.5 bg-[#121622] border border-[#21293c] rounded-xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block">Referral Wallet Balance</span>
                    <div className="text-2xl font-black text-emerald-400 font-display">
                      ${(userProfile.referralWallet || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono">Available for secure withdrawal</span>
                  </div>
                </div>

                {/* Withdrawal Rule Panel */}
                <div className="p-5 bg-[#111522] border border-[#21293c] rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Referral Withdrawal Threshold Rule</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        To safeguard against fraud and self-referrals, referral earnings can be unlocked for withdrawal after reaching <strong>10 successful qualifying referrals</strong>.
                      </p>
                    </div>
                    <div className="shrink-0 self-start sm:self-auto bg-[#080a10] border border-white/10 px-4 py-2 rounded-lg text-xs font-mono">
                      Progress: <strong className="text-[#d4af37]">{userProfile.referralCount || 0}</strong> / <span className="text-gray-500 font-bold">10</span>
                    </div>
                  </div>

                  {withdrawSuccess && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium text-left">
                      {withdrawSuccess}
                    </div>
                  )}

                  {withdrawError && (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium text-left">
                      {withdrawError}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={withdrawLoading || (userProfile.referralCount || 0) < 10 || (userProfile.referralWallet || 0) <= 0}
                      onClick={async () => {
                        if (!currentUser) return;
                        setWithdrawLoading(true);
                        setWithdrawSuccess(null);
                        setWithdrawError(null);
                        try {
                          // Perform secure atomic balance transfer
                          const userRef = doc(db, 'users', currentUser.uid);
                          const snap = await getDoc(userRef);
                          if (snap.exists()) {
                            const data = snap.data();
                            const currentWallet = data.referralWallet || 0;
                            const currentBalance = data.balance || 0;
                            const currentCount = data.referralCount || 0;

                            if (currentCount < 10) {
                              throw new Error(`Withdrawal Locked: You need 10 successful referrals. (Current: ${currentCount}/10)`);
                            }
                            if (currentWallet <= 0) {
                              throw new Error("Withdrawal Failed: No referral earnings available to withdraw.");
                            }

                            await updateDoc(userRef, {
                              referralWallet: 0,
                              balance: currentBalance + currentWallet
                            });

                            // Create notification
                            const notifId = 'NOTIF-WITHDRAW-' + Math.floor(100000 + Math.random() * 900000);
                            await updateDoc(userRef, {
                              [`notifications.${notifId}`]: {
                                id: notifId,
                                userId: currentUser.uid,
                                title: "Referral Withdrawal Successful!",
                                message: `Your referral balance of $${currentWallet.toFixed(2)} has been successfully transferred to your main investment balance.`,
                                type: 'success',
                                timestamp: new Date().toLocaleString(),
                                read: false
                              }
                            });

                            setWithdrawSuccess(`Success! $${currentWallet.toFixed(2)} has been securely transferred to your main wallet balance.`);
                            onCompletePurchase(); // Syncs layout balances immediately
                          }
                        } catch (err: any) {
                          setWithdrawError(err.message || "Failed to process withdrawal.");
                        } finally {
                          setWithdrawLoading(false);
                        }
                      }}
                      className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        (userProfile.referralCount || 0) >= 10 && (userProfile.referralWallet || 0) > 0
                          ? 'bg-gradient-to-r from-[#fde68a] to-[#d4af37] text-black font-extrabold shadow-lg shadow-amber-500/10 hover:brightness-110'
                          : 'bg-[#1b2234] text-gray-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      {withdrawLoading ? "Transferring..." : (userProfile.referralCount || 0) >= 10 ? "Withdraw Referral Balance" : `Locked: Requires 10 Referrals (${userProfile.referralCount || 0}/10)`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SUBTAB: SUPPORT ================= */}
          {activeSubTab === 'support' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              
              {/* Support Form Column */}
              <div className="lg:col-span-2 bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl space-y-6">
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#d4af37]" />
                    Support & Help Center
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Submit an official inquiry. Our desk dispatches inquiries to Support@worldcupstock.space and tracks ticket statuses.
                  </p>
                </div>

                {supportSuccess ? (
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-4 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Support Ticket Created Successfully!</h4>
                      <p className="text-xs text-gray-400">
                        Your inquiry has been assigned <strong>Ticket ID: {supportSuccess.ticketId}</strong> and securely archived.
                      </p>
                    </div>
                    <p className="text-xs text-[#d4af37] font-medium bg-[#080a10] border border-white/5 p-3.5 rounded-lg max-w-md mx-auto leading-relaxed">
                      {supportSuccess.message}
                    </p>
                    <button
                      onClick={() => {
                        setSupportSuccess(null);
                        setSupportSubject('');
                        setSupportMessage('');
                        setSupportScreenshot(null);
                        setSupportScreenshotName(null);
                      }}
                      className="bg-[#1c2335] hover:bg-[#d4af37] hover:text-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg transition-all cursor-pointer"
                    >
                      Open Another Ticket
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!supportSubject || !supportMessage) {
                        setSupportError("Please specify a subject and describe your inquiry.");
                        return;
                      }

                      setSupportLoading(true);
                      setSupportError(null);

                      try {
                        const ticketId = await createSupportTicket(currentUser?.uid || 'Anonymous', {
                          fullName: supportFullName,
                          email: supportEmail,
                          subject: supportSubject,
                          message: supportMessage,
                          screenshot: supportScreenshot || undefined
                        });

                        setSupportSuccess({
                          ticketId,
                          message: `Your support request has been successfully dispatched to Support@worldcupstock.space. Our support team will respond to ${supportEmail} within 12-24 hours.`
                        });
                      } catch (err: any) {
                        setSupportError(err.message || "Failed to submit ticket.");
                      } finally {
                        setSupportLoading(false);
                      }
                    }}
                    className="space-y-4.5 pt-4 border-t border-[#1c2335]"
                  >
                    {supportError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-left">
                        {supportError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={supportFullName}
                          onChange={(e) => setSupportFullName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Your Email Address</label>
                        <input
                          type="email"
                          required
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          placeholder="contact@email.com"
                          className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Inquiry Subject</label>
                      <select
                        required
                        value={supportSubject}
                        onChange={(e) => setSupportSubject(e.target.value)}
                        className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium"
                      >
                        <option value="">-- Select Inquiry Subject Category --</option>
                        <option value="Investment Purchase Issue">Investment Purchase Issue</option>
                        <option value="Stripe Checkout Redirection">Stripe Checkout Redirection</option>
                        <option value="Account Verification & 2FA">Account Verification & 2FA</option>
                        <option value="Referral Code & Wallet Bonuses">Referral Code & Wallet Bonuses</option>
                        <option value="Security Logs Auditing">Security Logs Auditing</option>
                        <option value="General Technical Question">General Technical Question</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Detailed Description</label>
                      <textarea
                        required
                        rows={5}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Please write the complete details of your technical issue, transaction IDs, or inquiry so our desk can review and respond immediately."
                        className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] resize-none leading-relaxed"
                      />
                    </div>

                    {/* Screenshot Upload / Drag & Drop area */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Screenshot / Document Attachment (Optional)</label>
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all relative ${
                          dragActive 
                            ? 'border-[#d4af37] bg-amber-500/5' 
                            : supportScreenshot 
                              ? 'border-emerald-500/50 bg-emerald-500/5' 
                              : 'border-white/10 hover:border-white/20 bg-[#080a10]'
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload-support"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        {supportScreenshot ? (
                          <div className="space-y-3">
                            <img 
                              src={supportScreenshot} 
                              alt="Screenshot Preview" 
                              className="w-24 h-24 object-cover mx-auto rounded-lg border border-white/10 shadow" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-xs">
                              <span className="text-emerald-400 font-bold block">✓ Attachment Loaded</span>
                              <span className="text-gray-500 font-mono text-[10px] truncate block max-w-xs mx-auto">{supportScreenshotName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSupportScreenshot(null);
                                setSupportScreenshotName(null);
                              }}
                              className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider"
                            >
                              Remove Attachment
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="file-upload-support" className="cursor-pointer block space-y-2">
                            <Upload className="w-8 h-8 text-gray-500 mx-auto" />
                            <div className="text-xs">
                              <span className="text-[#d4af37] font-bold">Upload a Screenshot</span> or drag and drop here
                            </div>
                            <div className="text-[10px] text-gray-600 font-mono">
                              PNG, JPG, or JPEG up to 5MB
                            </div>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={supportLoading}
                        className="bg-gradient-to-r from-[#fde68a] to-[#d4af37] text-black font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/10 hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {supportLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Submitting Ticket...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Technical Ticket
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* FAQ Section Column */}
              <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl space-y-6 self-start text-left">
                <div>
                  <h3 className="text-xs font-extrabold text-[#d4af37] uppercase tracking-widest font-display">FAQ / Quick Answers</h3>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium">Review standard guides regarding trading rules and refer-and-earn.</p>
                </div>

                <div className="space-y-4 pt-3 border-t border-[#1b2234]">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">How are World Cup Equities priced?</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                      Each country share represents equity tied to their tournament survival. Prices fluctuate between $1.00 and $100.00 in real-time based on public buy/sell orders, match predictions, and game outcomes.
                    </p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-[#1b2234]">
                    <span className="text-xs font-bold text-white block">How is the 15% referral bonus paid?</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                      Whenever a user you invited signs up with your code and submits their first verified investment, 15% of that payment is automatically computed on our backend and credited to your Referral Wallet instantly.
                    </p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-[#1b2234]">
                    <span className="text-xs font-bold text-white block">Why is there a withdrawal threshold?</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                      To prevent self-referrals and account duplication exploits, referral balance transfers require a minimum of 10 successful qualifying referrals to become unlocked.
                    </p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-[#1b2234]">
                    <span className="text-xs font-bold text-white block">Where does support respond?</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                      Support logs are processed through Support@worldcupstock.space. Complete technical responses are emailed directly to your registered user address.
                    </p>
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

      {/* ================= LIQUIDATION / SELL POPUP MODAL ================= */}
      {selectedSellHolding && (
        <SellModal
          holding={selectedSellHolding.holding}
          marketPrice={selectedSellHolding.marketPrice}
          userId={currentUser ? currentUser.uid : null}
          onClose={() => setSelectedSellHolding(null)}
          onCompleteSale={() => {
            onCompletePurchase();
            setSelectedSellHolding(null);
          }}
        />
      )}

      {/* ================= WITHDRAWAL LOCKED POPUP MODAL ================= */}
      {isWithdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-br from-[#0c0f19] to-[#04060b] border-2 border-[#d4af37]/60 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(212,175,55,0.25)] overflow-hidden select-none">
            
            {/* Top decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-[#d4af37]/20 rounded-full blur-md" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              
              {/* Premium Trophy Icon */}
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-[#fce498]/10 to-[#92640f]/5 border border-[#d4af37]/30 shadow-[0_10px_25px_rgba(0,0,0,0.5)] text-[#d4af37]">
                <Trophy className="w-10 h-10" />
              </div>

              {/* Modal Text Content */}
              <div className="space-y-3.5">
                <h3 className="text-xl md:text-2xl font-sans font-extrabold text-[#eec765] tracking-tight">
                  Withdrawal Locked
                </h3>
                
                <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed font-sans">
                  <p className="font-medium">
                    You cannot withdraw funds at this time. All shares must be held until the FIFA World Cup tournament officially concludes.
                  </p>
                  <p className="font-medium text-gray-400">
                    If your selected country wins the World Cup, your shares will be settled at the winning price and you can withdraw your earnings immediately and securely.
                  </p>
                  <p className="text-[#d4af37] font-semibold text-[11px] md:text-xs tracking-wide">
                    Thank you for your understanding.
                  </p>
                </div>
              </div>

              {/* Premium Gold Understood Dismiss Button */}
              <button
                onClick={() => setIsWithdrawalModalOpen(false)}
                className="w-full py-3 bg-gradient-to-b from-[#f9d976] via-[#d4af37] to-[#8a640f] text-black font-black text-xs uppercase tracking-widest rounded-xl border-t border-[#ffeb99] border-b-2 border-[#5c4308] shadow-[0_4px_12px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] active:translate-y-0.5 hover:brightness-110 transition-all duration-200 cursor-pointer"
              >
                Understood
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
