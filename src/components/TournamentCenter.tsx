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
}

export default function TournamentCenter({ 
  fixtures = [], 
  countries = [],
  initialTab = 'overview'
}: TournamentCenterProps) {
  
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'standings'>(() => {
    if (initialTab === 'fixtures') return 'fixtures';
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
      setActiveTab('fixtures');
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
              {activeTab === 'overview' ? 'Tournament Roadmap & Overview' : activeTab === 'fixtures' ? 'Smarter Prediction & Research Center' : 'Group Standings & Valuations'}
            </h2>
            <p className="text-sm text-gray-300 max-w-3xl leading-relaxed font-medium">
              Formulate your prediction strategy, analyze competing countries, and track structural progression as squads advance toward the final. Real-time value changes reflect market sentiment and performance index mapping.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#212739] gap-1 overflow-x-auto pb-px">
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
