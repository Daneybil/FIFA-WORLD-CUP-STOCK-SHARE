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
import MarketSection from './components/MarketSection';
import PurchaseModal from './components/PurchaseModal';
import UserDashboard from './components/UserDashboard';
import TournamentCenter from './components/TournamentCenter';
import AdminPanel from './components/AdminPanel';
import AuthSection from './components/AuthSection';

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

export default function App() {
  // Navigation Routing Tab
  const [activeRoute, setActiveRoute] = useState<'dashboard' | 'market' | 'tournament' | 'admin'>('dashboard');
  
  // Mobile menu control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero dropdown state
  const [heroDropdownOpen, setHeroDropdownOpen] = useState(false);

  // States with persistent LocalStorage retrieval
  const [countries, setCountries] = useState<CountryShare[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_countries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === INITIAL_COUNTRIES.length) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_COUNTRIES;
  });

  const [fixtures, setFixtures] = useState<MatchFixture[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_fixtures');
    return saved ? JSON.parse(saved) : INITIAL_FIXTURES;
  });

  const [holdings, setHoldings] = useState<ShareHolding[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_holdings');
    return saved ? JSON.parse(saved) : []; // Seeding empty holdings so users can buy freely
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<MarketActivity[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('world_cup_shares_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Escrow Cash allocated
  const [userCash, setUserCash] = useState<number>(() => {
    const saved = localStorage.getItem('world_cup_shares_cash');
    return saved ? parseFloat(saved) : 1000.00; // Giving $1,000 for sandboxed actions out of the box!
  });

  // User persistent authentication state pre-linked for Firebase
  const [currentUser, setCurrentUser] = useState<{ email: string; displayName: string } | null>(() => {
    const saved = localStorage.getItem('world_cup_shares_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('world_cup_shares_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('world_cup_shares_current_user');
    }
  }, [currentUser]);

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
  const [numericMarketCap, setNumericMarketCap] = useState(12500000000); 
  const [numericVolume24h, setNumericVolume24h] = useState(450000000); 
  const [numericChange, setNumericChange] = useState(3.2);

  const [selectedMarketTab, setSelectedMarketTab] = useState<'all' | 'trending' | 'speculative' | 'group' | 'active' | 'eliminated'>('all');

  // Football-Data.org Live Synchronizer states
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Regional language detection state
  const [detectedLanguage, setDetectedLanguage] = useState('English');
  const [detectionNoticeOpen, setDetectionNoticeOpen] = useState(false);

  useEffect(() => {
    try {
      const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
      const langLower = browserLang.toLowerCase();
      let matchedLang = 'English';
      if (langLower.startsWith('es')) {
        matchedLang = 'Español (Spanish)';
      } else if (langLower.startsWith('pt')) {
        matchedLang = 'Português (Portuguese)';
      } else if (langLower.startsWith('fr')) {
        matchedLang = 'Français (French)';
      } else if (langLower.startsWith('de')) {
        matchedLang = 'Deutsch (German)';
      } else if (langLower.startsWith('it')) {
        matchedLang = 'Italiano (Italian)';
      } else if (langLower.startsWith('ja')) {
        matchedLang = '日本語 (Japanese)';
      } else if (langLower.startsWith('ar')) {
        matchedLang = 'العربية (Arabic)';
      } else if (langLower.startsWith('zh')) {
        matchedLang = '中文 (Chinese)';
      } else if (langLower.startsWith('ko')) {
        matchedLang = '한국어 (Korean)';
      }
      setDetectedLanguage(matchedLang);
      if (matchedLang !== 'English') {
        setDetectionNoticeOpen(true);
      }
    } catch (e) {
      console.warn("Language detection bypassed: ", e);
    }
  }, []);

  // Football-Data.org server Proxy Loader & Sync Engine
  const loadFootballData = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      console.log("Fetching live Football-Data.org API endpoints...");
      
      const [teamsRes, standingsRes, matchesRes] = await Promise.all([
        fetch('/api/football/teams'),
        fetch('/api/football/standings'),
        fetch('/api/football/matches')
      ]);

      if (!teamsRes.ok || !standingsRes.ok || !matchesRes.ok) {
        throw new Error("Football-Data Server Proxy returned bad response.");
      }

      const teamsData = await teamsRes.json();
      const standingsData = await standingsRes.json();
      const matchesData = await matchesRes.json();

      // 1. Filter qualified countries (exclude any non-qualified or mock-up team that is not part of the WC dataset)
      const REAL_WOLD_CUP_QUALIFIED_IDS = [
        'QAT', 'ECU', 'SEN', 'NED', 'ENG', 'IRN', 'USA', 'WAL',
        'ARG', 'KSA', 'MEX', 'POL', 'FRA', 'AUS', 'DEN', 'TUN',
        'ESP', 'CRC', 'GER', 'JPN', 'BEL', 'CAN', 'MAR', 'CRO',
        'BRA', 'SRB', 'SUI', 'CMR', 'POR', 'GHA', 'URU', 'KOR'
      ];
      
      let qualifiedIds = REAL_WOLD_CUP_QUALIFIED_IDS;
      if (teamsData && Array.isArray(teamsData.teams) && teamsData.teams.length > 0) {
        qualifiedIds = teamsData.teams.map((t: any) => t.tla?.toUpperCase()).filter(Boolean);
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
        const filteredInitials = INITIAL_COUNTRIES.filter(c => qualifiedIds.includes(c.id));
        
        return filteredInitials.map(initialC => {
          const existingC = prevList.find(c => c.id === initialC.id) || initialC;
          const apiStats = statsMap[initialC.id];
          
          const statistics = apiStats ? {
            wins: apiStats.wins,
            draws: apiStats.draws,
            losses: apiStats.losses,
            goalsScored: apiStats.goalsScored,
            goalsConceded: apiStats.goalsConceded,
            matchesPlayed: apiStats.matchesPlayed
          } : existingC.statistics;

          let status: 'ACTIVE' | 'ELIMINATED' | 'CHAMPION' = 'ACTIVE';
          
          if (apiStats && apiStats.matchesPlayed >= 3 && (apiStats.position === 3 || apiStats.position === 4)) {
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
              
              if (winnerTla && winnerTla.toUpperCase() === initialC.id) {
                status = 'CHAMPION';
              } else if (winnerTla) {
                if (finalMatch.homeTeam?.tla?.toUpperCase() === initialC.id || finalMatch.awayTeam?.tla?.toUpperCase() === initialC.id) {
                  status = 'ELIMINATED';
                }
              }
            }

            matchesData.matches.forEach((m: any) => {
              if (m.status === 'FINISHED' && m.stage !== 'GROUP_STAGE') {
                const homeTla = m.homeTeam?.tla?.toUpperCase();
                const awayTla = m.awayTeam?.tla?.toUpperCase();
                if (homeTla === initialC.id || awayTla === initialC.id) {
                  const winner = m.score?.winner;
                  if (winner === 'HOME_TEAM' && awayTla === initialC.id) {
                    status = 'ELIMINATED';
                  } else if (winner === 'AWAY_TEAM' && homeTla === initialC.id) {
                    status = 'ELIMINATED';
                  } else if (m.score?.fullTime?.home !== null && m.score?.fullTime?.away !== null) {
                    const hScore = m.score.fullTime.home ?? 0;
                    const aScore = m.score.fullTime.away ?? 0;
                    if (hScore > aScore && awayTla === initialC.id) {
                      status = 'ELIMINATED';
                    } else if (aScore > hScore && homeTla === initialC.id) {
                      status = 'ELIMINATED';
                    }
                  }
                }
              }
            });
          }

          return {
            ...existingC,
            name: initialC.name,
            flag: initialC.flag,
            group: apiStats?.group ?? existingC.group,
            statistics,
            status
          };
        });
      });

      // 4. Update schedules, results and match score lists
      const mapStage = (s: string): 'Group Stage' | 'Round of 16' | 'Quarter-Finals' | 'Semi-Finals' | 'Final' => {
        const stage = s.toUpperCase();
        if (stage.includes('GROUP')) return 'Group Stage';
        if (stage.includes('LAST_16') || stage.includes('ROUND_16') || stage.includes('ROUND_OF_16')) return 'Round of 16';
        if (stage.includes('QUARTER')) return 'Quarter-Finals';
        if (stage.includes('SEMI')) return 'Semi-Finals';
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
          const homeTla = m.homeTeam?.tla;
          const awayTla = m.awayTeam?.tla;
          if (!homeTla || !awayTla) return null;
          
          return {
            id: String(m.id),
            homeTeamId: homeTla.toUpperCase(),
            awayTeamId: awayTla.toUpperCase(),
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

  // Real-time market stats ticking simulation (Formula logic: 10% average growth per 24h)
  useEffect(() => {
    const statsTimer = setInterval(() => {
      setNumericMarketCap(prev => {
        const dailyRate = 0.10 / (86400 / 1.5);
        const randomFactor = (0.5 + Math.random() * 1.5);
        const increment = prev * dailyRate * randomFactor;
        const fluctuation = (Math.random() - 0.45) * 5000; // slightly upward biased micro fluctuations
        return Math.round(prev + increment + fluctuation);
      });

      setNumericVolume24h(prev => {
        const dailyRate = 0.10 / (86400 / 1.5);
        const randomFactor = (0.5 + Math.random() * 1.5);
        const increment = prev * dailyRate * randomFactor;
        const fluctuation = (Math.random() - 0.45) * 2000;
        return Math.round(prev + increment + fluctuation);
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
  }, [numericMarketCap, numericVolume24h, numericChange]);

  // State for purchase checkouts modal overlay
  const [selectedCountryBuy, setSelectedCountryBuy] = useState<CountryShare | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
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


  // Real-time market purchase activity feeds (completely stable, permanent stock prices)
  useEffect(() => {
    const feedInterval = setInterval(() => {
      // Pick random country
      const randCountry = countries[Math.floor(Math.random() * countries.length)];
      if (!randCountry) return;

      const randomNames = [
        'Trader_UK_02', 'crypto_wizard_8', 'W CupWhale_9', '0x21a3...fb02', 'Messi_Is_G0at', 'ParisSaint_A',
        'SambaBull_88', '0x5ca9...22ef', 'InvestmentRanger', 'HooliganFinances', 'Tokyo_Stox_3', 'USA_Speculator'
      ];
      const randomAmounts = [25.00, 50.00, 100.00, 200.00, 500.00, 50.00, 75.00, 150.00, 250.00, 1200.00];

      const buyer = randomNames[Math.floor(Math.random() * randomNames.length)];
      const cashSpent = randomAmounts[Math.floor(Math.random() * randomAmounts.length)];

      const newActivityRecord: MarketActivity = {
        id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userName: buyer,
        countryId: randCountry.id,
        countryName: randCountry.name,
        flag: randCountry.flag,
        amountInvested: cashSpent,
        timestamp: 'Just now'
      };

      // Add to activities, cap at 20 logs for token and space limits
      setActivities(prev => [newActivityRecord, ...prev.slice(0, 18)]);

      // Only reduce available shares, do NOT mutate currentPrice or change24h dynamically to keep them 100% permanent/stable
      setCountries(prevList => {
        return prevList.map((c) => {
          if (c.id === randCountry.id) {
            return {
              ...c,
              availableShares: Math.max(1000, c.availableShares - Math.round(cashSpent / c.currentPrice))
            };
          }
          return c;
        });
      });

      // Slide stats slightly
      setMarketStats(prev => ({
        ...prev,
        totalSharesSold: prev.totalSharesSold + Math.round(cashSpent / randCountry.currentPrice),
        totalTournamentPool: prev.totalTournamentPool + Math.round(cashSpent * 0.6)
      }));

    }, 35000); // Trigger every 35 seconds to keep the site very live but non-disruptive

    return () => clearInterval(feedInterval);

  }, [countries]);


  // Complete permanent price/change settings - no spontaneous background price changes will happen, keeping them permanently at current figures unless a result is settled or administrative action is taken.
  useEffect(() => {
    // Intentionally left static to enforce fixed/permanent prices on stock indices as requested
  }, []);


  // Action handlers
  const handleAddFunds = (amt: number) => {
    setUserCash(prev => prev + amt);
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

    // Deduct user balance
    setUserCash(prev => Math.max(0, prev - amount));

    // Compile new Holding Deed
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
      userName: 'You (Secure Escrow)',
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
      message: `Successfully allocated $${amount.toFixed(2)} to purchase ${shares.toFixed(4)} shares of ${selectedC.name}. Ledger node synchronised.`,
      type: 'success',
      timestamp: 'Just now',
      read: false
    };

    setNotifications(prev => [newAlert, ...prev]);
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
    if (currentUser) {
      setSelectedCountryBuy(country);
    } else {
      setPendingBuyCountry(country);
      setAuthModalOpen(true);
    }
  };

  const markAllAppNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative min-h-screen bg-[#07090d] text-[#e2e8f0] flex flex-col justify-between font-sans selection:bg-[#d4af37]/30 selection:text-white overflow-x-hidden">
      
      {/* Regional Language Detector Top Notification Bar */}
      <div className="relative z-40 bg-gradient-to-r from-[#0d121f] via-[#1a233a] to-[#0d121f] border-b border-white/5 py-2 text-center text-[11px] text-gray-300 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-2">
          <span>🌍</span>
          <span>
            [Regional Detector]: Browser region auto-detected language: <strong className="text-[#d4af37]">{detectedLanguage}</strong>. Platform is synchronized and auto-translated.
          </span>
          {detectionNoticeOpen && (
            <button 
              onClick={() => setDetectionNoticeOpen(false)}
              className="ml-3 text-[10px] text-gray-400 hover:text-white bg-black/40 px-2 py-0.5 rounded border border-white/5"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      {/* Background Images Container - Clean slate integrating image-1.jpg exactly as provided, duplicated vertically to cover the website's background height beautifully */}
      <div className="absolute inset-x-0 top-0 bottom-0 min-h-full pointer-events-none z-0 bg-[#07090d] overflow-hidden flex flex-col">
        {/* We present a seamless vertical repetition of the target background image without scaling, cropping or distortion, ensuring all corners and text like "Cup" remain fully visible */}
        <div className="w-full select-none flex flex-col">
          <img 
            src="/image-1.jpg" 
            alt="Top Background 1"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 2"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 3"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 4"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 5"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 6"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 7"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 8"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 9"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 10"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 11"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 12"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 13"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 14"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 15"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 16"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 17"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 18"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 19"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 20"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 21"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
          <img 
            src="/image-1.jpg" 
            alt="Top Background 22"
            className="w-full h-auto object-contain opacity-100 block" 
            referrerPolicy="no-referrer" 
          />
        </div>
        <div className="absolute inset-0 bg-transparent pointer-events-none" />
      </div>

      {/* Dynamic scrolling horizontal market quotes ticker */}
      <div className="relative z-10">
        <MarketTicker countries={countries} />
      </div>

      {/* Main Luxury Header Navigation Bar - styled transparent to fit the top-top background image */}
      <header className="sticky top-0 z-30 bg-transparent border-b border-white/5 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo brand strictly matched to the screenshot */}
            <div className="flex flex-col cursor-pointer select-none" onClick={() => setActiveRoute('dashboard')}>
              <span className="font-bold text-white text-base tracking-wide leading-tight">
                FIFA World Cup
              </span>
              <span className="text-sm text-gray-300 tracking-wide leading-tight">
                Stock Shares
              </span>
            </div>

            {/* Desktop Navigation Links - matching exactly "Here", "Hage", "Modis" from image */}
            <nav className="hidden md:flex items-center space-x-10 text-[15px] font-medium text-gray-400">
              <button
                onClick={() => setActiveRoute('dashboard')}
                className={`transition-colors cursor-pointer text-sm font-semibold tracking-wider ${
                  activeRoute === 'dashboard' ? 'text-white' : 'hover:text-white'
                }`}
              >
                Here
              </button>
              
              <button
                onClick={() => setActiveRoute('market')}
                className={`transition-colors cursor-pointer text-sm font-semibold tracking-wider ${
                  activeRoute === 'market' ? 'text-white' : 'hover:text-white'
                }`}
              >
                Hage
              </button>

              <button
                onClick={() => setActiveRoute('tournament')}
                className={`transition-colors cursor-pointer text-sm font-semibold tracking-wider ${
                  activeRoute === 'tournament' ? 'text-white' : 'hover:text-white'
                }`}
              >
                Modis
              </button>
            </nav>

            {/* Interactive 'Hero ⌄' Golden Dropdown Button strictly matches screenshot */}
            <div className="flex items-center space-x-3.5">
              
              {apiLoading ? (
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                  <span>SYNCING LIVE...</span>
                </span>
              ) : apiError ? (
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono font-bold tracking-wider uppercase" title={apiError}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>FEED OFFLINE</span>
                </span>
              ) : (
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold tracking-wider uppercase" title="Real-time Football-Data.org proxy live feed actively pooled every 60 seconds">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-ping" />
                  <span>LIVE FEED ACTIVE</span>
                </span>
              )}

              <div className="relative">
                <button
                  onClick={() => setHeroDropdownOpen(!heroDropdownOpen)}
                  className="px-4.5 py-2.5 bg-[#141824] hover:bg-[#1c2235] border border-[#d4af37] rounded-xl flex items-center space-x-2 shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:border-white transition-all transform active:scale-95 cursor-pointer text-[#d4af37] font-extrabold text-xs tracking-wider uppercase font-mono"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>Ledger Profile (Hero)</span>
                  <span className="text-[8px] font-bold">▼</span>
                </button>

                {/* Dropdown containing the secure escrow cash, notifications, and compliance options */}
                {heroDropdownOpen && (
                  <div className="absolute right-0 mt-3.5 w-64 bg-[#111420]/95 backdrop-blur-xl border border-[#21293c] rounded-xl shadow-2xl p-4.5 space-y-3.5 z-50">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] pb-1 border-b border-[#21293c]">
                      Ledger Profile
                    </div>
                    
                    {/* Wallet cash */}
                    <div className="flex items-center justify-between py-1 px-2.5 bg-[#171d2e] rounded-lg border border-[#26314c]">
                      <span className="text-[10px] font-semibold text-gray-400">Escrow Balance</span>
                      <span className="text-emerald-400 font-extrabold text-xs">${userCash.toFixed(2)}</span>
                    </div>

                    {/* Notification toggles */}
                    <div 
                      className="flex items-center justify-between py-1 px-2.5 bg-[#171d2e] rounded-lg border border-[#26314c] cursor-pointer hover:bg-[#1e253c] transition-colors"
                      onClick={() => { setNotificationsOpen(!notificationsOpen); setHeroDropdownOpen(false); }}
                    >
                      <span className="text-[10px] font-semibold text-gray-400">Notifications Bulletin</span>
                      {unreadNotifsCount > 0 ? (
                        <span className="w-5 h-5 rounded-full bg-red-600 text-[10px] text-white flex items-center justify-center font-bold font-mono">
                          {unreadNotifsCount}
                        </span>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                      )}
                    </div>

                    {/* Governance System Access */}
                    <button
                      onClick={() => { setActiveRoute('admin'); setHeroDropdownOpen(false); }}
                      className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/20 text-[10px] uppercase tracking-widest font-extrabold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer animate-pulse"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Governance Control</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Announcements dropdown card fallback when toggled via bulletin inside drop-down */}
              {notificationsOpen && (
                <div className="absolute right-4 mt-16 w-80 bg-[#121622] border border-[#22293c] rounded-xl shadow-2xl p-4 space-y-3.5 z-40">
                  <div className="flex justify-between items-center pb-2.5 border-b border-[#21293c]">
                    <span className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-amber-500" /> Message Bulletin
                    </span>
                    <div className="flex space-x-2 text-[10px] font-semibold text-gray-400">
                      <button onClick={markAllAppNotificationsAsRead} className="hover:text-amber-400 cursor-pointer">Read All</button>
                      <span>•</span>
                      <button onClick={clearAllAppNotifications} className="hover:text-red-400 cursor-pointer">Clear</button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-gray-500">No active bulletins dispatch details.</p>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                          }}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer hover:bg-[#1a2135] transition-all ${
                            n.read 
                              ? 'bg-[#0f121b]/40 border-[#1c2230] text-gray-400' 
                              : 'bg-[#182033] border-blue-500/20 text-white font-medium'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-[11px] truncate">{n.title}</span>
                            <span className="text-[9px] text-gray-500 font-mono">{n.timestamp}</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-gray-400">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

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
              onClick={() => { setActiveRoute('dashboard'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'dashboard' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              Investor Dashboard
            </button>
            <button
              onClick={() => { setActiveRoute('market'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'market' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              Stock Market
            </button>
            <button
              onClick={() => { setActiveRoute('tournament'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded ${
                activeRoute === 'tournament' ? 'bg-[#141924] text-white' : 'text-[#878e9f]'
              }`}
            >
              Tournament Center
            </button>
            <button
              onClick={() => { setActiveRoute('admin'); setMobileMenuOpen(false); }}
              className={`py-2 text-xs uppercase tracking-widest font-black text-left pl-3 rounded text-red-400 ${
                activeRoute === 'admin' ? 'bg-red-950/20' : 'text-red-400'
              }`}
            >
              Governance Control Panel
            </button>
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

            {/* Authenticated secured portfolio drawer/panel embedded below */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
              {currentUser ? (
                <div className="bg-[#10131c]/30 rounded-2xl border border-white/5 p-1.5 shadow-2xl">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between select-none">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase font-mono block">SECURE RECONCILIATION DECK</span>
                      <h4 className="text-base font-bold text-white font-display">Escrow Portfolio Ledger</h4>
                    </div>
                    <span className="p-1 px-3.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold font-mono rounded-lg uppercase tracking-wider">
                      Ledger ID: FIFA-U-{currentUser.displayName.toUpperCase().slice(0,6)}
                    </span>
                  </div>
                  <UserDashboard
                    currentUser={currentUser}
                    onLogOut={() => setCurrentUser(null)}
                    holdings={holdings}
                    transactions={transactions}
                    activities={activities}
                    userCash={userCash}
                    countries={countries}
                    fixtures={fixtures}
                  />
                </div>
              ) : (
                <div className="bg-[#10131c]/40 border border-[#202737] rounded-xl p-6 text-center max-w-xl mx-auto space-y-4">
                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Secure Personal Ledger Access</h4>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                      Connect your account to claim your complimentary $1,000 trading cash balance, trace asset histories, log transactions, and manage matches.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="px-6 py-2.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold text-xs rounded-lg hover:from-white hover:to-[#fbbf24] transition-all transform active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      Authenticate Now
                    </button>
                  </div>
                </div>
              )}
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
              onBuyShares={(c) => setSelectedCountryBuy(c)}
              presetActiveTab={selectedMarketTab}
              onTabChange={setSelectedMarketTab}
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
              onTriggerSimulation={handleSimulateFullTournamentMatch}
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
            />
          </div>
        )}

      </main>

      {/* Checkout wizard selection modal portal */}
      {selectedCountryBuy && (
        <PurchaseModal
          country={selectedCountryBuy}
          onClose={() => setSelectedCountryBuy(null)}
          onCompletePurchase={handleCompletePurchase}
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
              <h3 className="text-base font-black text-white font-display uppercase tracking-wider">SECURE TRADING AUTHENTICATION</h3>
              <p className="text-xs text-gray-400 mt-1.5">
                {pendingBuyCountry 
                  ? `Please register or login to acquire shares of ${pendingBuyCountry.name}.`
                  : "Authenticate to unlock your $1,000 personal trader ledger node."}
              </p>
            </div>

            <AuthSection 
              onAuthSuccess={(user) => {
                setCurrentUser(user);
                setAuthModalOpen(false);
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
                Official stock-derivative marketplace for international World Cup allocations. Authorized under Sandbox Escrow Protocol.
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

            {/* Column 4: Cryptographic Governance */}
            <div className="space-y-3.5">
              <span className="font-black text-white text-xs uppercase tracking-wider block">System Trust Hub</span>
              <p className="text-[11px] leading-relaxed text-[#4e5666]">
                All matches settle dynamically on isolated block nodes. Instant payout escrow and high accuracy logs.
              </p>
              <button 
                onClick={() => setActiveRoute('admin')}
                className="w-full text-center py-2 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 text-[10px] font-bold uppercase rounded transition-colors block cursor-pointer"
              >
                Governance Auditor Control
              </button>
            </div>

          </div>

          <div className="pt-8 text-center space-y-4">
            <div className="flex justify-center space-x-6 items-center flex-wrap text-[#8b98b0] text-[10px]">
              <span className="font-black text-[#d4af37]">FIFA STOCKS EXCHANGE v2.4</span>
              <span>•</span>
              <span>Escrow Insured Sandbox</span>
              <span>•</span>
              <span>2FA Secured Ledger Node</span>
            </div>
            
            <p className="max-w-3xl mx-auto leading-relaxed text-[10px] text-[#4f5664]">
              Regulatory Disclosure & Escrow: This platform represents a real-time smart contract clearing ledger. All asset transactions, share allocations, and direct capital positions are logged under active network conditions. FIFA logos and associations are properties of their respective owners, used for official index mapping.
            </p>

            <div className="text-[10px] text-gray-700">
              © 2026 FIFA World Cup Stock Shares Platform. All share allocations are active and audited under international guidelines.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
