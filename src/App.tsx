import React, { useState, useEffect } from 'react';
import {
  CountryShare,
  ShareHolding,
  TransactionRecord,
  MarketStat,
  MatchFixture,
  MarketActivity,
  AppNotification,
  PaymentMethod
} from './types';
import {
  INITIAL_COUNTRIES,
  INITIAL_FIXTURES,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS
} from './mockData';

// Component imports
import HeroSection from './components/HeroSection';
import MarketTicker from './components/MarketTicker';
import { Logo } from './components/Logo';
import MarketSection from './components/MarketSection';
import PurchaseModal from './components/PurchaseModal';
import UserDashboard from './components/UserDashboard';
import SellModal from './components/SellModal';
import PortalDashboard from './components/PortalDashboard';
import TournamentCenter from './components/TournamentCenter';
import AdminPanel from './components/AdminPanel';
import AuthSection from './components/AuthSection';
import HowItWorks from './components/HowItWorks';
import SupportCenter from './components/SupportCenter';
import ReferralProgram from './components/ReferralProgram';
import InvestorCalculator from './components/InvestorCalculator';
import { TRANSLATIONS } from './translations';

// Firebase Client Imports
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { 
  getOrCreateUserProfile,
  getUserHoldings,
  getUserTransactions,
  getUserNotifications,
  markNotificationReadInFirestore,
  clearAllUserNotificationsInFirestore,
  depositUserFunds,
  getLatestPublicTransactions
} from './lib/firebase-service';

// Icon imports
import { 
  Trophy, 
  Wallet, 
  TrendingUp, 
  ShieldAlert, 
  MessageSquare, 
  UserCheck, 
  Lock, 
  HelpCircle,
  Menu,
  X,
  Bell,
  CheckCircle,
  Coins,
  Star
} from 'lucide-react';

const BLACKLISTED_IDS = [
  'QAT', 'UKR', 'WAL', 'VEN', 'NGA', 'ECU', 'HON', 'NIR', 
  'POL', 'PER', 'BOL', 'DEN', 'PRY', 'PAR', 'CHI', 'CRC', 
  'SRB', 'ITA', 'CMR', 'PAN', 'JAM'
];

const getFlagEmoji = (tla: string): string => {
  const tlaUpper = tla.toUpperCase();
  const flags: Record<string, string> = {
    QAT: '🇶🇦', ECU: '🇪🇨', SEN: '🇸🇳', NED: '🇳🇱',
    ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', IRN: '🇮🇷', USA: '🇺🇸', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    ARG: '🇦🇷', KSA: '🇸🇦', MEX: '🇲🇽', POL: '🇵🇱',
    FRA: '🇫🇷', AUS: '🇦🇺', DEN: '🇩🇰', TUN: '🇹🇳',
    ESP: '🇪🇸', CRC: '🇨🇷', GER: '🇩🇪', JPN: '🇯🇵',
    BEL: '🇧🇪', CAN: '🇨🇦', MAR: '🇲🇦', CRO: '🇭🇷',
    BRA: '🇧🇷', SRB: '🇷🇸', SUI: '🇨🇭', CMR: '🇨🇲',
    POR: '🇵🇹', GHA: '🇬🇭', URU: '🇺🇾', KOR: '🇰🇷',
    PAR: '🇵🇾', RSA: '🇿🇦', ALG: '🇩🇿', NZL: '🇳🇿',
    SWE: '🇸🇪', CZE: '🇨🇿', TUR: '🇹🇷', AUT: '🇦🇹',
    COL: '🇨🇴', EGY: '🇪🇬', HAI: '🇭🇹', BIH: '🇧🇦',
    PAN: '🇵🇦', CPV: '🇨🇻', COD: '🇨🇩', CIV: '🇨🇮',
    JOR: '🇯🇴', IRQ: '🇮🇶', UZB: '🇺🇿', NOR: '🇳🇴',
    SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', CUW: '🇨🇼'
  };
  return flags[tlaUpper] || '🏳️';
};

