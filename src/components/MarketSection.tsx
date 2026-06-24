import React, { useState } from 'react';
import { CountryShare } from '../types';
import { Search, Sparkles, Star, TrendingUp, Filter, HelpCircle, Calculator, Info } from 'lucide-react';

interface MarketSectionProps {
  countries: CountryShare[];
  onBuyShares: (country: CountryShare) => void;
  presetActiveTab?: 'all' | 'trending' | 'speculative' | 'group' | 'active' | 'eliminated';
  onTabChange?: (tab: 'all' | 'trending' | 'speculative' | 'group' | 'active' | 'eliminated') => void;
}

export default function MarketSection({ countries, onBuyShares, presetActiveTab, onTabChange }: MarketSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalActiveTab, setInternalActiveTab] = useState<'all' | 'trending' | 'speculative' | 'group' | 'active' | 'eliminated'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');

  const activeTab = presetActiveTab !== undefined ? presetActiveTab : internalActiveTab;
  const setActiveTab = (tab: 'all' | 'trending' | 'speculative' | 'group' | 'active' | 'eliminated') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Calculator states
  const [calcCountryId, setCalcCountryId] = useState(countries[0]?.id || 'USA');
  const [calcAmount, setCalcAmount] = useState<number>(100);

  // Filter countries
  const filteredCountries = countries.filter((country) => {
    // Search
    const matchesSearch = 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tabs
    let matchesTab = true;
    if (activeTab === 'trending') {
      matchesTab = country.trending === 'up' || country.popularityScore >= 90;
    } else if (activeTab === 'speculative') {
      matchesTab = country.winningSettlementPrice / country.currentPrice >= 12; // 12x or higher potential return
    } else if (activeTab === 'group') {
      matchesTab = selectedGroup === 'All' ? true : country.group === selectedGroup;
    } else if (activeTab === 'active') {
      matchesTab = country.status === 'ACTIVE' || country.status === 'CHAMPION';
    } else if (activeTab === 'eliminated') {
      matchesTab = country.status === 'ELIMINATED';
    }

    return matchesSearch && matchesTab;
  });

  const selectedCalcCountry = countries.find(c => c.id === calcCountryId) || countries[0];
  const calculatedShares = calcAmount > 0 && selectedCalcCountry 
    ? calcAmount / selectedCalcCountry.currentPrice 
    : 0;
  const potentialWinningValue = calculatedShares * (selectedCalcCountry?.winningSettlementPrice || 0);
  const potentialReturnX = selectedCalcCountry 
    ? (selectedCalcCountry.winningSettlementPrice / selectedCalcCountry.currentPrice).toFixed(1)
    : '0.0';

  const groups = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="bg-[#0b0e14] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Market Introduction Title */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">
                FIFA World Cup Country Equity Market
              </h2>
              <p className="text-sm text-[#8c94a5] mt-1">
                Prices correspond to market demand and team rankings. Hold ownership deeds through to the tournament settlement.
              </p>
            </div>

            {/* Quick Informational Notice */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#171c26] border border-[#2b3547] rounded-lg text-xs text-[#a5adc1] max-w-sm self-center sm:self-start">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Investment settlements are fully backed by secure cryptographic custodial escrow.</span>
            </div>
          </div>
        </div>

        {/* Outer grid partitioning: Market listing Left, Quick Calculator on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Country Catalogue - 8 Columns */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            
            {/* Catalog Filter Controls Header */}
            <div className="bg-[#111520] p-4 rounded-xl border border-[#202737] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              {/* Category Selection Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setActiveTab('all'); setSelectedGroup('All'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-[#d4af37] text-black font-bold'
                      : 'bg-[#181f2f] text-[#97a0b3] hover:text-white'
                  }`}
                >
                  All Nations
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    activeTab === 'trending'
                      ? 'bg-[#d4af37] text-black font-bold'
                      : 'bg-[#181f2f] text-[#97a0b3] hover:text-white'
                  }`}
                >
                  🔥 Trending
                </button>
                <button
                  onClick={() => setActiveTab('speculative')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    activeTab === 'speculative'
                      ? 'bg-[#d4af37] text-black font-bold'
                      : 'bg-[#181f2f] text-[#97a0b3] hover:text-white'
                  }`}
                >
                  🚀 High Return (&gt;10x)
                </button>
                <button
                  onClick={() => setActiveTab('group')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    activeTab === 'group'
                      ? 'bg-[#d4af37] text-black font-bold'
                      : 'bg-[#181f2f] text-[#97a0b3] hover:text-white'
                  }`}
                >
                  🏆 Group Stage
                </button>
                <button
                  onClick={() => { setActiveTab('active'); setSelectedGroup('All'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    activeTab === 'active'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-[#181f2f] text-emerald-400 hover:text-emerald-200'
                  }`}
                >
                  🟢 Active Shares
                </button>
                <button
                  onClick={() => { setActiveTab('eliminated'); setSelectedGroup('All'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    activeTab === 'eliminated'
                      ? 'bg-red-650 text-white font-bold'
                      : 'bg-[#181f2f] text-red-400 hover:text-red-200'
                  }`}
                >
                  🔴 Eliminated Shares
                </button>
              </div>

              {/* Dynamic Search Box */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Insert country name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-60 pl-10 pr-4 py-2 bg-[#171d2c] border border-[#2e374d] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37] transition-all"
                />
              </div>

            </div>

            {/* Stage Group Filter if 'group' selected */}
            {activeTab === 'group' && (
              <div className="bg-[#121724] px-4 py-3 rounded-lg border border-[#21293c] flex items-center gap-3">
                <span className="text-xs text-[#828b9d] font-semibold">Select Group:</span>
                <div className="flex flex-wrap gap-1.5">
                  {groups.map((grp) => (
                    <button
                      key={grp}
                      onClick={() => setSelectedGroup(grp)}
                      className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                        selectedGroup === grp
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#1a2133] text-[#a1abbd] hover:bg-[#232d44]'
                      }`}
                    >
                      {grp === 'All' ? 'All' : `Group ${grp}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Countries Display Grid (Matches screen exactly) */}
            {filteredCountries.length === 0 ? (
              <div className="text-center py-16 bg-[#11141d]/40 rounded-xl border border-[#1f2430]">
                <p className="text-gray-500 font-medium">No national teams meet the current filtering settings.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
                  className="mt-3 text-xs text-[#d4af37] font-semibold hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCountries.map((country) => {
                  const yieldMultiplier = (country.winningSettlementPrice / country.currentPrice);
                  const isUp = country.trending === 'up' || country.change24h > 0;
                  const isDown = country.trending === 'down' || country.change24h < 0;

                  return (
                    <div
                      key={country.id}
                      className="group relative bg-[#131620] hover:bg-[#1a1e2b] border border-[#202534] hover:border-[#d4af37]/40 rounded-xl p-5 transition-all duration-300 shadow-lg flex flex-col justify-between"
                    >
                      {/* Badge / Trending label */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-2xl" role="img" aria-label={country.name}>
                              {country.flag}
                            </span>
                            <div>
                              <span className="font-bold text-base text-white group-hover:text-[#d4af37] transition-colors">{country.name}</span>
                              <div className="text-[10px] font-semibold text-[#808796] flex items-center space-x-1.5 mt-0.5">
                                <span>Ranking #{country.ranking}</span>
                                <span>•</span>
                                <span>Group {country.group}</span>
                              </div>
                            </div>
                          </div>

                          {/* 24h Change percentage badge */}
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            isUp 
                              ? 'bg-green-500/10 text-green-400' 
                              : isDown 
                              ? 'bg-red-500/10 text-red-400' 
                              : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {country.change24h > 0 ? '+' : ''}
                            {country.change24h.toFixed(1)}%
                          </span>
                        </div>

                        {/* Tournament Status & Prep API Stats Row */}
                        <div className="flex items-center justify-between mt-2.5 mb-2 bg-[#171d2b]/60 px-2.5 py-1.5 rounded-lg border border-[#232b3d]/40">
                          <span className={`text-[9px] px-2 py-0.5 font-bold rounded tracking-wider uppercase ${
                            country.status === 'CHAMPION' 
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 font-extrabold animate-pulse'
                              : country.status === 'ELIMINATED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-green-500/15 text-green-400 border border-green-500/20'
                          }`}>
                            {country.status || 'ACTIVE'}
                          </span>
                          
                          <div className="text-[9px] text-[#8fa0c0] font-mono flex items-center gap-2">
                            <span>Played: <strong className="text-white">{country.statistics.matchesPlayed ?? 0}</strong></span>
                            <span>|</span>
                            <span>GF: <strong className="text-white">{country.statistics.goalsScored}</strong></span>
                          </div>
                        </div>

                        {/* Detailed Football-Data API Stats Breakdown */}
                        <div className="grid grid-cols-4 gap-1 text-center bg-[#10141f] p-1.5 rounded-lg border border-[#1f2638] mb-3 text-[9px] font-mono">
                          <div>
                            <span className="block text-gray-500 text-[8px] uppercase">Wins</span>
                            <strong className="text-white">{country.statistics.wins}</strong>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-[8px] uppercase">Draws</span>
                            <strong className="text-white">{country.statistics.draws}</strong>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-[8px] uppercase">Losses</span>
                            <strong className="text-white">{country.statistics.losses}</strong>
                          </div>
                          <div>
                            <span className="block text-gray-400 text-[8px] uppercase">GA</span>
                            <strong className="text-red-400">{country.statistics.goalsConceded}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Quality Rating stars based on rating variable */}
                      <div className="flex items-center space-x-0.5 mb-4 text-[#d4af37]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(country.rating)
                                ? 'fill-current text-[#d4af37]'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] font-mono font-bold text-[#808796] ml-1.5">
                          {country.popularityScore}% popularity
                        </span>
                      </div>

                      {/* Display pricing metrics */}
                      <div className="grid grid-cols-2 gap-2 bg-[#0c1017] p-3 rounded-lg border border-[#1b212c] mb-4">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Current Share price</div>
                          <div className="text-lg font-extrabold font-mono text-white mt-0.5">
                            ${country.currentPrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-amber-500/80 tracking-wider">Settlement Value</div>
                          <div className="text-lg font-extrabold font-mono text-[#d4af37] mt-0.5">
                            ${country.winningSettlementPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Yield info and bottom click action */}
                      <div className="flex items-center justify-between text-xs pt-1 mt-auto">
                        <div>
                          <span className="text-[#848c9b] text-[10px] block">Est Value:</span>
                          <span className="text-emerald-400 font-bold font-mono text-xs">
                            {yieldMultiplier.toFixed(1)}x Return
                          </span>
                        </div>

                        {/* Enable or disable buy button if team is eliminated */}
                        {country.status === 'ELIMINATED' ? (
                          <button
                            disabled
                            className="px-3.5 py-2.5 bg-neutral-800 text-gray-500 font-bold rounded-lg font-display text-[10px] uppercase tracking-wider cursor-not-allowed border border-neutral-700/50"
                          >
                            Eliminated
                          </button>
                        ) : (
                          <button
                            onClick={() => onBuyShares(country)}
                            className="px-4.5 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#f4e8cb] to-[#c5a02e] text-black font-semibold rounded-lg font-display text-[11px] uppercase tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] cursor-pointer"
                          >
                            Buy Shares
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Calculator sidebar Widget - 4 Columns */}
          <div className="lg:col-span-4 bg-[#11141d] p-6 rounded-xl border border-[#202737] shadow-xl sticky top-4">
            
            <div className="flex items-center space-x-2.5 pb-4 border-b border-[#1f2637] mb-5">
              <div className="p-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg border border-[#d4af37]/20">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base font-display">Instant Equity Calculator</h3>
                <p className="text-[11px] text-gray-400">Evaluate return payloads instantly</p>
              </div>
            </div>

            {/* Calculator Input Fields */}
            <div className="space-y-4">
              
              {/* Select country dropdown inside widget */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ba2b0] mb-1.5">
                  Target Nation
                </label>
                <div className="relative">
                  <select
                    value={calcCountryId}
                    onChange={(e) => setCalcCountryId(e.target.value)}
                    className="w-full bg-[#171d2b] border border-[#2e374d] rounded-lg text-xs text-white p-3 focus:outline-none focus:border-[#d4af37]"
                  >
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name} (${c.currentPrice.toFixed(2)} / Share)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Investment cash enter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ba2b0] mb-1.5">
                  Capital Allocation (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter investment amount e.g. 100"
                    value={calcAmount || ''}
                    onChange={(e) => setCalcAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-3 bg-[#171d2b] border border-[#2e374d] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Result output display */}
              {selectedCalcCountry && (
                <div className="bg-[#0b0e14] p-4 rounded-lg border border-[#1b2230] space-y-3.5 mt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a1a8b7]">Current Valuation:</span>
                    <span className="font-semibold text-white font-mono">${selectedCalcCountry.currentPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#1b2230]">
                    <span className="text-[#a1a8b7]">Expected Multiplier:</span>
                    <span className="text-emerald-400 font-bold font-mono">{potentialReturnX}x Yield</span>
                  </div>

                  {/* Calculated share counts */}
                  <div className="bg-[#151a26] p-3 rounded border border-[#232b3d] text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Estimated Shares Recieved</div>
                    <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                      {calculatedShares ? calculatedShares.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 font-semibold">
                      You will receive <span className="text-amber-400 font-bold">{calculatedShares.toFixed(2)}</span> {selectedCalcCountry.name} Shares.
                    </p>
                  </div>

                  {/* Return potential */}
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-[#a1a8b7]">Pre-set settlement price:</span>
                    <span className="font-bold text-white font-mono">${selectedCalcCountry.winningSettlementPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a1a8b7] font-semibold text-amber-400">Potential Winning Payout:</span>
                    <span className="font-extrabold text-emerald-400 font-mono text-base">
                      ${potentialWinningValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                </div>
              )}

              {/* Instant Purchase action with selected card country */}
              <button
                onClick={() => onBuyShares(selectedCalcCountry)}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#f4e8cb] to-[#c5a02e] hover:brightness-110 active:scale-98 text-black font-extrabold font-display rounded-lg text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
              >
                Instantly Allocate
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
