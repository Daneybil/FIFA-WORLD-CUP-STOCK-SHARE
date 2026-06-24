import React, { useState } from 'react';
import { CountryShare, MatchFixture, AppNotification } from '../types';
import { Shield, Plus, Edit2, Check, RefreshCw, Send, Trash2, Coins, AlertTriangle, PlayCircle, BarChart3, TrendingUp, X, Database, Sliders, Settings } from 'lucide-react';

interface AdminPanelProps {
  countries: CountryShare[];
  fixtures: MatchFixture[];
  notifications: AppNotification[];
  onUpdatePrices: (countryId: string, newPrice: number, newSettlePrice: number) => void;
  onAddCountry: (newCountry: Omit<CountryShare, 'potentialReturn' | 'trending' | 'change24h' | 'statistics'>) => void;
  onRemoveCountry: (countryId: string) => void;
  onTriggerNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'alert') => void;
  onSettleFullTournamentMatch: (fixtureId: string, homeScore: number, awayScore: number) => void;
  onOverrideCountry?: (countryId: string, updatedFields: Partial<CountryShare>) => void;
  apiLoading?: boolean;
  apiError?: string | null;
  lastSyncTime?: string | null;
  lastResponseTime?: number | null;
  numTeamsLoaded?: number;
  numFixturesLoaded?: number;
  numStandingsLoaded?: number;
  onManualTriggerSync?: () => Promise<void>;
}