export default function App() {
  // Navigation Routing Tab
  const [activeRoute, setActiveRoute] = useState<'dashboard' | 'market' | 'live-data' | 'tournament' | 'how-it-works' | 'admin' | 'login' | 'portal-dashboard' | 'support' | 'referral' | 'calculator'>('dashboard');
  
  // Translation Helper based on the selected language
  const t = (key: string) => {
    const dict = TRANSLATIONS[detectedLanguage] || TRANSLATIONS['English'];
    return dict[key] || TRANSLATIONS['English'][key] || key;
  };

  // Localized helper for global countdown top bar
  const tCountdown = (key: string) => {
    const countdownDicts: Record<string, Record<string, string>> = {
      "English": {
        "title": "COUNTDOWN TO GRAND FINAL",
        "days": "Days",
        "hours": "Hours",
        "minutes": "Mins",
        "seconds": "Secs"
      },
      "العربية (Arabic)": {
        "title": "العد التنازلي للمباراة النهائية",
        "days": "أيام",
        "hours": "ساعات",
        "minutes": "دقائق",
        "seconds": "ثواني"
      },
      "Español (Spanish)": {
        "title": "CUENTA REGRESIVA PARA LA GRAN FINAL",
        "days": "Días",
        "hours": "Horas",
        "minutes": "Min",
        "seconds": "Seg"
      },
      "Português (Portuguese)": {
        "title": "CONTAGEM REGRESSIVA PARA A GRANDE FINAL",
        "days": "Dias",
        "hours": "Horas",
        "minutes": "Min",
        "seconds": "Seg"
      },
      "Français (French)": {
        "title": "COMPTE À REBOURS GRAND FINALE",
        "days": "Jours",
        "hours": "Heures",
        "minutes": "Min",
        "seconds": "Sec"
      },
      "Deutsch (German)": {
        "title": "COUNTDOWN ZUM GROSSEN FINALE",
        "days": "Tage",
        "hours": "Std",
        "minutes": "Min",
        "seconds": "Sek"
      },
      "Italiano (Italian)": {
        "title": "CONTO ALLA ROVESCIA FINALE",
        "days": "Giorni",
        "hours": "Ore",
        "minutes": "Min",
        "seconds": "Sec"
      },
      "日本語 (Japanese)": {
        "title": "グランドファイナルへのカウントダウン",
        "days": "日",
        "hours": "時間",
        "minutes": "分",
        "seconds": "秒"
      },
      "中文 (Chinese)": {
        "title": "总决赛倒计时",
        "days": "天",
        "hours": "时",
        "minutes": "分",
        "seconds": "秒"
      },
      "Türkçe (Turkish)": {
        "title": "BÜYÜK FİNAL GERİ SAYIMI",
        "days": "Gün",
        "hours": "Saat",
        "minutes": "Dak",
        "seconds": "Sn"
      },
      "Nederlands (Dutch)": {
        "title": "AFTELLEN NAAR DE GROTE FINALE",
        "days": "Dagen",
        "hours": "Uren",
        "minutes": "Min",
        "seconds": "Sec"
      },
      "Русский (Russian)": {
        "title": "ОТСЧЕТ ДО ГРАНД-ФИНАЛА",
        "days": "Дней",
        "hours": "Часов",
        "minutes": "Мин",
        "seconds": "Сек"
      },
      "한국어 (Korean)": {
        "title": "그랜드 파이널 카운트다운",
        "days": "일",
        "hours": "시간",
        "minutes": "분",
        "seconds": "초"
      }
    };
    const dict = countdownDicts[detectedLanguage] || countdownDicts['English'];
    return dict[key] || countdownDicts['English'][key] || key;
  };
  
  // Mobile menu control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero dropdown state
  const [heroDropdownOpen, setHeroDropdownOpen] = useState(false);

  // Stripe Payment Status Message State
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // States with persistent LocalStorage retrieval
  const [countries, setCountries] = useState<CountryShare[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_countries');
    const REAL_WORLD_CUP_QUALIFIED_IDS = [
      'SEN', 'NED', 'ENG', 'IRN', 'USA',
      'ARG', 'KSA', 'MEX', 'FRA', 'AUS', 'TUN',
      'ESP', 'GER', 'JPN', 'BEL', 'CAN', 'MAR', 'CRO',
      'BRA', 'SUI', 'POR', 'GHA', 'URU', 'KOR'
    ];
    // Filter to only officially qualified World Cup teams on initial load
    const defaultFiltered = INITIAL_COUNTRIES.filter(c => REAL_WORLD_CUP_QUALIFIED_IDS.includes(c.id) && !BLACKLISTED_IDS.includes(c.id));
    let loaded = defaultFiltered;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep only saved items that are officially qualified to prevent any mock teams from appearing
          loaded = parsed.filter(c => (REAL_WORLD_CUP_QUALIFIED_IDS.includes(c.id) || parsed.length <= 48) && !BLACKLISTED_IDS.includes(c.id));
        }
      } catch (e) {}
    }
    return loaded.map(c => {
      const initial = INITIAL_COUNTRIES.find(initC => initC.id === c.id) || c;
      const baseSettlement = initial.winningSettlementPrice;
      const wins = c.statistics?.wins || 0;
      const losses = c.statistics?.losses || 0;
      const dynamicPrice = Math.round(baseSettlement * Math.pow(0.97, wins) * Math.pow(1.05, losses) * 100) / 100;
      return {
        ...c,
        name: initial.name,
        flag: initial.flag,
        winningSettlementPrice: dynamicPrice
      };
    });
  });

  const [fixtures, setFixtures] = useState<MatchFixture[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_fixtures');
    const loaded = saved ? JSON.parse(saved) : INITIAL_FIXTURES;
    return Array.isArray(loaded) ? loaded.filter((f: MatchFixture) => !BLACKLISTED_IDS.includes(f.homeTeamId) && !BLACKLISTED_IDS.includes(f.awayTeamId)) : [];
  });

  const [holdings, setHoldings] = useState<ShareHolding[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_holdings');
    const loaded = saved ? JSON.parse(saved) : []; // Seeding empty holdings so users can buy freely
    return Array.isArray(loaded) ? loaded.filter((h: ShareHolding) => !BLACKLISTED_IDS.includes(h.countryId)) : [];
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_transactions');
    const loaded = saved ? JSON.parse(saved) : [];
    return Array.isArray(loaded) ? loaded.filter((t: TransactionRecord) => !BLACKLISTED_IDS.includes(t.countryId)) : [];
  });

  const [activities, setActivities] = useState<MarketActivity[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_activities');
    const loaded = saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    return Array.isArray(loaded) ? loaded.filter((act: MarketActivity) => !BLACKLISTED_IDS.includes(act.countryId)) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Escrow Cash allocated
  const [userCash, setUserCash] = useState<number>(() => {
    const saved = localStorage.getItem('world_cup_shares_cash');
    if (saved && (parseFloat(saved) === 1000.00 || parseFloat(saved) === 0)) {
      return 5000.00;
    }
    return saved ? parseFloat(saved) : 5000.00; // Giving $5,000 for sandboxed actions out of the box!
  });

  // User persistent authentication state pre-linked for Firebase
  const [currentUser, setCurrentUser] = useState<{ email: string; displayName: string; uid: string } | null>(null);

  // Sync Firebase authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const displayName = firebaseUser.displayName || email.split('@')[0] || 'Investor';
        
        setCurrentUser({
          email,
          displayName,
          uid: firebaseUser.uid
        });

        // Pull verified real persistent logs from Firebase Firestore
        await syncFirebaseData(firebaseUser.uid);
        
        // Redirect to portal if they were actively logging in
        setActiveRoute((prev) => (prev === 'login' ? 'portal-dashboard' : prev));
      } else {
        // Reset states under auth to standard local defaults
        setCurrentUser(null);
        setHoldings([]);
        setTransactions([]);
        setNotifications([]);
        setUserCash(5000.00);
      }
    });

    return () => unsubscribe();
  }, []);

  // Detect Stripe checkout redirection search parameters and referral codes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Handle incoming referral link
    const refCode = params.get('ref');
    if (refCode) {
      sessionStorage.setItem('pending_referral_code', refCode.trim().toUpperCase());
      setAuthModalOpen(true);
    }

    if (params.get('payment_success') === 'true') {
      setActiveRoute('portal-dashboard');
      setPaymentStatusMessage({
        type: 'success',
        text: "Stripe payment processed successfully! Your secure share holdings and transaction ledger have been updated."
      });
      // Clear query params to prevent repeating the message on reload
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('payment_cancelled') === 'true') {
      setPaymentStatusMessage({
        type: 'error',
        text: "Your card payment checkout was cancelled or failed. No charges were made."
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const syncFirebaseData = async (uid: string) => {
    try {
      const profile = await getOrCreateUserProfile(uid, auth.currentUser?.email || '', auth.currentUser?.displayName || '');
      setUserCash(profile.balance);

      const realHoldings = await getUserHoldings(uid);
      setHoldings(realHoldings);

      const realTransactions = await getUserTransactions(uid);
      setTransactions(realTransactions);

      const realNotifs = await getUserNotifications(uid);
      setNotifications(realNotifs);
    } catch (err) {
      console.error("Firebase synchronization failure syncFirebaseData:", err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserCash(5000.00);
    setHoldings([]);
    setTransactions([]);
    setNotifications([]);
    setActiveRoute('dashboard');
  };

  // Global pool stats
  const [marketStats, setMarketStats] = useState<MarketStat>({
    liveMarketCap: '$12,500,000,000',
    volume24h: '$450,000,000',
    marketChange24h: '↑ 3.20%',
    totalShareholders: 142520,
    totalSharesSold: 8421900,
    totalTournamentPool: 425000000,
  });

  // Local numeric states for live market stats ticking and formula updates (adds 10% daily in real-time)
  const [numericMarketCap, setNumericMarketCap] = useState(() => {
    const saved = localStorage.getItem('world_cup_shares_numericMarketCap');
    if (saved) return Number(saved);
    const baseDate = new Date('2026-06-01T00:00:00Z').getTime();
    const elapsedDays = Math.max(0, (Date.now() - baseDate) / (1000 * 60 * 60 * 24));
    return Math.round(12500000000 * Math.pow(1.018, elapsedDays));
  }); 
  const [numericVolume24h, setNumericVolume24h] = useState(() => {
    const saved = localStorage.getItem('world_cup_shares_numericVolume24h');
    if (saved) return Number(saved);
    const baseDate = new Date('2026-06-01T00:00:00Z').getTime();
    const elapsedDays = Math.max(0, (Date.now() - baseDate) / (1000 * 60 * 60 * 24));
    return Math.round(450000000 * Math.pow(1.025, elapsedDays));
  }); 
  const [numericChange, setNumericChange] = useState(() => {
    const saved = localStorage.getItem('world_cup_shares_numericChange');
    return saved ? Number(saved) : 3.2;
  });

  const [selectedMarketTab, setSelectedMarketTab] = useState<'all' | 'trending' | 'speculative' | 'group'>('all');

  // Football-Data.org Live Synchronizer states
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('world_cup_shares_last_sync_time') || null);
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('world_cup_shares_last_resp_time');
    return saved ? Number(saved) : null;
  });
  const [numTeamsLoaded, setNumTeamsLoaded] = useState<number>(() => Number(localStorage.getItem('world_cup_shares_num_teams_loaded') || '0'));
  const [numFixturesLoaded, setNumFixturesLoaded] = useState<number>(() => Number(localStorage.getItem('world_cup_shares_num_fixtures_loaded') || '0'));
  const [numStandingsLoaded, setNumStandingsLoaded] = useState<number>(() => Number(localStorage.getItem('world_cup_shares_num_standings_loaded') || '0'));
  const [apiSuccessCount, setApiSuccessCount] = useState<number>(() => Number(localStorage.getItem('world_cup_api_success_count') || '1'));
  const [apiFailedCount, setApiFailedCount] = useState<number>(() => Number(localStorage.getItem('world_cup_api_failed_count') || '0'));

  const [timeLeft, setTimeLeft] = useState({
    days: 31,
    hours: 14,
    minutes: 42,
    seconds: 19,
  });

  // Calculate countdown to the Grand World Cup Final - July 19, 2026
  useEffect(() => {
    const targetDate = new Date('2026-07-19T18:00:00-07:00'); // final match time

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Regional language detection state with persistent localStorage retrieval
  const [detectedLanguage, setDetectedLanguage] = useState(() => {
    return localStorage.getItem('world_cup_shares_detected_lang') || 'English';
  });
  const [detectionNoticeOpen, setDetectionNoticeOpen] = useState(false);

  // Sync language selection to localStorage
  useEffect(() => {
    localStorage.setItem('world_cup_shares_detected_lang', detectedLanguage);
  }, [detectedLanguage]);

  useEffect(() => {
    // Attempt IP-based country detection for automatic regional translation
    const detectRegionAndLanguage = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast loading
        
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error("API status error");
        const data = await res.json();
        const countryCode = (data.country_code || "").toUpperCase();
        
        let targetLang = 'English';
        
        const chineseCountries = ['CN', 'HK', 'TW', 'MO', 'SG'];
        const spanishCountries = ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'BO', 'PR', 'PY', 'UY', 'SV', 'CR', 'PA', 'HN', 'NI', 'CU', 'DO', 'GQ'];
        const portugueseCountries = ['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'TL', 'ST'];
        const frenchCountries = ['FR', 'CA', 'BE', 'CH', 'LU', 'MC', 'SN', 'CI', 'CD', 'MG', 'CM', 'CG'];
        const germanCountries = ['DE', 'AT', 'CH', 'LI', 'LU'];
        const italianCountries = ['IT', 'CH', 'SM', 'VA'];
        const japaneseCountries = ['JP'];
        const koreanCountries = ['KR', 'KP'];
        const turkishCountries = ['TR', 'CY'];
        const dutchCountries = ['NL', 'BE', 'SR'];
        const russianCountries = ['RU', 'BY', 'KZ', 'KG', 'UA', 'UZ', 'TM', 'TJ', 'MD', 'AM', 'GE', 'AZ'];
        const arabicCountries = ['SA', 'AE', 'EG', 'JO', 'LB', 'QA', 'KW', 'OM', 'BH', 'YE', 'IQ', 'SY', 'LY', 'SD', 'SO', 'DJ', 'MR', 'DZ', 'MA', 'TN'];

        if (chineseCountries.includes(countryCode)) {
          targetLang = '中文 (Chinese)';
        } else if (spanishCountries.includes(countryCode)) {
          targetLang = 'Español (Spanish)';
        } else if (portugueseCountries.includes(countryCode)) {
          targetLang = 'Português (Portuguese)';
        } else if (frenchCountries.includes(countryCode)) {
          targetLang = 'Français (French)';
        } else if (germanCountries.includes(countryCode)) {
          targetLang = 'Deutsch (German)';
        } else if (italianCountries.includes(countryCode)) {
          targetLang = 'Italiano (Italian)';
        } else if (japaneseCountries.includes(countryCode)) {
          targetLang = '日本語 (Japanese)';
        } else if (koreanCountries.includes(countryCode)) {
          targetLang = '한국어 (Korean)';
        } else if (turkishCountries.includes(countryCode)) {
          targetLang = 'Türkçe (Turkish)';
        } else if (dutchCountries.includes(countryCode)) {
          targetLang = 'Nederlands (Dutch)';
        } else if (russianCountries.includes(countryCode)) {
          targetLang = 'Русский (Russian)';
        } else if (arabicCountries.includes(countryCode)) {
          targetLang = 'العربية (Arabic)';
        } else {
          // Fallback to browser locale
          const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
          const langLower = browserLang.toLowerCase();
          if (langLower.startsWith('zh')) targetLang = '中文 (Chinese)';
          else if (langLower.startsWith('es')) targetLang = 'Español (Spanish)';
          else if (langLower.startsWith('pt')) targetLang = 'Português (Portuguese)';
          else if (langLower.startsWith('fr')) targetLang = 'Français (French)';
          else if (langLower.startsWith('de')) targetLang = 'Deutsch (German)';
          else if (langLower.startsWith('it')) targetLang = 'Italiano (Italian)';
          else if (langLower.startsWith('ja')) targetLang = '日本語 (Japanese)';
          else if (langLower.startsWith('ko')) targetLang = '한국어 (Korean)';
          else if (langLower.startsWith('tr')) targetLang = 'Türkçe (Turkish)';
          else if (langLower.startsWith('nl')) targetLang = 'Nederlands (Dutch)';
          else if (langLower.startsWith('ru')) targetLang = 'Русский (Russian)';
          else if (langLower.startsWith('ar')) targetLang = 'العربية (Arabic)';
        }

        setDetectedLanguage(targetLang);
        localStorage.setItem('world_cup_shares_detected_lang', targetLang);
      } catch (err) {
        console.warn("Geolocation detection failed, using browser locale fallback:", err);
        // Fallback to browser language detector
        const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
        const langLower = browserLang.toLowerCase();
        
        const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || "" : "";
        const isArabicRegion = tz.includes("Cairo") || tz.includes("Egypt") || tz.includes("Riyadh") || tz.includes("Dubai") || tz.includes("Baghdad") || tz.includes("Khartoum") || tz.includes("Amman") || tz.includes("Beirut") || tz.includes("Damascus") || tz.includes("Kuwait") || tz.includes("Muscat") || tz.includes("Doha") || tz.includes("Manama") || tz.includes("Tunis") || tz.includes("Algiers") || tz.includes("Rabat") || tz.includes("Tripoli") || tz.includes("Sanaa");

        let targetLang = 'English';
        if (langLower.startsWith('ar') || isArabicRegion) {
          targetLang = 'العربية (Arabic)';
        } else if (langLower.startsWith('es')) {
          targetLang = 'Español (Spanish)';
        } else if (langLower.startsWith('pt')) {
          targetLang = 'Português (Portuguese)';
        } else if (langLower.startsWith('fr')) {
          targetLang = 'Français (French)';
        } else if (langLower.startsWith('de')) {
          targetLang = 'Deutsch (German)';
        } else if (langLower.startsWith('it')) {
          targetLang = 'Italiano (Italian)';
        } else if (langLower.startsWith('ja')) {
          targetLang = '日本語 (Japanese)';
        } else if (langLower.startsWith('zh')) {
          targetLang = '中文 (Chinese)';
        } else if (langLower.startsWith('ko')) {
          targetLang = '한국어 (Korean)';
        } else if (langLower.startsWith('tr')) {
          targetLang = 'Türkçe (Turkish)';
        } else if (langLower.startsWith('nl')) {
          targetLang = 'Nederlands (Dutch)';
        } else if (langLower.startsWith('ru')) {
          targetLang = 'Русский (Russian)';
        }
        setDetectedLanguage(targetLang);
        localStorage.setItem('world_cup_shares_detected_lang', targetLang);
      }
    };

    detectRegionAndLanguage();
  }, []);

  // Football-Data.org server Proxy Loader & Sync Engine
  const loadFootballData = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      console.log("Fetching live Football-Data.org API endpoints...");
      const start = Date.now();
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      
      const [teamsRes, standingsRes, matchesRes] = await Promise.all([
        fetch(`${backendUrl}/api/football/teams`),
        fetch(`${backendUrl}/api/football/standings`),
        fetch(`${backendUrl}/api/football/matches`)
      ]);

      if (!teamsRes.ok || !standingsRes.ok || !matchesRes.ok) {
        throw new Error("Football-Data Server Proxy returned bad response.");
      }

      const teamsData = await teamsRes.json();
      const standingsData = await standingsRes.json();
      const matchesData = await matchesRes.json();
      const duration = Date.now() - start;

      const nTeams = (teamsData && Array.isArray(teamsData.teams)) ? teamsData.teams.length : 0;
      const nFixtures = (matchesData && Array.isArray(matchesData.matches)) ? matchesData.matches.length : 0;
      const nStandings = (standingsData && Array.isArray(standingsData.standings)) 
        ? standingsData.standings.reduce((acc: number, std: any) => acc + (std.table?.length || 0), 0) 
        : 0;

       const syncTimeString = new Date().toLocaleString();
      setLastSyncTime(syncTimeString);
      setLastResponseTime(duration);
      setNumTeamsLoaded(nTeams);
      setNumFixturesLoaded(nFixtures);
      setNumStandingsLoaded(nStandings);

      setApiSuccessCount(prev => {
        const next = prev + 1;
        localStorage.setItem('world_cup_api_success_count', String(next));
        return next;
      });

      localStorage.setItem('world_cup_shares_last_sync_time', syncTimeString);
      localStorage.setItem('world_cup_shares_last_resp_time', String(duration));
      localStorage.setItem('world_cup_shares_num_teams_loaded', String(nTeams));
      localStorage.setItem('world_cup_shares_num_fixtures_loaded', String(nFixtures));
      localStorage.setItem('world_cup_shares_num_standings_loaded', String(nStandings));

      // 1. Filter qualified countries (exclude any non-qualified or mock-up team that is not part of the WC dataset)
      const REAL_WOLD_CUP_QUALIFIED_IDS = [
        'SEN', 'NED', 'ENG', 'IRN', 'USA',
        'ARG', 'KSA', 'MEX', 'FRA', 'AUS', 'TUN',
        'ESP', 'GER', 'JPN', 'BEL', 'CAN', 'MAR', 'CRO',
        'BRA', 'SUI', 'POR', 'GHA', 'URU', 'KOR'
      ];
      
      let qualifiedIds = REAL_WOLD_CUP_QUALIFIED_IDS;
      if (teamsData && Array.isArray(teamsData.teams) && teamsData.teams.length > 0) {
        qualifiedIds = teamsData.teams.map((t: any) => t.tla?.toUpperCase()).filter((id: string) => id && !BLACKLISTED_IDS.includes(id));
      }

      // 2. Parse Group Standings statistics matrix
      const statsMap: Record<string, { wins: number; draws: number; losses: number; goalsScored: number; goalsConceded: number; matchesPlayed: number; group: string; position: number }> = {};
      
      if (standingsData && Array.isArray(standingsData.standings)) {
        standingsData.standings.forEach((standing: any) => {
          if (Array.isArray(standing.table)) {
            standing.table.forEach((row: any) => {
              const tla = row.team?.tla;
              if (tla) {
                statsMap[tla.toUpperCase()] = {
                  wins: row.won ?? 0,
                  draws: row.draw ?? 0,
                  losses: row.lost ?? 0,
                  goalsScored: row.goalsFor ?? 0,
                  goalsConceded: row.goalsAgainst ?? 0,
                  matchesPlayed: row.playedGames ?? 0,
                  group: standing.group ? standing.group.replace('GROUP_', '') : 'A',
                  position: row.position ?? 1
                };
              }
            });
          }
        });
      }

      // 3. Update active lists & stats and resolve statuses
      setCountries(prevList => {
        if (!teamsData || !Array.isArray(teamsData.teams) || teamsData.teams.length === 0) {
          return prevList;
        }

        return teamsData.teams.map((apiTeam: any) => {
          const id = apiTeam.tla?.toUpperCase();
          if (!id || BLACKLISTED_IDS.includes(id)) return null;

          const initialC = INITIAL_COUNTRIES.find(c => c.id === id);
          const existingC = prevList.find(c => c.id === id);

          const apiStats = statsMap[id];
          
          const statistics = apiStats ? {
            wins: apiStats.wins,
            draws: apiStats.draws,
            losses: apiStats.losses,
            goalsScored: apiStats.goalsScored,
            goalsConceded: apiStats.goalsConceded,
            matchesPlayed: apiStats.matchesPlayed
          } : (existingC?.statistics || initialC?.statistics || { wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, matchesPlayed: 0 });

          let status: 'ACTIVE' | 'ELIMINATED' | 'CHAMPION' = existingC?.status || initialC?.status || 'ACTIVE';
          
          if (apiStats && apiStats.matchesPlayed >= 3 && apiStats.position > 2) {
            status = 'ELIMINATED';
          }

          if (matchesData && Array.isArray(matchesData.matches)) {
            const finalMatch = matchesData.matches.find((m: any) => m.stage === 'FINAL' && m.status === 'FINISHED');
            if (finalMatch) {
              const winnerTla = finalMatch.score?.winner === 'HOME_TEAM' 
                ? finalMatch.homeTeam?.tla 
                : finalMatch.score?.winner === 'AWAY_TEAM' 
                ? finalMatch.awayTeam?.tla 
                : null;
              
              if (winnerTla && winnerTla.toUpperCase() === id) {
                status = 'CHAMPION';
              } else if (winnerTla) {
                if (finalMatch.homeTeam?.tla?.toUpperCase() === id || finalMatch.awayTeam?.tla?.toUpperCase() === id) {
                  status = 'ELIMINATED';
                }
              }
            }

            matchesData.matches.forEach((m: any) => {
              if (m.status === 'FINISHED' && m.stage !== 'GROUP_STAGE') {
                const homeTla = m.homeTeam?.tla?.toUpperCase();
                const awayTla = m.awayTeam?.tla?.toUpperCase();
                if (homeTla === id || awayTla === id) {
                  const winner = m.score?.winner;
                  if (winner === 'HOME_TEAM' && awayTla === id) {
                    status = 'ELIMINATED';
                  } else if (winner === 'AWAY_TEAM' && homeTla === id) {
                    status = 'ELIMINATED';
                  } else if (m.score?.fullTime?.home !== null && m.score?.fullTime?.away !== null) {
                    const hScore = m.score.fullTime.home ?? 0;
                    const aScore = m.score.fullTime.away ?? 0;
                    if (hScore > aScore && awayTla === id) {
                      status = 'ELIMINATED';
                    } else if (aScore > hScore && homeTla === id) {
                      status = 'ELIMINATED';
                    }
                  }
                }
              }
            });
          }

          const sWins = statistics.wins || 0;
          const sLosses = statistics.losses || 0;
          const baseSettlement = initialC?.winningSettlementPrice || 100.00;
          const dynamicPrice = Math.round(baseSettlement * Math.pow(0.97, sWins) * Math.pow(1.05, sLosses) * 100) / 100;

          const rating = initialC?.rating || 3.5;
          const currentPrice = existingC?.currentPrice || initialC?.currentPrice || 2.50;
          const popularityScore = existingC?.popularityScore || initialC?.popularityScore || 75;
          const trending = existingC?.trending || initialC?.trending || 'stable';
          const change24h = existingC?.change24h || initialC?.change24h || 0.0;
          const availableShares = existingC?.availableShares || initialC?.availableShares || 200000;
          const totalSharesPurchased = existingC?.totalSharesPurchased || initialC?.totalSharesPurchased || 0;
          const description = initialC?.description || `Official representative squad of ${apiTeam.name || id} competing in the FIFA World Cup tournament.`;

          return {
            id,
            name: apiTeam.name || initialC?.name || id,
            flag: getFlagEmoji(id),
            rating,
            currentPrice,
            winningSettlementPrice: dynamicPrice,
            potentialReturn: Math.round((dynamicPrice / currentPrice) * 10) / 10,
            group: apiStats?.group ?? existingC?.group ?? initialC?.group ?? 'A',
            ranking: apiTeam.id ? (apiTeam.id % 60) + 1 : (initialC?.ranking || 50),
            popularityScore,
            trending,
            change24h,
            availableShares,
            totalSharesPurchased,
            status,
            statistics,
            description
          };
        }).filter(Boolean) as CountryShare[];
      });

      // 4. Update schedules, results and match score lists
      const mapStage = (s: string): 'Group Stage' | 'Round of 32' | 'Round of 16' | 'Quarter-Finals' | 'Semi-Finals' | 'Third Place' | 'Final' => {
        const stage = s.toUpperCase();
        if (stage.includes('GROUP')) return 'Group Stage';
        if (stage.includes('LAST_32') || stage.includes('ROUND_32') || stage.includes('ROUND_OF_32')) return 'Round of 32';
        if (stage.includes('LAST_16') || stage.includes('ROUND_16') || stage.includes('ROUND_OF_16')) return 'Round of 16';
        if (stage.includes('QUARTER')) return 'Quarter-Finals';
        if (stage.includes('SEMI')) return 'Semi-Finals';
        if (stage.includes('THIRD') || stage.includes('3RD')) return 'Third Place';
        if (stage.includes('FINAL')) return 'Final';
        return 'Group Stage';
      };

      const mapStatus = (st: string): 'Scheduled' | 'Live' | 'Finished' => {
        const stat = st.toUpperCase();
        if (stat === 'FINISHED' || stat === 'AWARDED') return 'Finished';
        if (stat === 'IN_PLAY' || stat === 'LIVE' || stat === 'PAUSED') return 'Live';
        return 'Scheduled';
      };

      if (matchesData && Array.isArray(matchesData.matches)) {
        const loadedFixtures: MatchFixture[] = matchesData.matches.map((m: any) => {
          const homeTla = m.homeTeam?.tla?.toUpperCase() || 'TBD';
          const awayTla = m.awayTeam?.tla?.toUpperCase() || 'TBD';
          if (homeTla !== 'TBD' && BLACKLISTED_IDS.includes(homeTla)) return null;
          if (awayTla !== 'TBD' && BLACKLISTED_IDS.includes(awayTla)) return null;
          
          return {
            id: String(m.id),
            homeTeamId: homeTla,
            awayTeamId: awayTla,
            homeScore: (m.score?.fullTime?.home !== undefined && m.score?.fullTime?.home !== null) ? m.score.fullTime.home : null,
            awayScore: (m.score?.fullTime?.away !== undefined && m.score?.fullTime?.away !== null) ? m.score.fullTime.away : null,
            date: m.utcDate ? m.utcDate.slice(0, 10) : '',
            stage: mapStage(m.stage),
            status: mapStatus(m.status)
          };
        }).filter(Boolean) as MatchFixture[];

        if (loadedFixtures.length > 0) {
          setFixtures(loadedFixtures);
        }
      }

      console.log("Sync sequence completed successfully.");
    } catch (err: any) {
      console.error("Live synchroniser failure: ", err);
      setApiError(err.message || "Failed to load football data");
      setApiFailedCount(prev => {
        const next = prev + 1;
        localStorage.setItem('world_cup_api_failed_count', String(next));
        return next;
      });
    } finally {
      setApiLoading(false);
    }
  };

  // Initial and periodic 60 seconds interval poll handler
  useEffect(() => {
    loadFootballData();
    const updaterInterval = setInterval(() => {
      loadFootballData();
    }, 60000);
    return () => clearInterval(updaterInterval);
  }, []);

  // Automated championship settlement payout resolver
  useEffect(() => {
    const championCountry = countries.find(c => c.status === 'CHAMPION');
    if (championCountry) {
      const activeChampionHoldings = holdings.filter(h => h.countryId === championCountry.id && h.status === 'Active');
      const otherActiveHoldings = holdings.filter(h => h.countryId !== championCountry.id && h.status === 'Active');

      if (activeChampionHoldings.length > 0 || otherActiveHoldings.length > 0) {
        let cashToCredit = 0;
        
        const updatedHoldings = holdings.map(h => {
          if (h.status === 'Active') {
            if (h.countryId === championCountry.id) {
              cashToCredit += h.potentialWinningValue;
              return { ...h, status: 'Settled_Won' as const };
            } else {
              return { ...h, status: 'Settled_Lost' as const };
            }
          }
          return h;
        });

        if (cashToCredit > 0) {
          setUserCash(prev => prev + cashToCredit);
        }
        
        setHoldings(updatedHoldings);

        activeChampionHoldings.forEach(h => {
          const newTx: TransactionRecord = {
            id: `tx-settle-${Date.now()}-${h.id}`,
            date: new Date().toISOString().slice(0, 10),
            countryId: h.countryId,
            countryName: h.countryName,
            flag: h.flag,
            amountInvested: h.amountInvested,
            sharesQuantity: h.sharesQuantity,
            pricePerShare: h.averagePurchasePrice,
            paymentMethod: 'BankTransfer',
            status: 'Completed'
          };
          setTransactions(prev => [newTx, ...prev]);
        });

        const settleMessage = `Grand tournament concluded! ${championCountry.flag} ${championCountry.name} is the CHAMPION. Cash clearing calculations cleared automatically. Ledger paid out: $${cashToCredit.toFixed(2)}`;
        handleTriggerNotification('Tournament Concluded & Settled!', settleMessage, 'success');
      }
    }
  }, [countries, holdings]);

  // Real-time market stats ticking simulation with elapsed-time logical progression
  useEffect(() => {
    const lastUpdateStr = localStorage.getItem('world_cup_shares_last_stats_update_time');
    const now = Date.now();
    localStorage.setItem('world_cup_shares_last_stats_update_time', String(now));
    
    if (lastUpdateStr) {
      const lastUpdate = Number(lastUpdateStr);
      if (!isNaN(lastUpdate) && lastUpdate > 0) {
        const diffMs = now - lastUpdate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (diffDays > 0) {
          // Market Cap grows ~10% daily (compounded)
          setNumericMarketCap(prev => {
            const nextVal = Math.round(prev * Math.pow(1.10, diffDays));
            return nextVal;
          });
          
          // Volume grows ~15% daily (compounded)
          setNumericVolume24h(prev => {
            const nextVal = Math.round(prev * Math.pow(1.15, diffDays));
            return nextVal;
          });
        }
      }
    }
  }, []);

  // Real-time market stats ticking simulation
  useEffect(() => {
    let lastTime = Date.now();
    
    const statsTimer = setInterval(() => {
      const now = Date.now();
      const diffMs = now - lastTime;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      lastTime = now;
      
      localStorage.setItem('world_cup_shares_last_stats_update_time', String(now));
      
      setNumericMarketCap(prev => {
        // Growth: 10% daily compound + micro fluctuation
        const growth = prev * (Math.pow(1.10, diffDays) - 1);
        const fluctuation = (Math.random() - 0.45) * 60;
        return Math.max(1000000000, Math.round(prev + growth + fluctuation));
      });

      setNumericVolume24h(prev => {
        // Growth: 15% daily compound + micro fluctuation
        const growth = prev * (Math.pow(1.15, diffDays) - 1);
        const fluctuation = (Math.random() - 0.45) * 25;
        return Math.max(10000000, Math.round(prev + growth + fluctuation));
      });

      setNumericChange(prev => {
        const delta = (Math.random() - 0.49) * 0.02;
        const newVal = prev + delta;
        if (newVal < 3.0) return 3.01;
        if (newVal > 4.5) return 4.49;
        return Number(newVal.toFixed(3));
      });
    }, 1500);

    return () => clearInterval(statsTimer);
  }, []);

  // Sync back to marketStats string representations formatted cleanly
  useEffect(() => {
    setMarketStats(prev => ({
      ...prev,
      liveMarketCap: `$${numericMarketCap.toLocaleString('en-US')}`,
      volume24h: `$${numericVolume24h.toLocaleString('en-US')}`,
      marketChange24h: `↑ ${numericChange.toFixed(2)}%`
    }));
    localStorage.setItem('world_cup_shares_numericMarketCap', String(numericMarketCap));
    localStorage.setItem('world_cup_shares_numericVolume24h', String(numericVolume24h));
    localStorage.setItem('world_cup_shares_numericChange', String(numericChange));
  }, [numericMarketCap, numericVolume24h, numericChange]);

  // State for purchase checkouts modal overlay
  const [selectedCountryBuy, setSelectedCountryBuy] = useState<CountryShare | null>(null);
  const [selectedSellHolding, setSelectedSellHolding] = useState<{ holding: ShareHolding; marketPrice: number } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authIsSignUp, setAuthIsSignUp] = useState(false);
  const [pendingBuyCountry, setPendingBuyCountry] = useState<CountryShare | null>(null);

  // Notifications bell popup state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Sync state items back to localStorage upon changes
  useEffect(() => {
    localStorage.setItem('world_cup_shares_countries', JSON.stringify(countries));
  }, [countries]);

  useEffect(() => {
    localStorage.setItem('world_cup_shares_fixtures', JSON.stringify(fixtures));
  }, [fixtures]);

  useEffect(() => {
    localStorage.setItem('world_cup_shares_holdings', JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem('world_cup_shares_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('world_cup_shares_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('world_cup_shares_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('world_cup_shares_cash', userCash.toString());
  }, [userCash]);


  // Load actual verified activities from Firestore on mount
  useEffect(() => {
    const fetchPublicTxs = async () => {
      try {
        const txs = await getLatestPublicTransactions();
        const mapped = txs.map(tx => ({
          id: tx.id,
          userName: tx.userId ? `Investor #${tx.userId.substring(0, 5)}` : 'Verified Investor',
          countryId: tx.countryId,
          countryName: tx.countryName,
          flag: tx.flag || '🏳️',
          amountInvested: tx.amountInvested,
          timestamp: new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(tx.date).toLocaleDateString(),
        }));
        if (mapped.length > 0) {
          setActivities(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch public activities:", err);
      }
    };
    fetchPublicTxs();
  }, []);


  // Complete permanent price/change settings - no spontaneous background price changes will happen, keeping them permanently at current figures unless a result is settled or administrative action is taken.
  useEffect(() => {
    // Intentionally left static to enforce fixed/permanent prices on stock indices as requested
  }, []);


  // Action handlers
  const handleAddFunds = (amt: number) => {
    setUserCash(prev => prev + amt);
  };

  const handleDepositFunds = async (amt: number) => {
    if (!currentUser) return;
    try {
      const newBalance = await depositUserFunds(currentUser.uid, amt);
      setUserCash(newBalance);
    } catch (err) {
      console.error("Deposit error:", err);
      throw err;
    }
  };

  // Process purchase completion from secure checkout wizard modal
  const handleCompletePurchase = (
    cId: string,
    amount: number,
    shares: number,
    payMethod: PaymentMethod
  ) => {
    const selectedC = countries.find(c => c.id === cId);
    if (!selectedC) return;

    // Compile new Holding Deed (fallback for UI/guest)
    const holdingId = `deed-${Date.now()}`;
    const newHolding: ShareHolding = {
      id: holdingId,
      countryId: cId,
      countryName: selectedC.name,
      flag: selectedC.flag,
      sharesQuantity: shares,
      averagePurchasePrice: selectedC.currentPrice,
      amountInvested: amount,
      winningSettlementPrice: selectedC.winningSettlementPrice,
      potentialWinningValue: shares * selectedC.winningSettlementPrice,
      purchaseDate: new Date().toLocaleDateString(),
      status: 'Active'
    };

    // Compile new ledger record
    const txId = `tx-ledger-${Date.now()}`;
    const newTx: TransactionRecord = {
      id: txId,
      date: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
      countryId: cId,
      countryName: selectedC.name,
      flag: selectedC.flag,
      amountInvested: amount,
      sharesQuantity: shares,
      pricePerShare: selectedC.currentPrice,
      paymentMethod: payMethod,
      status: 'Completed',
      txHash: '0x' + Array.from({length: 40}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
    };

    // Log user purchase into public dynamic ticker stream
    const activityRecord: MarketActivity = {
      id: `act-user-${Date.now()}`,
      userName: currentUser ? currentUser.displayName : 'You (Secure Escrow)',
      countryId: cId,
      countryName: selectedC.name,
      flag: selectedC.flag,
      amountInvested: amount,
      timestamp: 'Just now'
    };

    setHoldings(prev => [newHolding, ...prev]);
    setTransactions(prev => [newTx, ...prev]);
    setActivities(prev => [activityRecord, ...prev]);

    // Update global pools metrics
    setMarketStats(prev => ({
      ...prev,
      totalShareholders: prev.totalShareholders + 1,
      totalSharesSold: prev.totalSharesSold + Math.round(shares),
      totalTournamentPool: prev.totalTournamentPool + amount,
    }));

    // Trigger instant toast-style notifications
    const newAlert: AppNotification = {
      id: `n-${Date.now()}`,
      title: 'Equity Acquired!',
      message: `Successfully allocated $${amount.toFixed(2)} to purchase ${shares.toFixed(4)} shares of ${selectedC.name}. Account synchronised.`,
      type: 'success',
      timestamp: 'Just now',
      read: false
    };

    setNotifications(prev => [newAlert, ...prev]);

    // Redraw user balance or sync directly with Firebase for authentic accuracy
    if (currentUser) {
      syncFirebaseData(currentUser.uid);
    }
  };

  // Administration controllers
  const handleUpdatePrices = (countryId: string, newPrice: number, newSettlePrice: number) => {
    setCountries(prevList => {
      return prevList.map((c) => {
        if (c.id === countryId) {
          const oldPrice = c.currentPrice;
          const percentageChange = ((newPrice - oldPrice) / oldPrice) * 100;
          return {
            ...c,
            currentPrice: newPrice,
            winningSettlementPrice: newSettlePrice,
            change24h: Number(percentageChange.toFixed(2)),
            trending: newPrice > oldPrice ? 'up' as const : newPrice < oldPrice ? 'down' as const : 'stable' as const
          };
        }
        return c;
      });
    });
  };

  const handleOverrideCountry = (countryId: string, updatedFields: Partial<CountryShare>) => {
    setCountries(prevList => {
      return prevList.map((c) => {
        if (c.id === countryId) {
          const mergedStats = updatedFields.statistics 
            ? { ...c.statistics, ...updatedFields.statistics } 
            : c.statistics;
            
          const currentPrice = updatedFields.currentPrice !== undefined ? updatedFields.currentPrice : c.currentPrice;
          const oldPrice = c.currentPrice;
          const pctChange = oldPrice > 0 ? ((currentPrice - oldPrice) / oldPrice) * 100 : 0;
          
          return {
            ...c,
            ...updatedFields,
            change24h: updatedFields.currentPrice !== undefined ? Number(pctChange.toFixed(2)) : c.change24h,
            trending: updatedFields.currentPrice !== undefined 
              ? (currentPrice > oldPrice ? 'up' as const : currentPrice < oldPrice ? 'down' as const : 'stable' as const)
              : c.trending,
            statistics: mergedStats
          };
        }
        return c;
      });
    });
  };

  const handleAddCountry = (newC: Omit<CountryShare, 'potentialReturn' | 'trending' | 'change24h' | 'statistics'>) => {
    const formattedC: CountryShare = {
      ...newC,
      potentialReturn: Number((newC.winningSettlementPrice / newC.currentPrice).toFixed(1)),
      trending: 'stable',
      change24h: 0.0,
      statistics: { wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 }
    };
    setCountries(prev => [...prev, formattedC]);
  };

  const handleRemoveCountry = (countryId: string) => {
    setCountries(prev => prev.filter(c => c.id !== countryId));
    setHoldings(prev => prev.filter(h => h.countryId !== countryId));
  };

  const handleTriggerNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'alert') => {
    const newNotif: AppNotification = {
      id: `n-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Settle a match result, altering group pts and increasing prices for winner (+24%), dropping loser (-18%)
  const handleSimulateFullTournamentMatch = (fixtureId: string, homeScore: number, awayScore: number) => {
    const fixture = fixtures.find(f => f.id === fixtureId);
    if (!fixture) return;

    const hId = fixture.homeTeamId;
    const aId = fixture.awayTeamId;

    const home = countries.find(c => c.id === hId);
    const away = countries.find(c => c.id === aId);

    if (!home || !away) return;

    const homeWon = homeScore > awayScore;
    const draw = homeScore === awayScore;

    // Update match status
    setFixtures(prev => {
      return prev.map((f) => {
        if (f.id === fixtureId) {
          return {
            ...f,
            homeScore,
            awayScore,
            status: 'Finished'
          };
        }
        return f;
      });
    });

    // Compute dynamic pricing calibration & statistics updates
    setCountries(prevList => {
      return prevList.map((c) => {
        // Home Team Update
        if (c.id === hId) {
          const oldPrice = c.currentPrice;
          let newPrice = c.currentPrice;
          let ratingDelta = 0;

          if (homeWon) {
            newPrice = Number((c.currentPrice * 1.24).toFixed(2)); // +24% surge on victory node
            ratingDelta = 1;
          } else if (draw) {
            newPrice = Number((c.currentPrice * 1.05).toFixed(2)); // slight push on draw
          } else {
            newPrice = Number((c.currentPrice * 0.82).toFixed(2)); // -18% drop on failure
            ratingDelta = -1;
          }

          const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;

          return {
            ...c,
            currentPrice: newPrice,
            statistics: {
              wins: c.statistics.wins + (homeWon ? 1 : 0),
              draws: c.statistics.draws + (draw ? 1 : 0),
              losses: c.statistics.losses + (!homeWon && !draw ? 1 : 0),
              goalsScored: c.statistics.goalsScored + homeScore,
              goalsConceded: c.statistics.goalsConceded + awayScore
            },
            change24h: Number(percentChange.toFixed(2)),
            trending: newPrice > oldPrice ? 'up' as const : 'down' as const
          };
        }

        // Away Team Update
        if (c.id === aId) {
          const oldPrice = c.currentPrice;
          let newPrice = c.currentPrice;

          if (!homeWon && !draw) { // Away won
            newPrice = Number((c.currentPrice * 1.24).toFixed(2));
          } else if (draw) {
            newPrice = Number((c.currentPrice * 1.05).toFixed(2));
          } else {
            newPrice = Number((c.currentPrice * 0.82).toFixed(2));
          }

          const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;

          return {
            ...c,
            currentPrice: newPrice,
            statistics: {
              wins: c.statistics.wins + (!homeWon && !draw ? 1 : 0),
              draws: c.statistics.draws + (draw ? 1 : 0),
              losses: c.statistics.losses + (homeWon ? 1 : 0),
              goalsScored: c.statistics.goalsScored + awayScore,
              goalsConceded: c.statistics.goalsConceded + homeScore
            },
            change24h: Number(percentChange.toFixed(2)),
            trending: newPrice > oldPrice ? 'up' as const : 'down' as const
          };
        }

        return c;
      });
    });

    // Emit live global notifications for the score simulation results!
    const resultMessage = `${home.flag} ${home.name} vs ${away.name} ${away.flag} concluded with a final result of ${homeScore}-${awayScore}! Pricing indices synchronized client-wide.`;
    handleTriggerNotification('Match Results Synchronized!', resultMessage, homeWon ? 'success' : 'alert');
  };

  const clearAllAppNotifications = () => {
    setNotifications([]);
  };

  const handleBuyAction = (country: CountryShare) => {
    if (!currentUser) {
      setPendingBuyCountry(country);
      setAuthModalOpen(true);
    } else {
      setSelectedCountryBuy(country);
    }
  };

  const markAllAppNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleScrollToLiveVideo = () => {
    setActiveRoute('dashboard');
    setTimeout(() => {
      const el = document.getElementById('hero-presentation-video');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  if (activeRoute === 'portal-dashboard') {
    return (
      <>
        <PortalDashboard
          currentUser={currentUser}
          onLogOut={handleSignOut}
          holdings={holdings}
          transactions={transactions}
          activities={activities}
          userCash={userCash}
          countries={countries}
          fixtures={fixtures}
          onDepositFunds={handleDepositFunds}
          onNavigateGuest={() => setActiveRoute('dashboard')}
          onCompletePurchase={() => {
            if (currentUser) {
              syncFirebaseData(currentUser.uid);
            }
          }}
          loadFootballData={loadFootballData}
          apiLoading={apiLoading}
          apiError={apiError}
          lastSyncTime={lastSyncTime}
          numTeamsLoaded={numTeamsLoaded}
          numFixturesLoaded={numFixturesLoaded}
          numStandingsLoaded={numStandingsLoaded}
          initialSelectedCountry={selectedCountryBuy}
          onClearInitialSelectedCountry={() => setSelectedCountryBuy(null)}
          apiSuccessCount={apiSuccessCount}
          apiFailedCount={apiFailedCount}
        />
        {/* Stripe notification overlay */}
        {paymentStatusMessage && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 bg-gradient-to-r from-[#0d121e] to-[#04060a] border border-[#2d374d] rounded-xl shadow-2xl border-l-4 border-l-[#d4af37]">
            <div className="flex items-start gap-3">
              {paymentStatusMessage.type === 'success' ? (
                <div className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-1 rounded-full bg-red-500/10 border border-[#ea580c]/30 text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 text-left">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  {paymentStatusMessage.type === 'success' ? "Payment Confirmed" : "Payment Cancelled"}
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {paymentStatusMessage.text}
                </p>
              </div>
              <button 
                onClick={() => setPaymentStatusMessage(null)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07090d] text-[#e2e8f0] flex flex-col justify-between font-sans selection:bg-[#d4af37]/30 selection:text-white overflow-x-hidden">
      
      {/* Background Images Container - Clean slate integrating image-1.jpg exactly as provided, with robust vertical repetitive CSS styling to guarantee load on Vercel */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 bg-[#07090d] overflow-hidden" 
        style={{
          backgroundImage: 'url("/image-1.jpg")',
          backgroundRepeat: 'repeat-y',
          backgroundSize: '100% auto',
          backgroundPosition: 'top center',
        }}
      >
        <div className="absolute inset-0 bg-transparent pointer-events-none" />
      </div>

      {/* Dynamic scrolling horizontal market quotes ticker - Professionally placed at the absolute top */}
      <div className="relative z-40">
        <MarketTicker countries={countries} />
      </div>

      {/* GLOBAL COUNTDOWN TOP BANNER - Positioned below the Live Ticket */}
      <div className="bg-gradient-to-r from-red-600/25 via-[#d4af37]/30 to-red-600/25 border-b border-[#d4af37]/35 py-2.5 text-center relative z-10 shadow-[0_4px_25px_rgba(212,175,55,0.18)] animate-pulse select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 font-sans">
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#d4af37] font-mono uppercase flex items-center gap-1.5">
            🏆 {tCountdown('title')}
          </span>
          <div className="flex items-center space-x-2.5 sm:space-x-4 font-mono text-white text-xs sm:text-sm">
            <div className="flex items-baseline space-x-1">
              <span className="font-black text-[#ffd07d] text-sm sm:text-base">{timeLeft.days}</span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{tCountdown('days')}</span>
            </div>
            <span className="text-[#ffd07d]/80 font-black text-sm sm:text-base">:</span>
            <div className="flex items-baseline space-x-1">
              <span className="font-black text-[#ffd07d] text-sm sm:text-base">{timeLeft.hours}</span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{tCountdown('hours')}</span>
            </div>
            <span className="text-[#ffd07d]/80 font-black text-sm sm:text-base">:</span>
            <div className="flex items-baseline space-x-1">
              <span className="font-black text-[#ffd07d] text-sm sm:text-base">{timeLeft.minutes}</span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{tCountdown('minutes')}</span>
            </div>
            <span className="text-red-500 font-black text-sm sm:text-base">:</span>
            <div className="flex items-baseline space-x-1">
              <span className="font-black text-red-500 text-sm sm:text-base animate-pulse">{timeLeft.seconds}</span>
              <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold">{tCountdown('seconds')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Luxury Header Navigation Bar - styled transparent to fit the top-top background image */}
      <header className="sticky top-0 z-30 bg-transparent border-b border-white/5 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo brand strictly matched to the screenshot */}
            <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setActiveRoute('dashboard')}>
              <Logo size={42} className="shrink-0" />
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base tracking-wide leading-tight font-display">
                  {t('brand_line1')} {t('brand_line2')}
                </span>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-mono">
                  Official Trading Platform
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links - matching professional high-contrast items */}
            <nav className="hidden md:flex items-center space-x-7 text-[13px] font-bold text-gray-400">
              <button
                onClick={handleScrollToLiveVideo}
                className="transition-all duration-200 cursor-pointer text-red-500 font-extrabold flex items-center space-x-1.5 px-3 py-1 bg-red-950/30 border border-red-500/30 rounded-lg hover:bg-red-950/50 hover:border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.15)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="tracking-wider uppercase">🔴 WATCH LIVE</span>
              </button>
              <button
                onClick={() => setActiveRoute('dashboard')}
                className={`transition-colors cursor-pointer tracking-wider uppercase ${
                  activeRoute === 'dashboard' ? 'text-white border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
                }`}
              >
                {t('nav_here')}
              </button>
              
              <button
                onClick={() => setActiveRoute('market')}
                className={`transition-colors cursor-pointer tracking-wider uppercase ${
                  activeRoute === 'market' ? 'text-white border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
                }`}
              >
                {t('nav_hage')}
              </button>

              <button
                onClick={() => setActiveRoute('live-data')}
                className={`transition-colors cursor-pointer tracking-wider uppercase ${
                  activeRoute === 'live-data' ? 'text-white border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
                }`}
              >
                {t('nav_live_data')}
              </button>

              <button
                onClick={() => setActiveRoute('tournament')}
                className={`transition-colors cursor-pointer tracking-wider uppercase ${
                  activeRoute === 'tournament' ? 'text-white border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
                }`}
              >
                {t('nav_modis')}
              </button>

              <button
                onClick={() => setActiveRoute('calculator')}
                className={`transition-colors cursor-pointer tracking-wider uppercase ${
                  activeRoute === 'calculator' ? 'text-white border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
                }`}
              >
                Calculator
              </button>

              <button
                onClick={() => setActiveRoute('how-it-works')}
                className={`transition-colors cursor-pointer tracking-wider uppercase ${
                  activeRoute === 'how-it-works' ? 'text-white border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
                }`}
              >
                {t('nav_how_it_works')}
              </button>

              <button
                onClick={() => setActiveRoute('support')}
                className={`transition-colors cursor-pointer tracking-wider uppercase ${
                  activeRoute === 'support' ? 'text-white border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
                }`}
              >
                Support Center
              </button>

              <button
                onClick={() => setActiveRoute('referral')}
                className={`transition-colors cursor-pointer tracking-wider uppercase ${
                  activeRoute === 'referral' ? 'text-white border-b-2 border-[#d4af37] pb-1' : 'hover:text-white'
                }`}
              >
                Refer & Earn
              </button>

              {currentUser ? (
                <>
                  <button
                    onClick={() => setActiveRoute('portal-dashboard')}
                    className={`transition-all duration-150 cursor-pointer tracking-wider uppercase text-amber-400 font-extrabold pb-1 border-[#d4af37] ${
                      activeRoute === 'portal-dashboard' ? 'text-amber-300 border-b-2' : 'hover:text-amber-300'
                    }`}
                  >
                    🛡️ My Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="transition-colors cursor-pointer tracking-wider uppercase hover:text-red-400 text-gray-500 font-semibold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setActiveRoute('login')}
                  className={`transition-all duration-150 cursor-pointer tracking-wider uppercase text-emerald-400 font-extrabold pb-1 border-emerald-400 ${
                    activeRoute === 'login' ? 'text-emerald-300 border-b-2' : 'hover:text-emerald-300'
                  }`}
                >
                  🔑 Login / Sign Up
                </button>
              )}

              {/* Premium Desktop Language Dropdown */}
              <div className="relative flex items-center space-x-1 pl-3.5 border-l border-white/10">
                <span className="text-xs text-[#d4af37] font-black">🌍</span>
                <select
                  value={detectedLanguage}
                  onChange={(e) => setDetectedLanguage(e.target.value)}
                  className="bg-[#0e111a] border border-[#d4af37]/40 hover:border-[#d4af37] rounded px-2 py-1 text-[11px] font-extrabold text-white cursor-pointer focus:outline-none transition-colors"
                >
                  <option value="English" className="bg-[#0e111a] text-white">English (US)</option>
                  <option value="العربية (Arabic)" className="bg-[#0e111a] text-white">العربية (Arabic)</option>
                  <option value="Español (Spanish)" className="bg-[#0e111a] text-white">Español (Spanish)</option>
                  <option value="Português (Portuguese)" className="bg-[#0e111a] text-white">Português (Portuguese)</option>
                  <option value="Français (French)" className="bg-[#0e111a] text-white">Français (French)</option>
                  <option value="Deutsch (German)" className="bg-[#0e111a] text-white">Deutsch (German)</option>
                  <option value="Italiano (Italian)" className="bg-[#0e111a] text-white">Italiano (Italian)</option>
                  <option value="日本語 (Japanese)" className="bg-[#0e111a] text-white">日本語 (Japanese)</option>
                  <option value="中文 (Chinese)" className="bg-[#0e111a] text-white">中文 (Chinese)</option>
                  <option value="Türkçe (Turkish)" className="bg-[#0e111a] text-white">Türkçe (Turkish)</option>
                  <option value="Nederlands (Dutch)" className="bg-[#0e111a] text-white">Nederlands (Dutch)</option>
                  <option value="Русский (Russian)" className="bg-[#0e111a] text-white">Русский (Russian)</option>
                  <option value="한국어 (Korean)" className="bg-[#0e111a] text-white">한국어 (Korean)</option>
                </select>
              </div>
            </nav>

            {/* Desktop header interactive elements (Mobile menu toggle on mobile) */}
            <div className="flex items-center space-x-3.5">
              
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 bg-[#10131c] rounded-xl border border-[#1e2332] hover:text-white text-gray-400 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile menu nav list block */}
        {mobileMenuOpen && (
          <nav className="md:hidden px-4 pt-2 pb-5 border-t border-[#121622] bg-[#090b10] flex flex-col space-y-2.5">
            <button
              onClick={() => { handleScrollToLiveVideo(); setMobileMenuOpen(false); }}
              className="py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded text-red-500 bg-red-950/20 border border-red-500/20 flex items-center space-x-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <span>🔴 WATCH LIVE</span>
            </button>
            <button
              onClick={() => { setActiveRoute('dashboard'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'dashboard' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              {t('nav_here')}
            </button>
            <button
              onClick={() => { setActiveRoute('market'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'market' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              {t('nav_hage')}
            </button>
            <button
              onClick={() => { setActiveRoute('live-data'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'live-data' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              {t('nav_live_data')}
            </button>
            <button
              onClick={() => { setActiveRoute('tournament'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'tournament' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              {t('nav_modis')}
            </button>
            <button
              onClick={() => { setActiveRoute('calculator'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'calculator' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => { setActiveRoute('how-it-works'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'how-it-works' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              {t('nav_how_it_works')}
            </button>
            <button
              onClick={() => { setActiveRoute('support'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'support' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              Support Center
            </button>
            <button
              onClick={() => { setActiveRoute('referral'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'referral' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              Refer & Earn
            </button>

            {currentUser ? (
              <>
                <button
                  onClick={() => { setActiveRoute('portal-dashboard'); setMobileMenuOpen(false); }}
                  className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded text-amber-400 ${
                    activeRoute === 'portal-dashboard' ? 'bg-[#141924] text-amber-300' : ''
                  }`}
                >
                  🛡️ My Dashboard
                </button>
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded text-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => { setActiveRoute('login'); setMobileMenuOpen(false); }}
                className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded text-emerald-400 ${
                  activeRoute === 'login' ? 'bg-[#141924] text-emerald-300' : ''
                }`}
              >
                🔑 Login / Sign Up
              </button>
            )}



            {/* Mobile Language Selector */}
            <div className="py-2.5 px-3 bg-[#111420] rounded border border-white/5 text-left flex flex-col space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500 font-mono">Platform Language 🌍</span>
              <select
                value={detectedLanguage}
                onChange={(e) => setDetectedLanguage(e.target.value)}
                className="bg-[#111420] text-xs text-white outline-none border border-white/10 rounded px-2 py-1 font-bold cursor-pointer w-full focus:ring-0"
              >
                <option value="English" className="bg-[#111420] text-white">English (US)</option>
                <option value="العربية (Arabic)" className="bg-[#111420] text-white">العربية (Arabic)</option>
                <option value="Español (Spanish)" className="bg-[#111420] text-white">Español (Spanish)</option>
                <option value="Português (Portuguese)" className="bg-[#111420] text-white">Português (Portuguese)</option>
                <option value="Français (French)" className="bg-[#111420] text-white">Français (French)</option>
                <option value="Deutsch (German)" className="bg-[#111420] text-white">Deutsch (German)</option>
                <option value="Italiano (Italian)" className="bg-[#111420] text-white">Italiano (Italian)</option>
                <option value="日本語 (Japanese)" className="bg-[#111420] text-white">日本語 (Japanese)</option>
                <option value="中文 (Chinese)" className="bg-[#111420] text-white">中文 (Chinese)</option>
                <option value="Türkçe (Turkish)" className="bg-[#111420] text-white">Türkçe (Turkish)</option>
                <option value="Nederlands (Dutch)" className="bg-[#111420] text-white">Nederlands (Dutch)</option>
                <option value="Русский (Russian)" className="bg-[#111420] text-white">Русский (Russian)</option>
                <option value="한국어 (Korean)" className="bg-[#111420] text-white">한국어 (Korean)</option>
              </select>
            </div>
          </nav>
        )}
      </header>

      {/* Main Body Canvas */}
      <main className="relative z-10 flex-grow">
        
        {/* Render hero component only on home/dashboard for aesthetic impact */}
        {activeRoute === 'dashboard' && (
          <HeroSection 
            stats={marketStats} 
            onNavigateToMarket={() => setActiveRoute('market')} 
            onNavigateToTournament={() => setActiveRoute('tournament')} 
            onSelectTab={(tab) => setSelectedMarketTab(tab)}
            onNavigateToSection={(section) => {
              if (section === 'live-data') {
                setActiveRoute('live-data');
              } else if (section === 'how-it-works') {
                setActiveRoute('how-it-works');
              } else if (section === 'tournament') {
                setActiveRoute('tournament');
              } else if (section === 'market') {
                setActiveRoute('market');
              } else if (section === 'support') {
                setActiveRoute('support');
              } else if (section === 'referral') {
                setActiveRoute('referral');
              } else if (section === 'calculator') {
                setActiveRoute('calculator');
              } else {
                setActiveRoute('dashboard');
              }
            }}
            onTriggerCreateAccount={() => { setAuthIsSignUp(true); setAuthModalOpen(true); }}
            onTriggerLogin={() => { setAuthIsSignUp(false); setAuthModalOpen(true); }}
            activeLanguage={detectedLanguage}
            onChangeLanguage={setDetectedLanguage}
          />
        )}

        {/* Tab content routing switches */}
        {activeRoute === 'dashboard' && (
          <div className="relative pb-16">
            
            {/* Stats Dashboard Grid from screenshot */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Live Market Cap Card */}
                <div className="bg-[#10131c]/90 border border-[#202737] rounded-xl p-5 flex items-center justify-between shadow-lg backdrop-blur-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Live Market Cap:</span>
                    <div className="text-2xl font-black text-white font-mono tracking-tight">{marketStats.liveMarketCap}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* SVG Neon rising arrow & graph matching mockup */}
                    <svg className="w-16 h-10 text-emerald-400 shrink-0" viewBox="0 0 100 40" fill="none">
                      <path d="M0 35 C20 35, 40 5, 60 25 C80 45, 90 5, 100 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* 24h Volume Card */}
                <div className="bg-[#10131c]/90 border border-[#202737] rounded-xl p-5 flex items-center justify-between shadow-lg backdrop-blur-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">24h Volume:</span>
                    <div className="text-2xl font-black text-white font-mono tracking-tight">{marketStats.volume24h}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* SVG Neon rising wave matching mockup */}
                    <svg className="w-16 h-10 text-emerald-400 shrink-0" viewBox="0 0 100 40" fill="none">
                      <path d="M0 38 C15 38, 30 15, 45 30 C60 10, 80 5, 100 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Percentage Growth card */}
                <div className="bg-[#10131c]/90 border border-[#202737] rounded-xl p-5 flex items-center justify-between shadow-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-20 h-10 text-emerald-400 shrink-0" viewBox="0 0 100 40" fill="none">
                      <path d="M0 35 C15 35, 30 5, 45 25 C60 5, 80 15, 100 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 uppercase tracking-wider font-bold block">Growth Change</span>
                    <div className="text-3xl font-extrabold text-[#22c55e] font-mono leading-none flex items-center justify-end">
                      <span>{marketStats.marketChange24h}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* National Teams Stocks Deck matching Mockup and User Request */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-8">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-extrabold text-white font-display tracking-tight">World Cup Equity Share Indices</h3>
                  <p className="text-xs text-gray-400">Buy national team stocks to claim payouts dynamically when they win tournament fixtures.</p>
                </div>
                <button 
                  onClick={() => setActiveRoute('market')}
                  className="px-4 py-2 bg-[#171d2e] hover:bg-[#20293d] border border-white/5 rounded-xl text-xs text-[#d4af37] font-semibold transition-all cursor-pointer"
                >
                  View All Teams
                </button>
              </div>

              {/* Grid matching user screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {countries.slice(0, 8).map((country) => {
                  return (
                    <div 
                      key={country.id} 
                      className="bg-[#10131c]/90 hover:bg-[#151a29]/95 border border-[#21293c] hover:border-[#d4af37]/40 rounded-xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Country Flag & Name */}
                        <div className="flex items-center space-x-2.5">
                          <span className="text-2xl" role="img" aria-label={country.name}>{country.flag}</span>
                          <span className="font-extrabold text-white text-sm tracking-wide font-display">{country.name}</span>
                        </div>

                        {/* Stars quality rating based on score */}
                        <div className="flex items-center space-x-0.5 text-[#d4af37]">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(country.rating)
                                  ? 'fill-current text-[#d4af37]'
                                  : 'text-gray-700'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Pricing block & Buy Shares CTA button */}
                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
                        <div className="text-white font-extrabold text-lg font-mono">
                          ${country.currentPrice.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleBuyAction(country)}
                          className="px-4.5 py-2 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold text-xs rounded-lg hover:from-white hover:to-[#fbbf24] shadow-md transition-all transform active:scale-95 cursor-pointer uppercase tracking-wider"
                        >
                          Buy Shares
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {activeRoute === 'market' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 font-sans">
            <button
              onClick={() => setActiveRoute('dashboard')}
              className="mb-4 inline-flex items-center space-x-2 px-4 py-2 bg-[#121622] hover:bg-[#1a2135] text-gray-300 hover:text-white border border-[#232b3e] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>← Go Back to Dashboard</span>
            </button>
            <MarketSection
              countries={countries}
              onBuyShares={(c) => handleBuyAction(c)}
              presetActiveTab={selectedMarketTab}
              onTabChange={setSelectedMarketTab}
            />
          </div>
        )}

        {activeRoute === 'live-data' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 font-sans">
            <button
              onClick={() => setActiveRoute('dashboard')}
              className="mb-4 inline-flex items-center space-x-2 px-4 py-2 bg-[#121622] hover:bg-[#1a2135] text-gray-300 hover:text-white border border-[#232b3e] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>← Go Back to Dashboard</span>
            </button>
            <TournamentCenter
              fixtures={fixtures}
              countries={countries}
              holdings={holdings}
              initialTab="fixtures"
              lastSyncTime={lastSyncTime}
              lastResponseTime={lastResponseTime}
              numTeamsLoaded={numTeamsLoaded}
              numFixturesLoaded={numFixturesLoaded}
              numStandingsLoaded={numStandingsLoaded}
              apiSuccessCount={apiSuccessCount}
              apiFailedCount={apiFailedCount}
              apiLoading={apiLoading}
              apiError={apiError}
              onManualTriggerSync={loadFootballData}
            />
          </div>
        )}

        {activeRoute === 'tournament' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 font-sans">
            <button
              onClick={() => setActiveRoute('dashboard')}
              className="mb-4 inline-flex items-center space-x-2 px-4 py-2 bg-[#121622] hover:bg-[#1a2135] text-gray-300 hover:text-white border border-[#232b3e] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>← Go Back to Dashboard</span>
            </button>
            <TournamentCenter
              fixtures={fixtures}
              countries={countries}
              holdings={holdings}
              initialTab="overview"
              lastSyncTime={lastSyncTime}
              lastResponseTime={lastResponseTime}
              numTeamsLoaded={numTeamsLoaded}
              numFixturesLoaded={numFixturesLoaded}
              numStandingsLoaded={numStandingsLoaded}
              apiSuccessCount={apiSuccessCount}
              apiFailedCount={apiFailedCount}
              apiLoading={apiLoading}
              apiError={apiError}
              onManualTriggerSync={loadFootballData}
            />


          </div>
        )}

        {activeRoute === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 font-sans">
            <button
              onClick={() => setActiveRoute('dashboard')}
              className="mb-4 inline-flex items-center space-x-2 px-4 py-2 bg-[#121622] hover:bg-[#1a2135] text-gray-300 hover:text-white border border-[#232b3e] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>← Go Back to Dashboard</span>
            </button>
            <AdminPanel
              countries={countries}
              fixtures={fixtures}
              notifications={notifications}
              onUpdatePrices={handleUpdatePrices}
              onAddCountry={handleAddCountry}
              onRemoveCountry={handleRemoveCountry}
              onTriggerNotification={handleTriggerNotification}
              onSettleFullTournamentMatch={handleSimulateFullTournamentMatch}
              onOverrideCountry={handleOverrideCountry}
              apiLoading={apiLoading}
              apiError={apiError}
              lastSyncTime={lastSyncTime}
              lastResponseTime={lastResponseTime}
              numTeamsLoaded={numTeamsLoaded}
              numFixturesLoaded={numFixturesLoaded}
              numStandingsLoaded={numStandingsLoaded}
              onManualTriggerSync={loadFootballData}
            />
          </div>
        )}

        {activeRoute === 'calculator' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 font-sans">
            <button
              onClick={() => setActiveRoute('dashboard')}
              className="mb-4 inline-flex items-center space-x-2 px-4 py-2 bg-[#121622] hover:bg-[#1a2135] text-gray-300 hover:text-white border border-[#232b3e] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>← Go Back to Dashboard</span>
            </button>
            <InvestorCalculator 
              countries={countries} 
              onNavigateMarket={() => setActiveRoute('market')} 
              activeLanguage={detectedLanguage}
            />
          </div>
        )}

        {activeRoute === 'how-it-works' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 font-sans">
            <button
              onClick={() => setActiveRoute('dashboard')}
              className="mb-4 inline-flex items-center space-x-2 px-4 py-2 bg-[#121622] hover:bg-[#1a2135] text-gray-300 hover:text-white border border-[#232b3e] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>← Go Back to Dashboard</span>
            </button>
            <HowItWorks />
          </div>
        )}

        {activeRoute === 'support' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 font-sans pb-16">
            <button
              onClick={() => setActiveRoute('dashboard')}
              className="mb-6 inline-flex items-center space-x-2 px-4 py-2 bg-[#121622] hover:bg-[#1a2135] text-gray-300 hover:text-white border border-[#232b3e] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>← Go Back to Dashboard</span>
            </button>
            {currentUser ? (
              <SupportCenter 
                currentUser={currentUser} 
                onNavigateLogin={() => setActiveRoute('login')} 
              />
            ) : (
              <div className="max-w-md mx-auto bg-[#0e111a] border border-[#d4af37]/35 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
                <div className="pb-2">
                  <span className="text-[10px] text-[#d4af37] font-extrabold tracking-widest uppercase font-mono block">SUPPORT DESK AUTHENTICATION REQUIRED</span>
                  <h3 className="text-xl font-extrabold text-white font-display uppercase tracking-wider mt-1">Access Restricted</h3>
                  <p className="text-xs text-gray-400 mt-2 font-mono">
                    Please log in or register a secure investor account to access our official Technical Support Desk.
                  </p>
                </div>

                <AuthSection
                  onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    syncFirebaseData(user.uid);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {activeRoute === 'referral' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 font-sans pb-16">
            <button
              onClick={() => setActiveRoute('dashboard')}
              className="mb-6 inline-flex items-center space-x-2 px-4 py-2 bg-[#121622] hover:bg-[#1a2135] text-gray-300 hover:text-white border border-[#232b3e] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>← Go Back to Dashboard</span>
            </button>
            {currentUser ? (
              <ReferralProgram 
                currentUser={currentUser} 
                onNavigateLogin={() => setActiveRoute('login')} 
                onCompletePurchase={() => {
                  if (currentUser) {
                    syncFirebaseData(currentUser.uid);
                  }
                }}
              />
            ) : (
              <div className="max-w-md mx-auto bg-[#0e111a] border border-[#d4af37]/35 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
                <div className="pb-2">
                  <span className="text-[10px] text-[#d4af37] font-extrabold tracking-widest uppercase font-mono block">REFERRAL SYSTEM AUTHENTICATION REQUIRED</span>
                  <h3 className="text-xl font-extrabold text-white font-display uppercase tracking-wider mt-1">Access Restricted</h3>
                  <p className="text-xs text-gray-400 mt-2 font-mono">
                    Please log in or register a secure investor account to activate your referral profile and view invite bonuses.
                  </p>
                </div>

                <AuthSection
                  onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    syncFirebaseData(user.uid);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {activeRoute === 'login' && (
          <div className="max-w-md mx-auto px-4 py-16 relative z-10 font-sans">
            <div className="bg-[#0e111a] border border-[#22293d] rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="text-center pb-2">
                <span className="text-[10px] text-[#d4af37] font-extrabold tracking-widest uppercase font-mono block">SECURE GATEWAY</span>
                <h3 className="text-xl font-extrabold text-white font-display uppercase tracking-wider mt-1">Investor Portal Authentication</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Connect your real identity node to access persistent ledger portfolios.
                </p>
              </div>

              <AuthSection
                onAuthSuccess={(user) => {
                  setCurrentUser(user);
                  syncFirebaseData(user.uid);
                  setActiveRoute('portal-dashboard');
                }}
              />

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveRoute('dashboard')}
                  className="text-xs text-gray-500 hover:text-white font-mono transition-colors"
                >
                  ← Continue browsing as guest
                </button>
              </div>
            </div>
          </div>
        )}

        {activeRoute === 'portal-dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 font-sans pb-16">
            {currentUser ? (
              <div className="bg-[#10131c]/40 rounded-2xl border border-white/5 p-1.5 shadow-2xl">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between select-none bg-[#141824]/40 rounded-t-xl">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase font-mono block">AUTHENTICATED INTERFACE AREA</span>
                    <h4 className="text-base font-bold text-white font-display flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      Compliant Escrow Portfolio Ledger
                    </h4>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="hidden sm:inline-block p-1 px-3.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold font-mono rounded-lg uppercase tracking-wider">
                      Owner: {currentUser.displayName.toUpperCase()}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider px-3 py-1.5 bg-red-950/10 border border-red-500/10 rounded-lg hover:bg-red-950/20 transition-all cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
                
                <UserDashboard
                  currentUser={currentUser}
                  onLogOut={handleSignOut}
                  holdings={holdings}
                  transactions={transactions}
                  activities={activities}
                  userCash={userCash}
                  countries={countries}
                  fixtures={fixtures}
                  onDepositFunds={handleDepositFunds}
                />
              </div>
            ) : (
              <div className="bg-[#10131c]/60 border-2 border-[#d4af37]/45 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-6 shadow-2xl">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
                    <Lock className="w-7 h-7 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-exrabold text-white text-base font-display uppercase tracking-widest">Access Session Closed</h4>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                    Your portal session was terminated or has expired. Please authenticate to enable secure investment transaction syncing.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setActiveRoute('login')}
                    className="px-6 py-3 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold text-xs rounded-xl hover:from-white hover:to-[#fbbf24] shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-widest"
                  >
                    Authenticate Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Checkout wizard selection modal portal */}
      {selectedCountryBuy && (
        <PurchaseModal
          country={selectedCountryBuy}
          userCash={userCash}
          userId={currentUser ? currentUser.uid : null}
          onClose={() => setSelectedCountryBuy(null)}
          onCompletePurchase={(shares, totalPaid) => {
            if (currentUser) {
              syncFirebaseData(currentUser.uid);
            } else if (shares !== undefined && totalPaid !== undefined) {
              setUserCash(prev => Math.max(0, prev - totalPaid));
              handleCompletePurchase(selectedCountryBuy.id, totalPaid, shares, 'USDT');
            }
            setSelectedCountryBuy(null);
          }}
        />
      )}

      {/* Liquidation selection modal portal */}
      {selectedSellHolding && (
        <SellModal
          holding={selectedSellHolding.holding}
          marketPrice={selectedSellHolding.marketPrice}
          userId={currentUser ? currentUser.uid : null}
          onClose={() => setSelectedSellHolding(null)}
          onCompleteSale={(sharesSold, usdReceived) => {
            if (currentUser) {
              syncFirebaseData(currentUser.uid);
            } else if (sharesSold !== undefined && usdReceived !== undefined) {
              // Guest mode sale in-memory update
              setUserCash(prev => prev + usdReceived);

              setHoldings(prev => {
                const match = prev.find(h => h.id === selectedSellHolding.holding.id);
                if (!match) return prev;
                const remaining = match.sharesQuantity - sharesSold;
                if (remaining < 0.0001) {
                  return prev.filter(h => h.id !== selectedSellHolding.holding.id);
                } else {
                  return prev.map(h => h.id === selectedSellHolding.holding.id ? {
                    ...h,
                    sharesQuantity: remaining,
                    amountInvested: Math.max(0, h.amountInvested - (sharesSold * h.averagePurchasePrice)),
                    potentialWinningValue: remaining * h.winningSettlementPrice
                  } : h);
                }
              });

              const txId = `tx-ledger-sell-${Date.now()}`;
              const sellTx: TransactionRecord = {
                id: txId,
                date: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
                countryId: selectedSellHolding.holding.countryId,
                countryName: selectedSellHolding.holding.countryName,
                flag: selectedSellHolding.holding.flag,
                amountInvested: -usdReceived,
                sharesQuantity: -sharesSold,
                pricePerShare: selectedSellHolding.marketPrice,
                paymentMethod: 'USDT',
                status: 'Completed',
                txHash: '0x' + Array.from({length: 40}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
              };
              setTransactions(prev => [sellTx, ...prev]);

              const activityRecord: MarketActivity = {
                id: `act-user-sell-${Date.now()}`,
                userName: 'You (Secure Escrow)',
                countryId: selectedSellHolding.holding.countryId,
                countryName: selectedSellHolding.holding.countryName,
                flag: selectedSellHolding.holding.flag,
                amountInvested: -usdReceived,
                timestamp: 'Just now'
              };
              setActivities(prev => [activityRecord, ...prev]);

              const newAlert: AppNotification = {
                id: `n-sell-${Date.now()}`,
                title: 'Liquidation Confirmed!',
                message: `Successfully liquidated ${sharesSold.toFixed(4)} shares of ${selectedSellHolding.holding.countryName}. $${usdReceived.toFixed(2)} USD credited to your balance.`,
                type: 'success',
                timestamp: 'Just now',
                read: false
              };
              setNotifications(prev => [newAlert, ...prev]);
            }
            setSelectedSellHolding(null);
          }}
        />
      )}

      {/* Secure Auth Modal overlay */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-[#07090d]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative bg-[#0e111a] border border-[#22293d] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Close button */}
            <button 
              onClick={() => { setAuthModalOpen(false); setPendingBuyCountry(null); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer text-xs font-black font-mono px-2 py-1 bg-[#1a2133] rounded-md"
            >
              ✕ CLOSE
            </button>

            <div className="text-center mb-6 pt-2">
              <h3 className="text-base font-black text-white font-display uppercase tracking-wider">SECURE PORTFOLIO GATEWAY</h3>
              <p className="text-xs text-gray-400 mt-1.5">
                {pendingBuyCountry 
                  ? `Please register or login to acquire shares of ${pendingBuyCountry.name}.`
                  : "Sign in to access your portfolio dashboard and manage your investments."}
              </p>
            </div>

            <AuthSection 
              defaultIsSignUp={authIsSignUp}
              onAuthSuccess={(user) => {
                setCurrentUser(user);
                setAuthModalOpen(false);
                setActiveRoute('portal-dashboard');
                if (pendingBuyCountry) {
                  setSelectedCountryBuy(pendingBuyCountry);
                  setPendingBuyCountry(null);
                }
              }} 
            />
          </div>
        </div>
      )}

      {/* Redesigned Rich Professional Footer Area with Handles, News, and Scoreboards */}
      <footer className="relative bg-[#050609] border-t border-[#1a1f2e] pt-14 pb-8 text-[#616c80] font-mono z-15 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#131926]">
            
            {/* Column 1: Brand & FIFA Org */}
            <div className="space-y-3.5">
              <span className="font-black text-white text-xs uppercase tracking-wider block">Fédération Resources</span>
              <p className="text-[11px] leading-relaxed text-[#4e5666]">
                Official marketplace for international World Cup allocations. Authorized and secure.
              </p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center space-x-2 text-[#9da8bd]">
                  <span className="text-gray-500 min-w-[70px]">Instagram:</span>
                  <svg className="w-3.5 h-3.5 text-pink-500 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  <a href="https://instagram.com/fifaworldcup" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] hover:underline">@fifaworldcup</a>
                </div>
                <div className="flex items-center space-x-2 text-[#9da8bd]">
                  <span className="text-gray-500 min-w-[70px]">Twitter:</span>
                  <svg className="w-3.5 h-3.5 text-[#eaeaea] fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <a href="https://twitter.com/fifaworldcup" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] hover:underline">@FIFAWorldCup</a>
                </div>
                <div className="flex items-center space-x-2 text-[#9da8bd]">
                  <span className="text-gray-500 min-w-[70px]">TikTok:</span>
                  <svg className="w-3.5 h-3.5 text-teal-400 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.58-1 .01 2.76 0 5.52.01 8.28-.02 1.25-.27 2.5-.85 3.63-.97 1.9-2.88 3.25-5.03 3.47-2.3.26-4.75-.43-6.31-2.12-1.74-1.85-2.47-4.56-1.93-7.02.47-2.18 1.95-4.08 4.01-4.88.94-.37 1.94-.53 2.95-.51.02 1.34 0 2.68.01 4.02-.73-.01-1.48.1-2.13.48-.93.51-1.51 1.52-1.52 2.58.02 1.09.61 2.11 1.54 2.64.92.54 2.1.52 3-.04.81-.49 1.25-1.42 1.25-2.36 0-3.66.01-7.32.01-10.98z" />
                  </svg>
                  <a href="https://tiktok.com/@fifaworldcup" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] hover:underline">@fifaworldcup</a>
                </div>
              </div>
            </div>

            {/* Column 2: Financial Markets & Stock Handles */}
            <div className="space-y-3.5">
              <span className="font-black text-white text-xs uppercase tracking-wider block">Markets & Stocks</span>
              <p className="text-[11px] leading-relaxed text-[#4e5666]">
                Track global equity indexes, volatility indexes, and country market capitalization in real time.
              </p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center space-x-2 text-[#9da8bd]">
                  <span className="text-gray-500 min-w-[90px]">Bloomberg:</span>
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <rect x="1" y="1" width="22" height="22" rx="4" fill="#0c87f2" />
                    <text x="6" y="16" fill="#fff" fontSize="13" fontWeight="black" fontFamily="sans-serif">B</text>
                  </svg>
                  <a href="https://www.bloomberg.com/markets" target="_blank" rel="noopener noreferrer" className="hover:text-[#3b82f6] hover:underline">Bloomberg Markets</a>
                </div>
                <div className="flex items-center space-x-2 text-[#9da8bd]">
                  <span className="text-gray-500 min-w-[90px]">Reuters Stock:</span>
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#f57c00" />
                    <circle cx="12" cy="12" r="3" fill="#fff" />
                    <circle cx="7" cy="12" r="1.5" fill="#fff" />
                    <circle cx="17" cy="12" r="1.5" fill="#fff" />
                    <circle cx="12" cy="7" r="1.5" fill="#fff" />
                    <circle cx="12" cy="17" r="1.5" fill="#fff" />
                  </svg>
                  <a href="https://www.reuters.com/markets" target="_blank" rel="noopener noreferrer" className="hover:text-[#3b82f6] hover:underline">Reuters Stock</a>
                </div>
                <div className="flex items-center space-x-2 text-[#9da8bd]">
                  <span className="text-gray-500 min-w-[90px]">CM Life:</span>
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <rect x="1" y="1" width="22" height="22" rx="4" fill="#6a0000" />
                    <text x="4" y="15" fill="#fff" fontSize="10" fontWeight="extrabold" fontFamily="sans-serif">CM</text>
                  </svg>
                  <a href="https://www.cm-life.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#3b82f6] hover:underline">Central Michigan Life</a>
                </div>
              </div>
            </div>

            {/* Column 3: Live Score Switchboard */}
            <div className="space-y-3.5">
              <span className="font-black text-white text-xs uppercase tracking-wider block">Live Scoreboard Channels</span>
              <p className="text-[11px] leading-relaxed text-[#4e5666]">
                Sync active matches, check scores, rosters, or referee decisions to monitor your team's equity fluctuations.
              </p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center space-x-2 text-[#9da8bd]">
                  <span className="text-[#a855f7]">✦</span>
                  <a href="https://www.livescore.com" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">LiveScore Official</a>
                </div>
                <div className="flex items-center space-x-2 text-[#9da8bd]">
                  <span className="text-[#a855f7]">✦</span>
                  <a href="https://www.sofascore.com" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">SofaScore Live</a>
                </div>
                <div className="flex items-center space-x-2 text-[#9da8bd]">
                  <span className="text-[#a855f7]">✦</span>
                  <a href="https://www.fotmob.com" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">FotMob Fixtures</a>
                </div>
              </div>
            </div>

            {/* Column 4: Cryptographic Governance & Contacts */}
            <div className="space-y-3.5">
              <span className="font-black text-white text-xs uppercase tracking-wider block">Official Inquiries & Support</span>
              <div className="space-y-2 text-[11px] text-[#9da8bd]">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Investment Enquiries</span>
                  <a href="mailto:Invest@worldcupstock.space" className="hover:text-[#d4af37] transition-colors font-mono">Invest@worldcupstock.space</a>
                </div>
                <div className="flex flex-col space-y-0.5">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">General Enquiries</span>
                  <a href="mailto:Contact@worldcupstock.space" className="hover:text-[#d4af37] transition-colors font-mono">Contact@worldcupstock.space</a>
                </div>
                <div className="flex flex-col space-y-0.5">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Customer Support</span>
                  <a href="mailto:Support@worldcupstock.space" className="hover:text-[#d4af37] transition-colors font-mono">Support@worldcupstock.space</a>
                </div>
              </div>

            </div>

          </div>

          <div className="pt-8 text-center space-y-4">
            <div className="flex justify-center space-x-6 items-center flex-wrap text-[#8b98b0] text-[10px]">
              <span className="font-black text-[#d4af37]">WORLD CUP STOCK SHARES EXCHANGE</span>
              <span>•</span>
              <span>Secure Custodial Escrow</span>
              <span>•</span>
              <span>Secure Encryption Enabled</span>
            </div>

            <div className="text-[10px] text-gray-700">
              © 2026 World Cup Stock Shares Platform. All share allocations are active and audited under international guidelines.
            </div>
          </div>

        </div>
      </footer>

      {/* Stripe notification overlay */}
      {paymentStatusMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 bg-gradient-to-r from-[#0d121e] to-[#04060a] border border-[#2d374d] rounded-xl shadow-2xl border-l-4 border-l-[#d4af37]">
          <div className="flex items-start gap-3">
            {paymentStatusMessage.type === 'success' ? (
              <div className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-1 rounded-full bg-red-500/10 border border-[#ea580c]/30 text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 text-left">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                {paymentStatusMessage.type === 'success' ? "Payment Confirmed" : "Payment Cancelled"}
              </h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {paymentStatusMessage.text}
              </p>
            </div>
            <button 
              onClick={() => setPaymentStatusMessage(null)}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
