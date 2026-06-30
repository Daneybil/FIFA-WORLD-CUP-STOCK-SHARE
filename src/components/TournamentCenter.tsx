import React, { useState, useEffect } from 'react';
import { MatchFixture, CountryShare, ShareHolding } from '../types';
import { 
  Trophy, 
  Sparkles, 
  Globe, 
  TrendingUp, 
  Calendar, 
  Activity, 
  CheckCircle, 
  Compass,
  BookOpen,
  Star,
  ArrowUpRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface TournamentCenterProps {
  fixtures: MatchFixture[];
  countries: CountryShare[];
  holdings?: ShareHolding[];
  initialTab?: 'fixtures' | 'groups' | 'overview';
  lastSyncTime?: string | null;
  lastResponseTime?: number | null;
  numTeamsLoaded?: number;
  numFixturesLoaded?: number;
  numStandingsLoaded?: number;
  apiSuccessCount?: number;
  apiFailedCount?: number;
  apiLoading?: boolean;
  apiError?: string | null;
  onManualTriggerSync?: () => void;
  rawTeamsData?: any;
  rawStandingsData?: any;
  rawMatchesData?: any;
}

export default function TournamentCenter({ 
  fixtures = [], 
  countries = [],
  initialTab = 'overview',
  lastSyncTime = null,
  lastResponseTime = null,
  numTeamsLoaded = 0,
  numFixturesLoaded = 0,
  numStandingsLoaded = 0,
  apiSuccessCount = 1,
  apiFailedCount = 0,
  apiLoading = false,
  apiError = null,
  onManualTriggerSync,
  rawTeamsData,
  rawStandingsData,
  rawMatchesData
}: TournamentCenterProps) {
  
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'standings' | 'live'>(() => {
    if (initialTab === 'fixtures') return 'live';
    if (initialTab === 'groups') return 'standings';
    return 'overview';
  });

  // Checklist state for Research Guide
  const [checklist, setChecklist] = useState({
    form: false,
    injuries: false,
    history: false,
    defense: false,
    bracket: false
  });

  // Sync activeTab if initialTab changes
  useEffect(() => {
    if (initialTab === 'fixtures') {
      setActiveTab('live');
    } else if (initialTab === 'groups') {
      setActiveTab('standings');
    } else {
      setActiveTab('overview');
    }
  }, [initialTab]);

  const getCountry = (teamId: string) => {
    return countries.find((c) => c.id === teamId || c.name === teamId) || {
      id: teamId,
      name: teamId,
      flag: '🏳️',
      currentPrice: 0.00
    };
  };

  return (
    <div className="bg-[#0b0e14] min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Header Card - Extremely Classy & Professional */}
        <div className="bg-gradient-to-r from-[#121622] to-[#0f121b] border border-[#1e2332] p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-[#d4af37] px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">
              <Trophy className="w-4 h-4" />
              <span>Official World Cup Portfolio Hub</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight leading-none">
              {activeTab === 'live' ? 'Live Football Centre' : activeTab === 'overview' ? 'Tournament Roadmap & Overview' : activeTab === 'fixtures' ? 'Smarter Prediction & Research Center' : 'Group Standings & Valuations'}
            </h2>
            <p className="text-sm text-gray-300 max-w-3xl leading-relaxed font-medium">
              Formulate your prediction strategy, analyze competing countries, and track structural progression as squads advance toward the final. Real-time value changes reflect market sentiment and performance index mapping.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#212739] gap-1 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-3.5 font-extrabold text-xs tracking-wider uppercase transition-all flex items-center space-x-2.5 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'live'
                ? 'border-[#d4af37] text-white bg-[#141924]/50'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-[#141924]/20'
            }`}
          >
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-bold text-red-400">Live Football Centre</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3.5 font-extrabold text-xs tracking-wider uppercase transition-all flex items-center space-x-2.5 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#d4af37] text-white bg-[#141924]/50'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-[#141924]/20'
            }`}
          >
            <Trophy className="w-4.5 h-4.5 text-amber-500" />
            <span className="font-bold">Overview & Road Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-6 py-3.5 font-extrabold text-xs tracking-wider uppercase transition-all flex items-center space-x-2.5 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'fixtures'
                ? 'border-[#d4af37] text-white bg-[#141924]/50'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-[#141924]/20'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5 text-blue-500" />
            <span className="font-bold">Research & prediction tips</span>
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-6 py-3.5 font-extrabold text-xs tracking-wider uppercase transition-all flex items-center space-x-2.5 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'standings'
                ? 'border-[#d4af37] text-white bg-[#141924]/50'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-[#141924]/20'
            }`}
          >
            <Globe className="w-4.5 h-4.5 text-emerald-500" />
            <span className="font-bold">Group Standings</span>
          </button>
        </div>

        {/* tab 0: Live Football Centre */}
        {activeTab === 'live' && (
          <div className="space-y-8 animate-fadeIn">

            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-3">
                <span>⚠️ Error Syncing with Football-Data.org server: {apiError}</span>
              </div>
            )}

            {/* Live Matches & Scores Widget */}
            <LiveFootballCenterWidget 
              rawMatchesData={rawMatchesData}
              rawStandingsData={rawStandingsData}
              countries={countries}
              apiLoading={apiLoading}
            />

          </div>
        )}

        {/* tab 1: Tournament Overview and Roadmap */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Professional Tournament Overview Block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-[#11141e] border border-[#212739] p-8 rounded-2xl shadow-md space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white font-display uppercase tracking-wider">
                    The FIFA World Cup Tournament
                  </h3>
                  <div className="h-0.5 w-16 bg-gradient-to-r from-[#d4af37] to-transparent mt-2" />
                </div>
                
                <p className="text-sm text-gray-300 leading-relaxed font-bold">
                  The FIFA World Cup stands as the pinnacle of global sporting achievement. Bringing together the most elite national football teams on earth, the tournament commands the attention of billions of spectators. Through our premier financial model, every kick, goal, and defensive triumph translates directly into team equity valuation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-amber-500">
                      <Sparkles className="w-4.5 h-4.5" />
                      <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Tournament Format</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-bold">
                      Divided into highly competitive groups, nations compete in an initial round-robin group phase. Only the top-tier performing squads secure passage to single-elimination knockout brackets, scaling the intensity with every stage.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-blue-500">
                      <TrendingUp className="w-4.5 h-4.5" />
                      <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Progression To The Cup</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-bold">
                      As teams advance through the Round of 32, Round of 16, Quarter-Finals, and Semi-Finals, their survival rate shrinks. Success triggers instant value multiplication, culminating in the Grand World Cup Final.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-[#171c2b] border border-[#24314c] rounded-xl flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 text-left">
                    <h5 className="font-black text-sm text-white uppercase tracking-wide">Predict & Acquire Shares</h5>
                    <p className="text-xs text-gray-400 leading-relaxed font-bold">
                      Leverage your tactical foresight by acquiring dynamic share holdings in your predicted champion nations. If your country wins the cup, your active shares are cleared automatically at up to <span className="text-[#d4af37] font-black">$100.00+</span> each, paid securely directly to your balance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Research and Investment tips on overview */}
              <div className="bg-[#11141e] border border-[#212739] p-8 rounded-2xl shadow-md space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2.5 text-[#d4af37]">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-black text-sm uppercase text-white tracking-wider">Acquisition Standards</h3>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-bold">
                    To make the most informed predictions and maximize capital efficiency, we recommend following robust research criteria:
                  </p>

                  <ul className="space-y-3 pt-2 text-xs text-gray-400 font-bold">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#d4af37] mt-0.5">✦</span>
                      <span>Analyze Group Stage pairings and knockout tree alignments carefully.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#d4af37] mt-0.5">✦</span>
                      <span>Monitor offensive efficiency (Goal Differentials) and defensive record.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#d4af37] mt-0.5">✦</span>
                      <span>Acquire team shares early in the tournament to capture the maximum valuation upside.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-[#1b2131] text-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Primary Valuation Drivers</span>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-[#171c2b] p-3 rounded-xl border border-[#24314c]">
                      <span className="text-[10px] text-amber-500 uppercase font-black block">Win / Draw Ratio</span>
                      <span className="text-xs font-black font-mono text-white mt-1 block">Dynamic Modifier</span>
                    </div>
                    <div className="bg-[#171c2b] p-3 rounded-xl border border-[#24314c]">
                      <span className="text-[10px] text-blue-400 uppercase font-black block">Stage Multipliers</span>
                      <span className="text-xs font-black font-mono text-white mt-1 block">Up to 4.5x</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bracket Progress Matrix */}
            <div className="space-y-4">
              <h3 className="font-black text-white text-lg font-display flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#d4af37]" /> Grand Knockout Road Matrix
              </h3>

              <div className="bg-[#11141e] border border-[#212739] p-8 rounded-2xl shadow-lg relative overflow-x-auto min-w-[700px]">
                <div className="grid grid-cols-3 gap-8 text-center relative">
                  
                  {/* Quarter Finals */}
                  <div className="space-y-5 relative flex flex-col justify-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block font-mono">Quarter-Finalists Structure</span>
                    <div className="space-y-3">
                      {[
                        { id: 'QF-1', home: 'Winner Group A', away: 'Runner-up Group B', date: 'Dec 4' },
                        { id: 'QF-2', home: 'Winner Group C', away: 'Runner-up Group D', date: 'Dec 4' },
                        { id: 'QF-3', home: 'Winner Group E', away: 'Runner-up Group F', date: 'Dec 5' },
                        { id: 'QF-4', home: 'Winner Group G', away: 'Runner-up Group H', date: 'Dec 5' }
                      ].map(f => (
                        <div key={f.id} className="space-y-2.5 bg-[#171c2b] p-4 rounded-xl border border-[#2a3449] max-w-xs w-full mx-auto text-xs text-left">
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mb-1 border-b border-[#212a3d] pb-1.5 font-bold">
                            <span>MATCH ID: {f.id}</span>
                            <span>{f.date}</span>
                          </div>
                          <div className="flex justify-between text-white font-bold">
                            <span className="truncate">{f.home}</span>
                            <span className="text-gray-500 font-mono">—</span>
                          </div>
                          <div className="flex justify-between text-gray-400 font-bold">
                            <span className="truncate">{f.away}</span>
                            <span className="text-gray-500 font-mono">—</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Semi-Finals */}
                  <div className="space-y-5 relative flex flex-col justify-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block font-mono">Semi-Finals Bracket</span>
                    <div className="space-y-4">
                      {[
                        { id: 'SF-1', home: 'Winner QF-1', away: 'Winner QF-2', date: 'Dec 8' },
                        { id: 'SF-2', home: 'Winner QF-3', away: 'Winner QF-4', date: 'Dec 9' }
                      ].map(f => (
                        <div key={f.id} className="space-y-2.5 bg-[#1a233b] p-4 rounded-xl border border-[#d4af37]/30 max-w-xs w-full mx-auto text-xs text-left">
                          <div className="flex justify-between items-center text-[10px] text-amber-500/80 font-mono mb-1 border-b border-[#2a3452] pb-1.5 font-bold">
                            <span>MATCH ID: {f.id}</span>
                            <span>{f.date}</span>
                          </div>
                          <div className="flex justify-between text-white font-bold">
                            <span className="truncate">{f.home}</span>
                            <span className="text-gray-500 font-mono">—</span>
                          </div>
                          <div className="flex justify-between text-gray-300 font-bold">
                            <span className="truncate">{f.away}</span>
                            <span className="text-gray-500 font-mono">—</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GRAND FINAL */}
                  <div className="space-y-5 relative flex flex-col justify-center items-center">
                    <span className="text-xs font-bold text-amber-400 tracking-widest uppercase flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-4 h-4" /> GRAND CUP FINAL
                    </span>
                    
                    <div className="text-center p-6 bg-gradient-to-b from-[#1c2235] to-[#121622] rounded-2xl border border-[#d4af37]/60 max-w-xs w-full shadow-lg">
                      <Trophy className="w-14 h-14 text-[#d4af37] mx-auto animate-bounce mb-4" />
                      <p className="text-sm uppercase font-black text-white tracking-wider">WORLD CUP FINALS</p>
                      <p className="text-[11px] text-gray-500 font-mono font-bold mt-1">December 18 ⏤ MetLife Stadium</p>
                      
                      <div className="my-5 p-3.5 bg-black/40 rounded-xl space-y-2 text-left font-bold border border-white/5">
                        <div className="flex justify-between items-center text-xs text-white">
                          <span className="truncate">Winner SF-1</span>
                          <span className="font-mono text-gray-500">—</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-white">
                          <span className="truncate">Winner SF-2</span>
                          <span className="font-mono text-gray-500">—</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-black rounded-xl text-[10px] font-mono text-[#d4af37] uppercase font-bold tracking-wider leading-relaxed">
                        Winner Payout settlements are cleared dynamically per active rules.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* tab 2: Research & prediction tips (Replacing Match Calendar / results) */}
        {activeTab === 'fixtures' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Guide Introduction */}
            <div className="bg-[#11141e] border border-[#212739] p-8 rounded-2xl shadow-md space-y-4">
              <h3 className="text-2xl font-black text-white font-display uppercase tracking-wider flex items-center gap-2.5">
                <Compass className="w-6 h-6 text-blue-500" /> Research & Strategic prediction Guide
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed font-bold max-w-4xl">
                Successful trading on national team equities requires rigorous analytical checking, rather than random speculation. Use this guide and professional resource matrix to make precise selections of national teams, build a robust share portfolio, and secure optimal yields.
              </p>
            </div>

            {/* Articles and Tips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-[#11141e] border border-[#212739] p-6 rounded-2xl space-y-4 text-left">
                <div className="flex items-center space-x-2.5 text-[#d4af37]">
                  <Star className="w-5 h-5" />
                  <h4 className="font-black text-base text-white uppercase tracking-wider">Tip #1: Analyze Recent Performance Index</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-bold">
                  Before acquiring any country shares, thoroughly check their past performances in international fixtures. Look at current rankings, clean sheet percentages, and squad chemistry. Teams entering the World Cup on a consistent win streak or high goalscoring index represent robust investment safety, despite higher initial share pricing.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase block">Core Checkpoints:</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="bg-[#171c2b] text-gray-300 px-2.5 py-1 rounded text-[10px] font-bold border border-[#24314c]">Team Goal Differentials</span>
                    <span className="bg-[#171c2b] text-gray-300 px-2.5 py-1 rounded text-[10px] font-bold border border-[#24314c]">Defensive Clean Sheet Ratio</span>
                    <span className="bg-[#171c2b] text-gray-300 px-2.5 py-1 rounded text-[10px] font-bold border border-[#24314c]">Squad Depth Evaluation</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#11141e] border border-[#212739] p-6 rounded-2xl space-y-4 text-left">
                <div className="flex items-center space-x-2.5 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                  <h4 className="font-black text-base text-white uppercase tracking-wider">Tip #2: Evaluate Bracket Paths & Matchups</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-bold">
                  Slightly weaker teams with a favorable pathway through the group stage and early knockouts often present significantly higher ROI (Return on Investment) potential. Inspect the structural tournament tree and map out potential opponents before the tournament matches begin. Avoid heavy capital concentrations in teams facing groups of death.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] text-[#d4af37] font-mono font-bold uppercase block">Trading Tactics:</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="bg-[#171c2b] text-gray-300 px-2.5 py-1 rounded text-[10px] font-bold border border-[#24314c]">Bracket Hedges</span>
                    <span className="bg-[#171c2b] text-gray-300 px-2.5 py-1 rounded text-[10px] font-bold border border-[#24314c]">Group Stage Optimization</span>
                    <span className="bg-[#171c2b] text-gray-300 px-2.5 py-1 rounded text-[10px] font-bold border border-[#24314c]">Valuation Arbitrage</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Interactive Strategic Checklist */}
            <div className="bg-gradient-to-r from-[#121622] to-[#11141e] border border-[#212739] p-8 rounded-2xl space-y-6">
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-wider font-display">Investor's Match Analysis Checklist</h4>
                <p className="text-xs text-gray-400 mt-1 font-bold">Complete these analytical exercises before executing buy orders on team shares:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {[
                  { key: 'form', title: 'Evaluate Historic Head-to-Head Records', desc: 'Determine if a team has historical superiority or match struggles against likely rivals.' },
                  { key: 'injuries', title: 'Check Active Squad Medical Updates', desc: 'Confirm key playmakers and starting goalkeeper are healthy and in optimal physical status.' },
                  { key: 'history', title: 'Assess Tactical Adaptability', desc: 'Look at the team\'s performance across different weather conditions and tactical formations.' },
                  { key: 'defense', title: 'Gauge Goal Scarcity / Defensive Form', desc: 'Teams with cohesive defensive backlines yield consistent survival rates in knockout formats.' },
                  { key: 'bracket', title: 'Verify Escrow Balance Alignment', desc: 'Ensure your prediction matches your collateralized cash strategy and budget rules.' }
                ].map((item) => (
                  <label 
                    key={item.key}
                    className="p-4 bg-[#171d2c] border border-[#232b3e] rounded-xl flex items-start gap-3.5 cursor-pointer hover:border-blue-500/40 transition-colors select-none"
                  >
                    <input 
                      type="checkbox" 
                      checked={(checklist as any)[item.key]}
                      onChange={() => setChecklist(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                      className="w-4 h-4 rounded border-gray-700 bg-black text-[#d4af37] focus:ring-[#d4af37] mt-0.5"
                    />
                    <div className="space-y-1">
                      <span className="text-xs font-black text-white uppercase tracking-wide block">{item.title}</span>
                      <span className="text-[11px] text-gray-400 block font-bold leading-normal">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Articles and In-depth analyses */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-white font-display uppercase tracking-wider">Premium Football Valuation Insights</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#11141e] border border-[#212739] p-6 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono text-[#d4af37] font-black uppercase tracking-widest block">VOLUME I</span>
                  <h5 className="font-black text-sm text-white uppercase tracking-wider leading-snug">The Science of World Cup Valuation: Quantifying Football Momentum</h5>
                  <p className="text-xs text-gray-400 leading-relaxed font-bold">
                    Learn how modern football metrics like Expected Goals (xG), Possession Index, and Transition Rates can be used to forecast valuation changes on national team assets.
                  </p>
                </div>
                
                <div className="bg-[#11141e] border border-[#212739] p-6 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono text-blue-400 font-black uppercase tracking-widest block">VOLUME II</span>
                  <h5 className="font-black text-sm text-white uppercase tracking-wider leading-snug">Risk Hedging in Multi-Group Brackets: Building a Diversified Nation Portfolio</h5>
                  <p className="text-xs text-gray-400 leading-relaxed font-bold">
                    Maximize stability by balancing high-priced favorite countries with low-cost sleeper nations. Diversifying your holdings protects capital in case of unexpected cup upsets.
                  </p>
                </div>

                <div className="bg-[#11141e] border border-[#212739] p-6 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-widest block">VOLUME III</span>
                  <h5 className="font-black text-sm text-white uppercase tracking-wider leading-snug">Understanding Dynamic Settlement Clearing Mechanisms</h5>
                  <p className="text-xs text-gray-400 leading-relaxed font-bold">
                    A deep dive into how predicting correct matches converts shares to cash securely. Understand how potential returns scale up with each successful tournament stage completed.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* tab 3: Standings */}
        {activeTab === 'standings' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" /> Group Stage Standings & Team Ranks
              </h3>
              <p className="text-xs text-gray-400 font-bold">
                Official competing nations, grouped and structured with live stock pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((grp) => {
                const grpCountries = countries.filter(c => c.group === grp);
                if (grpCountries.length === 0) return null;
                return (
                  <div key={grp} className="bg-[#11141e] border border-[#212739] rounded-xl overflow-hidden shadow-md">
                    <div className="bg-[#171d2c] px-4 py-3.5 border-b border-[#212739] flex justify-between items-center">
                      <span className="font-black text-xs text-white uppercase tracking-wider font-display">Group {grp}</span>
                      <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">Trading Index</span>
                    </div>
                    
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead>
                        <tr className="border-b border-[#1c2232] text-[10px] font-mono text-gray-500 uppercase tracking-wider bg-black/15 font-bold">
                          <th className="py-3 px-4 font-extrabold">Nation</th>
                          <th className="py-3 px-2 font-extrabold text-center">FIFA Rank</th>
                          <th className="py-3 px-4 font-extrabold text-right">Current Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grpCountries.map((c) => (
                          <tr key={c.id} className="border-b border-[#1c2232]/50 hover:bg-[#141924]/30 transition-all">
                            <td className="py-3.5 px-4 font-black text-white flex items-center space-x-2.5">
                              <span className="text-base shrink-0">{c.flag}</span>
                              <span className="truncate">{c.name}</span>
                            </td>
                            <td className="py-3.5 px-2 text-center font-mono font-bold text-gray-400">#{c.ranking || '—'}</td>
                            <td className="py-3.5 px-4 text-right font-mono font-black text-[#d4af37]">${c.currentPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Define interface for widget
interface LiveFootballCenterWidgetProps {
  rawMatchesData: any;
  rawStandingsData: any;
  countries: CountryShare[];
  apiLoading: boolean;
}

export function LiveFootballCenterWidget({
  rawMatchesData,
  rawStandingsData,
  countries,
  apiLoading
}: LiveFootballCenterWidgetProps) {
  const [matchFilter, setMatchFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');

  const matches = rawMatchesData?.matches || [];
  
  // Safe helper to get a flag emoji fallback
  const getFlagFallback = (tla: string) => {
    const map: Record<string, string> = {
      SEN: '🇸🇳', NED: '🇳🇱', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', IRN: '🇮🇷', USA: '🇺🇸', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      ARG: '🇦🇷', KSA: '🇸🇦', MEX: '🇲🇽', POL: '🇵🇱', FRA: '🇫🇷', AUS: '🇦🇺',
      DEN: '🇩🇰', TUN: '🇹🇳', ESP: '🇪🇸', CRC: '🇨🇷', GER: '🇩🇪', JPN: '🇯🇵',
      BEL: '🇧🇪', CAN: '🇨🇦', MAR: '🇲🇦', CRO: '🇭🇷', BRA: '🇧🇷', SRB: '🇷🇸',
      SUI: '🇨🇭', CMR: '🇨🇲', POR: '🇵🇹', GHA: '🇬🇭', URU: '🇺🇾', KOR: '🇰🇷'
    };
    return map[tla?.toUpperCase()] || '🏳️';
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'LIVE':
      case 'IN_PLAY':
        return 'LIVE';
      case 'PAUSED':
        return 'HALF-TIME';
      case 'FINISHED':
        return 'FINISHED';
      case 'SCHEDULED':
      case 'TIMED':
        return 'SCHEDULED';
      default:
        return status || 'SCHEDULED';
    }
  };

  const filteredMatches = matches.filter((m: any) => {
    const status = m.status?.toUpperCase();
    if (matchFilter === 'live') {
      return status === 'LIVE' || status === 'IN_PLAY' || status === 'PAUSED';
    }
    if (matchFilter === 'upcoming') {
      return status === 'SCHEDULED' || status === 'TIMED';
    }
    if (matchFilter === 'finished') {
      return status === 'FINISHED' || status === 'AWARDED';
    }
    return true; // 'all'
  });

  // Calculate some metadata statistics
  const liveCount = matches.filter((m: any) => ['LIVE', 'IN_PLAY', 'PAUSED'].includes(m.status?.toUpperCase())).length;
  const upcomingCount = matches.filter((m: any) => ['SCHEDULED', 'TIMED'].includes(m.status?.toUpperCase())).length;
  const finishedCount = matches.filter((m: any) => ['FINISHED', 'AWARDED'].includes(m.status?.toUpperCase())).length;

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Standings resolver
  const standings = rawStandingsData?.standings || [];

  return (
    <div className="space-y-8">

      {/* Filter and Overview tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 bg-[#121622] p-1.5 rounded-xl border border-[#232b3e]">
          {[
            { key: 'all', label: `All Matches (${matches.length})` },
            { key: 'live', label: `Live Score (${liveCount})`, isLive: true },
            { key: 'upcoming', label: `Upcoming (${upcomingCount})` },
            { key: 'finished', label: `Completed Results (${finishedCount})` }
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setMatchFilter(btn.key as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
                matchFilter === btn.key
                  ? 'bg-[#1e2538] text-white border border-[#303c5a]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a2135]/50 border border-transparent'
              }`}
            >
              {btn.isLive && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
              )}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-gray-400 font-bold block uppercase tracking-widest">Competition Overview</span>
          <span className="text-sm font-black text-white block uppercase tracking-wider mt-0.5">
            {rawMatchesData?.competition?.name || "FIFA World Cup"} ⏤ {rawMatchesData?.competition?.area?.name || "International"}
          </span>
        </div>
      </div>

      {/* MATCHES DISPLAY BOARD */}
      {apiLoading && matches.length === 0 ? (
        <div className="bg-[#11141e] border border-[#212739] py-16 text-center rounded-2xl space-y-3.5">
          <div className="inline-block animate-spin text-3xl">⚽</div>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Synchronising Live Football-Data from server...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-[#11141e] border border-[#212739] py-16 text-center rounded-2xl space-y-3">
          <div className="text-4xl">🏟️</div>
          <h4 className="text-sm font-black text-white uppercase tracking-wider">No Matches Found</h4>
          <p className="text-xs text-gray-400 font-bold max-w-md mx-auto leading-relaxed">
            There are no match fixtures matching your selection in the live pool. Try shifting filters or trigger a fresh data sync.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {filteredMatches.map((m: any) => {
            const isLive = ['LIVE', 'IN_PLAY', 'PAUSED'].includes(m.status?.toUpperCase());
            const statusText = getStatusText(m.status);
            
            return (
              <div 
                key={m.id} 
                className={`bg-gradient-to-br from-[#121622] to-[#11141e] border rounded-2xl overflow-hidden shadow-lg transition-all hover:scale-[1.01] hover:shadow-2xl flex flex-col justify-between ${
                  isLive ? 'border-red-500/20 shadow-red-500/5' : 'border-[#1e2332]'
                }`}
              >
                {/* Header of the Match Card */}
                <div className="bg-[#181e30]/60 px-5 py-3 border-b border-[#212739]/80 flex justify-between items-center text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center space-x-1.5">
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-bold text-[10px]">
                      {m.stage ? m.stage.replace('_', ' ') : 'STAGE'}
                    </span>
                    {m.group && (
                      <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {m.group.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1.5">
                    {isLive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    )}
                    <span className={`font-bold px-2 py-0.5 rounded-md ${
                      isLive ? 'bg-red-500/10 text-red-400' : m.status === 'FINISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Score / Teams Body */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-3 items-center">
                    
                    {/* Home Team */}
                    <div className="text-center space-y-2">
                      <div className="h-14 w-14 mx-auto bg-black/30 rounded-full border border-white/5 flex items-center justify-center p-2.5 overflow-hidden">
                        {m.homeTeam?.crest ? (
                          <img 
                            src={m.homeTeam.crest} 
                            alt={m.homeTeam.name} 
                            className="max-h-full max-w-full object-contain" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Replace broken logo with emoji fallback
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent) {
                                const span = document.createElement('span');
                                span.className = 'text-2xl';
                                span.innerText = getFlagFallback(m.homeTeam?.tla || '');
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-2xl">{getFlagFallback(m.homeTeam?.tla || '')}</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-white block uppercase tracking-wide truncate max-w-[120px] mx-auto font-bold">
                          {m.homeTeam?.shortName || m.homeTeam?.name || "Home Team"}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 block font-bold uppercase">{m.homeTeam?.tla || 'TBD'}</span>
                      </div>
                    </div>

                    {/* Score Area */}
                    <div className="text-center">
                      {m.status === 'FINISHED' || isLive ? (
                        <div className="space-y-1">
                          <div className="flex justify-center items-center space-x-3">
                            <span className="text-3xl font-black font-mono text-white tracking-tighter">
                              {m.score?.fullTime?.home ?? 0}
                            </span>
                            <span className="text-gray-500 font-bold">-</span>
                            <span className="text-3xl font-black font-mono text-white tracking-tighter">
                              {m.score?.fullTime?.away ?? 0}
                            </span>
                          </div>
                          {m.score?.halfTime?.home !== null && m.score?.halfTime?.away !== null && (
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-black block">
                              HT: {m.score.halfTime.home} - {m.score.halfTime.away}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 bg-black/15 p-2 rounded-xl border border-white/5">
                          <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest block">
                            {formatTime(m.utcDate)}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wide">
                            {formatDate(m.utcDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="text-center space-y-2">
                      <div className="h-14 w-14 mx-auto bg-black/30 rounded-full border border-white/5 flex items-center justify-center p-2.5 overflow-hidden">
                        {m.awayTeam?.crest ? (
                          <img 
                            src={m.awayTeam.crest} 
                            alt={m.awayTeam.name} 
                            className="max-h-full max-w-full object-contain" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Replace broken logo with emoji fallback
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent) {
                                const span = document.createElement('span');
                                span.className = 'text-2xl';
                                span.innerText = getFlagFallback(m.awayTeam?.tla || '');
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-2xl">{getFlagFallback(m.awayTeam?.tla || '')}</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-white block uppercase tracking-wide truncate max-w-[120px] mx-auto font-bold">
                          {m.awayTeam?.shortName || m.awayTeam?.name || "Away Team"}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 block font-bold uppercase">{m.awayTeam?.tla || 'TBD'}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer of the Match Card with details */}
                <div className="bg-[#111522]/40 px-5 py-3.5 border-t border-[#1e2332]/50 flex justify-between items-center text-[10px] text-gray-400 font-bold font-mono">
                  <span className="truncate max-w-[180px]">🏟️ {m.venue || 'Official Stadium'}</span>
                  <span>
                    {m.referees && m.referees.length > 0 ? `👤 Ref: ${m.referees[0].name}` : `Matchday ${m.matchday || '—'}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPACT GROUP STANDINGS LEAGUE TABLES DISPLAY */}
      <div className="space-y-4 font-sans">
        <div>
          <h4 className="text-lg font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500 animate-pulse" /> Live League Tables & Logos
          </h4>
          <p className="text-xs text-gray-400 font-bold">
            Real-time standings with active goals index, points matrix, and official crest alignments.
          </p>
        </div>

        {standings.length === 0 ? (
          <div className="bg-[#11141e] border border-[#212739] py-10 text-center rounded-2xl">
            <p className="text-xs text-gray-400 font-bold uppercase font-bold">No official league standings cached. Loading fallback matrix...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {standings.filter((s: any) => s.type === 'TOTAL').map((standing: any) => (
              <div key={standing.group} className="bg-[#11141e] border border-[#212739] rounded-xl overflow-hidden shadow-md">
                <div className="bg-[#171d2c] px-4 py-3 border-b border-[#212739] flex justify-between items-center">
                  <span className="font-black text-xs text-white uppercase tracking-wider font-display">
                    Group {standing.group ? standing.group.replace('GROUP_', '') : 'A'}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-black">Official Standings</span>
                </div>

                <table className="w-full text-left text-xs text-gray-300">
                  <thead>
                    <tr className="border-b border-[#1c2232] text-[9px] font-mono text-gray-500 uppercase tracking-wider bg-black/15 font-black">
                      <th className="py-2.5 px-3 font-extrabold text-left">Pos</th>
                      <th className="py-2.5 px-3 font-extrabold text-left">Team</th>
                      <th className="py-2.5 px-2 font-extrabold text-center">P</th>
                      <th className="py-2.5 px-2 font-extrabold text-center">W</th>
                      <th className="py-2.5 px-2 font-extrabold text-center">D</th>
                      <th className="py-2.5 px-2 font-extrabold text-center">L</th>
                      <th className="py-2.5 px-2 font-extrabold text-center">GD</th>
                      <th className="py-2.5 px-3 font-extrabold text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standing.table?.map((row: any) => (
                      <tr key={row.team?.id} className="border-b border-[#1c2232]/50 hover:bg-[#141924]/30 transition-all font-bold">
                        <td className="py-2.5 px-3 text-gray-400 font-mono text-center w-6 text-[11px]">{row.position}</td>
                        <td className="py-2.5 px-3 font-black text-white flex items-center space-x-2">
                          <div className="h-5 w-5 bg-black/20 rounded border border-white/5 flex items-center justify-center p-0.5 shrink-0">
                            {row.team?.crest ? (
                              <img 
                                src={row.team.crest} 
                                alt={row.team.name} 
                                className="max-h-full max-w-full object-contain" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const parent = (e.target as HTMLElement).parentElement;
                                  if (parent) {
                                    const span = document.createElement('span');
                                    span.className = 'text-[10px]';
                                    span.innerText = getFlagFallback(row.team?.tla || '');
                                    parent.appendChild(span);
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-[10px]">{getFlagFallback(row.team?.tla || '')}</span>
                            )}
                          </div>
                          <span className="truncate max-w-[100px]">{row.team?.shortName || row.team?.name || row.team?.tla}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-gray-300 font-mono text-[11px]">{row.playedGames}</td>
                        <td className="py-2.5 px-2 text-center text-emerald-400 font-mono text-[11px]">{row.won}</td>
                        <td className="py-2.5 px-2 text-center text-gray-400 font-mono text-[11px]">{row.draw}</td>
                        <td className="py-2.5 px-2 text-center text-red-400 font-mono text-[11px]">{row.lost}</td>
                        <td className="py-2.5 px-2 text-center text-gray-300 font-mono text-[11px]">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-[#d4af37] text-[11px]">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