export default function AdminPanel({
  countries,
  fixtures,
  notifications,
  onUpdatePrices,
  onAddCountry,
  onRemoveCountry,
  onTriggerNotification,
  onSettleFullTournamentMatch,
  onOverrideCountry,
  apiLoading = false,
  apiError = null,
  lastSyncTime = null,
  lastResponseTime = null,
  numTeamsLoaded = 0,
  numFixturesLoaded = 0,
  numStandingsLoaded = 0,
  onManualTriggerSync
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'countries' | 'news' | 'matches' | 'api'>('countries');

  // New country fields
  const [newCountry, setNewCountry] = useState({
    id: '',
    name: '',
    flag: '',
    rating: 3,
    currentPrice: 1.00,
    winningSettlementPrice: 100.00,
    group: 'A' as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H',
    ranking: 32,
    popularityScore: 70,
    description: '',
  });

  // Edit price states
  const [editCountryId, setEditCountryId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');
  const [editSettleInput, setEditSettleInput] = useState('');

  // News states
  const [newsTitle, setNewsTitle] = useState('');
  const [newsMessage, setNewsMessage] = useState('');
  const [newsType, setNewsType] = useState<'success' | 'info' | 'warning' | 'alert'>('info');

  // API Config & Override States
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('API-Football (v3)');
  const [apiConnectionStatus, setApiConnectionStatus] = useState('SIMULATOR FALLBACK');
  const [isSyncing, setIsSyncing] = useState(false);

  const [overrideCountryId, setOverrideCountryId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('ACTIVE');
  const [overrideWins, setOverrideWins] = useState(0);
  const [overrideDraws, setOverrideDraws] = useState(0);
  const [overrideLosses, setOverrideLosses] = useState(0);
  const [overrideGoalsScored, setOverrideGoalsScored] = useState(0);
  const [overrideGoalsConceded, setOverrideGoalsConceded] = useState(0);
  const [overrideMatchesPlayed, setOverrideMatchesPlayed] = useState(0);
  const [overrideCurrentPrice, setOverrideCurrentPrice] = useState(1.0);
  const [overrideSettlePrice, setOverrideSettlePrice] = useState(100.0);
  const [overrideRanking, setOverrideRanking] = useState(1);
  const [overrideTotalShares, setOverrideTotalShares] = useState(0);

  React.useEffect(() => {
    const selectedC = countries.find(c => c.id === overrideCountryId) || countries[0];
    if (selectedC) {
      if (!overrideCountryId) {
        setOverrideCountryId(selectedC.id);
      }
      setOverrideStatus(selectedC.status || 'ACTIVE');
      setOverrideWins(selectedC.statistics.wins);
      setOverrideDraws(selectedC.statistics.draws);
      setOverrideLosses(selectedC.statistics.losses);
      setOverrideGoalsScored(selectedC.statistics.goalsScored);
      setOverrideGoalsConceded(selectedC.statistics.goalsConceded);
      setOverrideMatchesPlayed(selectedC.statistics.matchesPlayed ?? 0);
      setOverrideCurrentPrice(selectedC.currentPrice);
      setOverrideSettlePrice(selectedC.winningSettlementPrice);
      setOverrideRanking(selectedC.ranking);
      setOverrideTotalShares(selectedC.totalSharesPurchased || 0);
    }
  }, [overrideCountryId, countries]);

  const handleEditPriceSave = (cId: string) => {
    const pr = parseFloat(editPriceInput);
    const setl = parseFloat(editSettleInput);
    if (pr > 0 && setl > 0) {
      onUpdatePrices(cId, pr, setl);
      setEditCountryId(null);
      onTriggerNotification(
        'Market Valuation Calibrated!',
        `Governance adjusted ${cId} pricing indices dynamically to $${pr.toFixed(2)} USD.`,
        'success'
      );
    }
  };

  const handleAddCountrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry.id || !newCountry.name || !newCountry.flag) {
      alert('Please fully specify identifier code, team name, and national emoji flag.');
      return;
    }
    onAddCountry({
      id: newCountry.id.toUpperCase(),
      name: newCountry.name,
      flag: newCountry.flag,
      rating: newCountry.rating,
      currentPrice: newCountry.currentPrice,
      winningSettlementPrice: newCountry.winningSettlementPrice,
      group: newCountry.group,
      ranking: newCountry.ranking,
      popularityScore: newCountry.popularityScore,
      availableShares: 200000,
      description: newCountry.description || `${newCountry.name} is a designated competing nation.`
    });

    onTriggerNotification(
      'New Equity Asset Available!',
      `Regulatory clearance granted: ${newCountry.name} (${newCountry.id}) added for stock transactions.`,
      'success'
    );

    // Reset newCountry form
    setNewCountry({
      id: '',
      name: '',
      flag: '',
      rating: 3,
      currentPrice: 1.00,
      winningSettlementPrice: 100.00,
      group: 'A',
      ranking: 32,
      popularityScore: 70,
      description: '',
    });
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsTitle && newsMessage) {
      onTriggerNotification(newsTitle, newsMessage, newsType);
      setNewsTitle('');
      setNewsMessage('');
      alert('Governance news alert dispatched to client-side notification badges!');
    }
  };

  return (
    <div className="bg-[#0b0e14] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner with secure authority indicators */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-gradient-to-r from-red-950/20 via-neutral-900 to-[#10131c] rounded-xl border border-red-900/30">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#ef4444] font-mono flex items-center gap-1">
                ● ESCROW GOVERNANCE SECURITY NODES ACTIVE
              </span>
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                Federation Administration Console
              </h2>
            </div>
          </div>

          {/* Quick Stats overview */}
          <div className="bg-[#141724] border border-[#21293c] py-2 px-4 rounded-lg flex items-center space-x-4">
            <div className="text-xs font-mono">
              <span className="text-gray-500 block">NATIONS SEED:</span>
              <span className="text-white font-bold">{countries.length} Assets</span>
            </div>
            <div className="w-px h-8 bg-[#21293c]" />
            <div className="text-xs font-mono">
              <span className="text-gray-500 block">FIXTURES:</span>
              <span className="text-white font-bold">{fixtures.length} Nodes</span>
            </div>
          </div>
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap md:flex-nowrap gap-2 border-b border-[#21283d] pb-1.5 bg-[#10131c] p-1.5 rounded-lg border border-[#1d2334] max-w-2xl">
          <button
            onClick={() => setActiveTab('countries')}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
              activeTab === 'countries'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'text-[#878e9f] hover:text-white'
            }`}
          >
            Manage Equity Prices
          </button>
          
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
              activeTab === 'news'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'text-[#878e9f] hover:text-white'
            }`}
          >
            Dispatch News
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'text-[#878e9f] hover:text-white'
            }`}
          >
            Settle Cup
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
              activeTab === 'api'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                : 'text-[#878e9f] hover:text-white'
            }`}
          >
            Football API
          </button>
        </div>

        {/* TAB 1: MANAGE COUNTRIES */}
        {activeTab === 'countries' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* List with inline pricing update: 7 Columns */}
            <div className="lg:col-span-7 bg-[#10131c] rounded-xl border border-[#202737] overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-[#202737] bg-[#141824]/30">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider font-display">
                  Live Price & Settlement Adjustment
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#151a25]/60 border-b border-[#202737] text-gray-500 font-mono tracking-wider font-bold">
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4 text-center">Group</th>
                      <th className="py-3 px-4 text-right">Stock Price</th>
                      <th className="py-3 px-4 text-right">Settlement Price</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2230] text-white">
                    {countries.map((c) => (
                      <tr key={c.id} className="hover:bg-[#161a25]/40 transition-colors font-mono">
                        <td className="py-3 px-4 font-sans font-bold flex items-center space-x-2">
                          <span>{c.flag}</span>
                          <div>
                            <span className="text-white text-xs">{c.name}</span>
                            <span className="block text-[9px] text-gray-500">ID: {c.id} | Rank: #{c.ranking}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-400 font-bold">{c.group}</td>
                        
                        {/* Interactive dynamic inline price inputs */}
                        <td className="py-3 px-4 text-right font-bold">
                          {editCountryId === c.id ? (
                            <input
                              type="number"
                              step="0.1"
                              value={editPriceInput}
                              onChange={(e) => setEditPriceInput(e.target.value)}
                              className="w-20 bg-black border border-red-500 text-right p-1 rounded font-mono text-xs text-[#d4af37]"
                            />
                          ) : (
                            <span className="text-white">${c.currentPrice.toFixed(2)}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-amber-500">
                          {editCountryId === c.id ? (
                            <input
                              type="number"
                              step="1"
                              value={editSettleInput}
                              onChange={(e) => setEditSettleInput(e.target.value)}
                              className="w-20 bg-black border border-red-500 text-right p-1 rounded font-mono text-xs text-amber-400"
                            />
                          ) : (
                            <span>${c.winningSettlementPrice.toFixed(2)}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {editCountryId === c.id ? (
                            <div className="flex items-center justify-center space-x-1.5 animate-pulse">
                              <button
                                onClick={() => handleEditPriceSave(c.id)}
                                className="p-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/30 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditCountryId(null)}
                                className="p-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/30 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => {
                                  setEditCountryId(c.id);
                                  setEditPriceInput(c.currentPrice.toString());
                                  setEditSettleInput(c.winningSettlementPrice.toString());
                                }}
                                className="p-1 rounded hover:bg-[#1a2135] text-gray-400 hover:text-white cursor-pointer"
                                title="Adjust values"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Regulatory warning: Removing country asset ${c.name} cannot be undone. Proceed?`)) {
                                    onRemoveCountry(c.id);
                                  }
                                }}
                                className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 cursor-pointer"
                                title="Decommission nation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Add Custom competing country - 5 Columns */}
            <div className="lg:col-span-5 bg-[#10131c] rounded-xl border border-[#202737] p-6 shadow-xl space-y-4">
              
              <div className="pb-3 border-b border-[#21293c]">
                <h3 className="font-extrabold text-white text-sm font-display uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-red-400" /> Authorized Asset Issuance
                </h3>
                <p className="text-[11px] text-gray-400">Generate a custom competing country node</p>
              </div>

              <form onSubmit={handleAddCountrySubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 font-mono uppercase">ID CODE</label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      placeholder="CAN"
                      value={newCountry.id}
                      onChange={(e) => setNewCountry({ ...newCountry, id: e.target.value })}
                      className="w-full bg-[#151a26] border border-[#252f44] rounded text-white p-2.5 uppercase font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 font-bold mb-1 font-mono uppercase">Country Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Canada"
                      value={newCountry.name}
                      onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                      className="w-full bg-[#151a26] border border-[#252f44] rounded text-white p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 font-mono uppercase">Flag Sticker</label>
                    <input
                      type="text"
                      required
                      placeholder="🇨🇦"
                      value={newCountry.flag}
                      onChange={(e) => setNewCountry({ ...newCountry, flag: e.target.value })}
                      className="w-full bg-[#151a26] border border-[#252f44] rounded text-white p-2.5 text-center text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 font-mono uppercase">Group Match</label>
                    <select
                      value={newCountry.group}
                      onChange={(e) => setNewCountry({ ...newCountry, group: e.target.value as any })}
                      className="w-full bg-[#151a26] border border-[#252f44] rounded text-white p-2.5 font-mono"
                    >
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(g => (
                        <option key={g} value={g}>Group {g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 font-mono uppercase">Valuation Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newCountry.currentPrice}
                      onChange={(e) => setNewCountry({ ...newCountry, currentPrice: parseFloat(e.target.value) || 1 })}
                      className="w-full bg-[#151a26] border border-[#252f44] rounded text-white p-2.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 font-mono uppercase">Target Settle ($)</label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={newCountry.winningSettlementPrice}
                      onChange={(e) => setNewCountry({ ...newCountry, winningSettlementPrice: parseFloat(e.target.value) || 1 })}
                      className="w-full bg-[#151a26] border border-[#252f44] rounded text-white p-2.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 font-mono uppercase">World Ranking</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newCountry.ranking}
                      onChange={(e) => setNewCountry({ ...newCountry, ranking: parseInt(e.target.value) || 32 })}
                      className="w-full bg-[#151a26] border border-[#252f44] rounded text-white p-2.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 font-mono uppercase font-sans">Quality Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      required
                      value={newCountry.rating}
                      onChange={(e) => setNewCountry({ ...newCountry, rating: parseFloat(e.target.value) || 3 })}
                      className="w-full bg-[#151a26] border border-[#252f44] rounded text-white p-2.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1 font-mono uppercase">Editorial Summary</label>
                  <textarea
                    rows={2}
                    placeholder="Enter short description..."
                    value={newCountry.description}
                    onChange={(e) => setNewCountry({ ...newCountry, description: e.target.value })}
                    className="w-full bg-[#151a26] border border-[#252f44] rounded text-white p-2.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase rounded shadow-lg transition-transform cursor-pointer"
                >
                  Authorize Assets Rollout
                </button>

              </form>

            </div>

          </div>
        )}

        {/* TAB 2: NEWS NOTIFICATION BROADCASTS */}
        {activeTab === 'news' && (
          <div className="max-w-2xl bg-[#10131c] rounded-xl border border-[#202737] p-6 shadow-xl space-y-5">
            <div className="pb-3 border-b border-[#21293c]">
              <h3 className="font-extrabold text-white text-sm font-display uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4.5 h-4.5 text-red-400" /> Broadcast Governance Alert
              </h3>
              <p className="text-[11px] text-gray-400">Despatch urgent announcements directly to investors</p>
            </div>

            <form onSubmit={handleNewsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1.5 uppercase font-mono">Alert Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BRAZIL SHARE DEMAND SURGES 24%"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#151a26] border border-[#252f44] rounded text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5 uppercase font-mono">Detailed Alert Despatch</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Insert notice body context..."
                  value={newsMessage}
                  onChange={(e) => setNewsMessage(e.target.value)}
                  className="w-full p-2.5 bg-[#151a26] border border-[#252f44] rounded text-white font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5 uppercase font-mono">Alert Severity Type</label>
                <div className="flex space-x-2">
                  {[
                    { id: 'info', label: '🔵 Info Bulletin', classDef: 'bg-blue-600/10 text-blue-400 border border-blue-500/20' },
                    { id: 'success', label: '🟢 Victory', classDef: 'bg-green-600/10 text-green-400 border border-green-500/20' },
                    { id: 'warning', label: '🟡 Warning Alert', classDef: 'bg-amber-600/10 text-amber-500 border border-amber-500/20' },
                    { id: 'alert', label: '🔴 Escalation Critical', classDef: 'bg-red-600/10 text-red-500 border border-red-500/20' },
                  ].map((typChoice) => (
                    <button
                      key={typChoice.id}
                      type="button"
                      onClick={() => setNewsType(typChoice.id as any)}
                      className={`px-3 py-2 text-[10px] font-mono uppercase font-black rounded-lg transition-all cursor-pointer ${
                        newsType === typChoice.id
                          ? typChoice.classDef + ' ring-2 ring-white/25 scale-105'
                          : 'bg-[#181f2f] text-gray-400 border border-transparent'
                      }`}
                    >
                      {typChoice.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#191924] p-3 text-gray-400 font-mono text-[10px] rounded leading-relaxed">
                Notice will update the dynamic notification alerts box with notification badges in client interface view.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase rounded shadow-lg transition-transform cursor-pointer"
              >
                Broadcasting Bulletin Node
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MATCHES SIMULATION IN GOVERNANCE */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg text-xs leading-relaxed flex items-start space-x-2.5 max-w-3xl">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                <strong>Predictive Engine Notice:</strong> Resolving match results affects structural team statistics (wins, goals) AND alters share price matrices directly. Teams winning match points observe a +24% price surge, while failing nations drop up to -18%.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {fixtures.filter(f => f.status !== 'Finished').map((fixture) => {
                const home = countries.find(c => c.id === fixture.homeTeamId);
                const away = countries.find(c => c.id === fixture.awayTeamId);

                if (!home || !away) return null;

                return (
                  <div
                    key={fixture.id}
                    className="bg-[#10131c] border border-[#212737] p-5 rounded-xl shadow-lg space-y-4 flex flex-col justify-between"
                  >
                    <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-500 border-b border-[#212c40] pb-2">
                      {fixture.stage} ⏤ {fixture.date}
                    </div>

                    <div className="flex justify-between items-center text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">{home.flag}</span>
                        <span className="text-xs font-bold text-white mt-1">{home.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono">${home.currentPrice.toFixed(2)}</span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-600 font-bold">VS</span>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">{away.flag}</span>
                        <span className="text-xs font-bold text-white mt-1">{away.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono">${away.currentPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1a2233]/40 flex space-x-1.5 justify-center">
                      <button
                        onClick={() => onSettleFullTournamentMatch(fixture.id, 2, 1)}
                        className="py-1.5 px-3 bg-red-600/20 text-red-400 border border-red-500/10 rounded text-[10px] font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                      >
                        Settle {home.id} Wins (2-1)
                      </button>
                      <button
                        onClick={() => onSettleFullTournamentMatch(fixture.id, 1, 3)}
                        className="py-1.5 px-3 bg-red-600/20 text-red-400 border border-red-500/10 rounded text-[10px] font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                      >
                        Settle {away.id} Wins (1-3)
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: FOOTBALL API INTEGRATION & CONTROLS */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            
            {/* API Preparation Intro header */}
            <div className="bg-[#11141e] rounded-xl border border-[#212739] p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
                  <Database className="w-5 h-5 text-red-500" /> Football API Connection Hub (API-Ready Architecture)
                </h3>
                <p className="text-xs text-[#8c94a5] mt-1 pr-6 max-w-2xl">
                  Configure live sports providers to feed scores, lineups, player statistics and FIFA team rankings automatically. Overrides the platform's standard predictive models when licensed keys validate successfully.
                </p>
              </div>
              <span className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded border ${
                apiKey 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {apiKey ? 'API CONNECTED (LIVE OVERRIDES)' : 'OFFLINE (PREDICTIVE ENGINE)'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: API parameters & synchronization settings - 5 Columns */}
              <div className="lg:col-span-5 bg-[#10131c] rounded-xl border border-[#202737] p-5 shadow-lg space-y-5">
                <div className="pb-3 border-b border-[#212c40] flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-display">
                    API Provider Settings
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-[#8fa0c0] bg-[#171d2c] px-2 py-0.5 rounded">API CONFIG</span>
                </div>

                <div className="space-y-4">
                  {/* Select provider */}
                  <div className="space-y-1.5 text-xs">
                    <label className="block text-gray-400 font-semibold">Target Sports API Oracle</label>
                    <select
                      value={apiProvider}
                      onChange={(e) => setApiProvider(e.target.value)}
                      className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2.5 focus:outline-none focus:border-red-500 transition-all font-sans text-xs"
                    >
                      <option value="API-Football (v3)">La-Liga & FIFA: API-Football (v3) [Recommended]</option>
                      <option value="Football-Data.org">Football-Data.org (REST API v4)</option>
                      <option value="Odds-API (Sportsbook)">The-Odds-API (Settlement Grounding)</option>
                      <option value="Opta Feed Engine (Enterprise)">Opta Tournament Feed Engine</option>
                    </select>
                  </div>

                  {/* API Key box with eye hide/show */}
                  <div className="space-y-1.5 text-xs">
                    <label className="block text-gray-400 font-semibold">Oracle Developer Key (Secret Tokens)</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Enter key e.g. xxxxxxx_apifootball_token_xxxxx"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          if (e.target.value) {
                            setApiConnectionStatus('ACTIVE - SYNCHRONIZED');
                          } else {
                            setApiConnectionStatus('SIMULATOR FALLBACK');
                          }
                        }}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2.5 pl-3 focus:outline-none focus:border-red-500 transition-all font-mono text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 font-sans leading-normal">
                      Credentials remain protected in the application sandbox. Live sync automatically takes over statistical pools.
                    </p>
                  </div>

                  {/* API connection metrics overview */}
                  <div className="bg-[#171d2b]/65 p-4 rounded-lg border border-[#232b3d]/50 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center pb-1 border-b border-[#212c40]/30 font-sans">
                      <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Real API Diagnostics</span>
                      <span className="text-red-400 font-bold text-[10px]">FOOTBALL-DATA.ORG</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">API Status:</span>
                      <strong className={`font-black uppercase ${!apiError && lastSyncTime ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {!apiError && lastSyncTime ? 'CONNECTED' : (apiError ? 'DISCONNECTED' : 'STANDBY')}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Successful Sync Time:</span>
                      <strong className="text-gray-200">{lastSyncTime || 'Pending First Sync'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last API Response Time:</span>
                      <strong className="text-gray-200">{lastResponseTime !== null ? `${lastResponseTime} ms` : '⏤'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Number of Teams Loaded:</span>
                      <strong className="text-emerald-400 font-bold">{numTeamsLoaded} / 32</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Number of Fixtures Loaded:</span>
                      <strong className="text-[#d4af37] font-bold">{numFixturesLoaded}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Number of Standings Loaded:</span>
                      <strong className="text-blue-400 font-bold">{numStandingsLoaded}</strong>
                    </div>
                    {apiError && (
                      <div className="text-[10px] text-red-400 p-2 bg-red-950/25 border border-red-900/45 rounded font-sans">
                        <strong>API Node Error:</strong> {apiError}
                      </div>
                    )}
                  </div>

                  {/* Trigger Sync button */}
                  <button
                    disabled={apiLoading}
                    onClick={async () => {
                      setIsSyncing(true);
                      try {
                        if (onManualTriggerSync) {
                          await onManualTriggerSync();
                        }
                        alert(`[Football API Node Force Sync] Dynamic data successfully requested and processed. Cache memory populated successfully.`);
                        if (onTriggerNotification) {
                          onTriggerNotification(
                            `Sports API Sync Completed!`,
                            `Successfully contact and parsed team, standing & schedule payloads from Football-Data.org.`,
                            'success'
                          );
                        }
                      } catch (err: any) {
                        alert(`[Football API Sync Failed] Error contact provider: ${err.message}`);
                      } finally {
                        setIsSyncing(false);
                      }
                    }}
                    className={`w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 font-bold uppercase rounded text-xs text-white flex items-center justify-center space-x-1.5 hover:brightness-110 cursor-pointer shadow-lg active:scale-98 transition-all ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <RefreshCw className={`w-4 h-4 ${(isSyncing || apiLoading) ? 'animate-spin' : ''}`} />
                    <span>{(isSyncing || apiLoading) ? 'Synchronizing API Feeds...' : 'Force Manual API Sync'}</span>
                  </button>

                </div>
              </div>

              {/* Right Column: Dynamic Manual Overrides (Manual Status & Stats Management) - 7 Columns */}
              <div className="lg:col-span-7 bg-[#10131c] rounded-xl border border-[#202737] p-5 shadow-lg space-y-5">
                <div className="pb-3 border-b border-[#212c40] flex justify-between items-center font-sans">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-display">
                    Sports Oracle Manual Overrides (Matches & Status Management)
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/15">GOVERNANCE PROTOCOL</span>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  
                  {/* Selected Country inside override tools */}
                  <div className="space-y-1.5">
                    <label className="block text-gray-400 font-semibold">Target Nation to Calibrate</label>
                    <select
                      value={overrideCountryId}
                      onChange={(e) => setOverrideCountryId(e.target.value)}
                      className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2.5 focus:outline-none focus:border-red-500 transition-all font-sans text-xs"
                    >
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.flag} {c.name} ({c.id}) ⏤ [{c.status || 'ACTIVE'}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Overrides parameters fields */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#141822]/60 p-4 rounded-lg border border-[#20273b]">
                    
                    {/* Status dropdown */}
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="block text-gray-500 font-semibold font-sans">Tournament Status</label>
                      <select
                        value={overrideStatus}
                        onChange={(e) => setOverrideStatus(e.target.value)}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-bold focus:outline-none focus:border-red-500 text-xs"
                      >
                        <option value="ACTIVE" className="text-green-400 font-bold">ACTIVE</option>
                        <option value="ELIMINATED" className="text-red-400 font-bold">ELIMINATED</option>
                        <option value="CHAMPION" className="text-amber-400 font-bold">CHAMPION</option>
                      </select>
                    </div>

                    {/* Target ranking Override */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold font-sans">FIFA Ranking</label>
                      <input
                        type="number"
                        min="1"
                        value={overrideRanking}
                        onChange={(e) => setOverrideRanking(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-xs focus:outline-none"
                      />
                    </div>

                    {/* Total shares purchased */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold font-sans">Shares Issued</label>
                      <input
                        type="number"
                        min="0"
                        value={overrideTotalShares}
                        onChange={(e) => setOverrideTotalShares(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-xs focus:outline-none"
                      />
                    </div>

                    {/* Pricing indices */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold font-sans">Share Price (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.10"
                        value={overrideCurrentPrice}
                        onChange={(e) => setOverrideCurrentPrice(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-xs focus:outline-none"
                      />
                    </div>

                    {/* Settle Price index */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold font-sans">Settlement (USD)</label>
                      <input
                        type="number"
                        step="1.0"
                        min="10.00"
                        value={overrideSettlePrice}
                        onChange={(e) => setOverrideSettlePrice(Math.max(10, parseFloat(e.target.value) || 10))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-[#d4af37] font-bold text-xs focus:outline-none"
                      />
                    </div>

                    {/* Matches played */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold font-sans">Matches Played (MP)</label>
                      <input
                        type="number"
                        min="0"
                        value={overrideMatchesPlayed}
                        onChange={(e) => setOverrideMatchesPlayed(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-xs focus:outline-none"
                      />
                    </div>

                    {/* Wins, draws, losses values */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold font-sans">Wins (W)</label>
                      <input
                        type="number"
                        min="0"
                        value={overrideWins}
                        onChange={(e) => setOverrideWins(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold font-sans">Draws (D)</label>
                      <input
                        type="number"
                        min="0"
                        value={overrideDraws}
                        onChange={(e) => setOverrideDraws(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold font-sans">Losses (L)</label>
                      <input
                        type="number"
                        min="0"
                        value={overrideLosses}
                        onChange={(e) => setOverrideLosses(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-xs focus:outline-none"
                      />
                    </div>

                    {/* Goals Scored and concede */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold font-sans">Goals Scored (GF)</label>
                      <input
                        type="number"
                        min="0"
                        value={overrideGoalsScored}
                        onChange={(e) => setOverrideGoalsScored(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <label className="block text-gray-500 font-semibold font-sans">Goals Conceded (GA)</label>
                      <input
                        type="number"
                        min="0"
                        value={overrideGoalsConceded}
                        onChange={(e) => setOverrideGoalsConceded(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#171d2b] border border-[#2e374d] rounded text-white p-2 font-mono text-center text-xs focus:outline-none"
                      />
                    </div>

                  </div>

                  <div className="bg-[#1b2234]/40 p-3 rounded-lg border border-[#26314c]/30 text-[11px] leading-relaxed text-gray-400">
                    <strong>Notice on status progression:</strong> Changing a country's status represents an official results settlement event. Converting a nation from <span className="text-green-400 font-bold">ACTIVE</span> to <span className="text-red-400 font-bold">ELIMINATED</span> freezes the active investor buy path. Upgrading a team to <span className="text-amber-300 font-extrabold pb-0.5 border-b border-amber-300/30">🏆 CHAMPION</span> launches automated payouts clearing at the designated settlement price.
                  </div>

                  {/* Save Overrides button */}
                  <button
                    onClick={() => {
                      if (onOverrideCountry) {
                        onOverrideCountry(overrideCountryId, {
                          status: overrideStatus as 'ACTIVE' | 'ELIMINATED' | 'CHAMPION',
                          currentPrice: overrideCurrentPrice,
                          winningSettlementPrice: overrideSettlePrice,
                          ranking: overrideRanking,
                          totalSharesPurchased: overrideTotalShares,
                          statistics: {
                            wins: overrideWins,
                            draws: overrideDraws,
                            losses: overrideLosses,
                            goalsScored: overrideGoalsScored,
                            goalsConceded: overrideGoalsConceded,
                            matchesPlayed: overrideMatchesPlayed
                          }
                        });

                        onTriggerNotification(
                          'Oracle Override Calibrated!',
                          `Successfully overrided ${overrideCountryId} state variables. All indexes, stats & cards synchronised.`,
                          'success'
                        );
                        alert(`[Federation Governance Authority] Manual override successfully applied for ${overrideCountryId}! Status: ${overrideStatus}, Rank: ${overrideRanking}, MP: ${overrideMatchesPlayed}, W/D/L: ${overrideWins}/${overrideDraws}/${overrideLosses}, Goals: ${overrideGoalsScored}-${overrideGoalsConceded}. Pricing indexed: $${overrideCurrentPrice.toFixed(2)} [Market] / $${overrideSettlePrice.toFixed(2)} [Settlement].`);
                      } else {
                        alert('Error: overrideCountry callback prop not hooked.');
                      }
                    }}
                    className="w-full py-3 bg-[#d4af37] hover:brightness-110 active:scale-98 text-black font-extrabold uppercase font-display rounded-lg text-xs tracking-wider transition-all duration-150 cursor-pointer shadow-lg"
                  >
                    Apply Governance Override Spec
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
