import React, { useState } from 'react';
import { ShareHolding, TransactionRecord, MarketActivity, CountryShare, MatchFixture } from '../types';
import { ArrowUpRight, TrendingUp, Wallet, Trophy, ShieldCheck, History, Activity, AlertCircle, Terminal } from 'lucide-react';

interface UserDashboardProps {
  currentUser?: { email: string; displayName: string } | null;
  onLogOut?: () => void;
  holdings: ShareHolding[];
  transactions: TransactionRecord[];
  activities: MarketActivity[];
  userCash: number;
  countries: CountryShare[];
  fixtures?: MatchFixture[];
  onDepositFunds?: (amount: number) => Promise<void>;
}

export default function UserDashboard({
  currentUser,
  onLogOut,
  holdings,
  transactions,
  activities,
  userCash,
  countries,
  fixtures = [],
  onDepositFunds
}: UserDashboardProps) {

  // Dynamic Portfolio Calculations
  const calculatePortfolioValue = () => {
    let currentHoldingStockValue = 0;
    holdings.forEach((h) => {
      const latestCountry = countries.find((c) => c.id === h.countryId);
      const currentPrice = latestCountry ? latestCountry.currentPrice : h.averagePurchasePrice;
      if (h.status === 'Active') {
        currentHoldingStockValue += h.sharesQuantity * currentPrice;
      }
    });
    return currentHoldingStockValue + userCash;
  };

  const totalHoldingStockValueOnly = () => {
    let currentHoldingStockValue = 0;
    holdings.filter(h => h.status === 'Active').forEach((h) => {
      const latestCountry = countries.find((c) => c.id === h.countryId);
      const currentPrice = latestCountry ? latestCountry.currentPrice : h.averagePurchasePrice;
      currentHoldingStockValue += h.sharesQuantity * currentPrice;
    });
    return currentHoldingStockValue;
  };

  const totalSharesOwned = holdings.reduce((sum, h) => h.status === 'Active' ? sum + h.sharesQuantity : sum, 0);
  const distinctCountriesCount = holdings.filter(h => h.status === 'Active').length;
  
  const totalPotentialWinningSettleValue = holdings.reduce((sum, h) => {
    if (h.status === 'Active') {
      return sum + (h.sharesQuantity * h.winningSettlementPrice);
    }
    return sum;
  }, 0);

  return (
    <div className="bg-[#0b0e14] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner/Header and Account details */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#11141e] p-6 rounded-2xl border border-[#1f2536] shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/35 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-widest font-mono">SECURE SERVICE • ACTIVE PORTAL</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">Welcome, {currentUser?.displayName || 'Investor'}</h2>
              <p className="text-xs text-gray-400 mt-1">{currentUser?.email || 'authenticated.portfolio.user'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            {onLogOut && (
              <button
                onClick={onLogOut}
                className="px-5 py-3 bg-[#1e141a]/95 hover:bg-[#2b101d] text-red-400 border border-red-950/60 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer hover:border-red-500/40"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Bento statistics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-[#10131c] p-5 rounded-xl border border-[#202737] shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs uppercase font-bold tracking-widest text-[#8a91a1]">Gross Portfolio Value</span>
              <TrendingUp className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="text-3xl font-black font-mono text-white tracking-tight">
              ${calculatePortfolioValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-semibold">
              Calculated on holdings value (${totalHoldingStockValueOnly().toFixed(2)}) + cash balance
            </p>
          </div>

          <div className="bg-[#10131c] p-5 rounded-xl border border-[#202737] shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs uppercase font-bold tracking-widest text-[#8a91a1]">Active Shares Owned</span>
              <Wallet className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white tracking-tight">
              {totalSharesOwned.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-semibold">
              Held across <span className="text-blue-400 font-bold">{distinctCountriesCount}</span> countries
            </p>
          </div>

          <div className="bg-[#10131c] p-5 rounded-xl border border-[#202737] shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs uppercase font-bold tracking-widest text-[#8a91a1]">Potential Settlement Value</span>
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
              ${totalPotentialWinningSettleValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-semibold">
              Gross payout settled automatically if your teams win the tournament
            </p>
          </div>

          <div className="bg-[#10131c] p-5 rounded-xl border border-[#202737] shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#8a91a1]">Available Cash</span>
                <Wallet className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                ${userCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Fully secured escrow wallet</span>
              </p>
            </div>
            
            {onDepositFunds && (
              <div className="mt-4">
                <button
                  onClick={async () => {
                    const amtStr = prompt("Enter amount of USD to deposit into your secure ledger balance ($5 to $10,000):", "1000");
                    if (!amtStr) return;
                    const amt = parseFloat(amtStr);
                    if (isNaN(amt) || amt < 5 || amt > 10000) {
                      alert("Please enter a valid deposit amount between $5 and $10,000.");
                      return;
                    }
                    try {
                      await onDepositFunds(amt);
                    } catch (err) {
                      alert("Failed to deposit funds. Please try again.");
                    }
                  }}
                  className="w-full py-2 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg hover:from-white hover:to-[#fbbf24] transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>Buy Shares</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Holdings Tables & Activity logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* My Holdings lists - Left (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#10131c] rounded-xl border border-[#202737] overflow-hidden shadow-lg">
              
              <div className="px-6 py-4 border-b border-[#202737] flex justify-between items-center bg-[#141824]/40">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="font-extrabold text-white text-sm font-display uppercase tracking-wider">My Active Equity Holdings</h3>
                </div>
                <span className="text-[10px] text-gray-500 font-mono font-bold">REAL-TIME PRICES</span>
              </div>

              {holdings.length === 0 ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-gray-600 mb-1" />
                  <p className="font-medium">You do not own any World Cup team stock shares yet.</p>
                  <p className="text-xs text-gray-600 max-w-sm">Browse the country share listings and purchase equities. Your active holdings will update instantly.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-[#151a26]/75 border-b border-[#202737] text-[#8e97a8] uppercase font-mono tracking-wider text-[10px] font-bold">
                        <th className="py-4 px-5">Country Info</th>
                        <th className="py-4 px-5 text-right">Shares owned</th>
                        <th className="py-4 px-5 text-right">Avg vs Market Price</th>
                        <th className="py-4 px-4 text-right">Capital Allocated</th>
                        <th className="py-4 px-4 text-right">Current Valuation</th>
                        <th className="py-4 px-5 text-right">Winning Payout (100%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b2232] text-white">
                      {holdings.map((h) => {
                        const countryLatest = countries.find(c => c.id === h.countryId);
                        const currPrice = countryLatest ? countryLatest.currentPrice : h.averagePurchasePrice;
                        const ranking = countryLatest ? countryLatest.ranking : '-';
                        const status = countryLatest ? countryLatest.status : 'ACTIVE';
                        const currentVal = h.sharesQuantity * currPrice;
                        
                        return (
                          <tr key={h.id} className="hover:bg-[#161a25]/50 transition-colors font-mono">
                            <td className="py-4 px-5 font-sans font-bold flex flex-col space-y-1.5">
                              <div className="flex items-center space-x-2">
                                <span className="text-base">{h.flag}</span>
                                <span className="text-white font-semibold text-xs">{h.countryName}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase tracking-widest ${
                                  status === 'CHAMPION'
                                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                                    : status === 'ELIMINATED'
                                    ? 'bg-red-500/10 text-red-300 border-red-500/15'
                                    : 'bg-green-500/15 text-green-400 border-green-500/15'
                                }`}>
                                  {status}
                                </span>
                                <span className="text-[8px] font-mono text-gray-400 bg-[#161a25]/90 px-1 border border-[#232b3d] rounded">
                                  Rank #{ranking}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right font-bold text-white">
                              {h.sharesQuantity.toFixed(4)}
                            </td>
                            <td className="py-4 px-5 text-right text-gray-400">
                              <div className="text-[11px] text-gray-400 font-mono">Avg: ${h.averagePurchasePrice.toFixed(2)}</div>
                              <div className="text-[11px] text-[#d4af37] font-mono font-bold mt-0.5">Market: ${currPrice.toFixed(2)}</div>
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-gray-400">
                              ${h.amountInvested.toFixed(2)}
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-emerald-400">
                              ${currentVal.toFixed(2)}
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="text-amber-500 font-bold">${h.winningSettlementPrice.toFixed(2)}</div>
                              <div className="text-[9px] text-[#8e97a8] mt-0.5">Payout: ${(h.sharesQuantity * h.winningSettlementPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

            {/* Holdings Match Tracker section */}
            {holdings.length > 0 && (
              <div className="bg-[#10131c] rounded-xl border border-[#202737] overflow-hidden shadow-lg mt-5">
                <div className="px-6 py-4 border-b border-[#202737] bg-[#141824]/40 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-extrabold text-white text-sm font-display uppercase tracking-wider">Tournament Match Progress (Owned Countries)</h3>
                  </div>
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/10 px-2 py-0.5 rounded font-mono font-bold">LIVE PROGRESS SECURED</span>
                </div>
                <div className="p-5">
                  {(() => {
                    const myCountryIds = holdings.map(h => h.countryId);
                    const myMatches = fixtures.filter(f => myCountryIds.includes(f.homeTeamId) || myCountryIds.includes(f.awayTeamId));
                    if (myMatches.length === 0) {
                      return (
                        <p className="text-xs text-center text-gray-500 py-3 font-medium">No upcoming or live matches scheduled for your owned countries at this moment.</p>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myMatches.slice(0, 6).map((match) => {
                          const homeCountry = countries.find(c => c.id === match.homeTeamId);
                          const awayCountry = countries.find(c => c.id === match.awayTeamId);
                          return (
                            <div key={match.id} className="p-3 bg-[#151a26]/60 border border-[#232b3d] rounded-lg flex flex-col justify-between space-y-2">
                              <div className="flex justify-between items-center text-[10px] text-gray-500">
                                <span>{match.stage} ⏤ {match.date}</span>
                                <span className={`font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                                  match.status === 'Live'
                                    ? 'bg-red-500/15 text-red-400 animate-pulse'
                                    : match.status === 'Finished'
                                    ? 'bg-gray-500/10 text-gray-400'
                                    : 'bg-indigo-500/10 text-indigo-400'
                                }`}>
                                  {match.status}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <div className="flex items-center space-x-2 w-[40%] overflow-hidden">
                                  <span className="text-lg shrink-0">{homeCountry?.flag || '🏳️'}</span>
                                  <span className="text-xs font-semibold text-white truncate">{homeCountry?.name || (match.homeTeamId === 'TBD' ? 'To Be Decided' : match.homeTeamId)}</span>
                                </div>
                                <div className="flex justify-center items-center w-[20%] font-mono text-[10px] bg-[#1a2133] px-2 py-1 rounded font-bold border border-[#2d374d]">
                                  {match.status !== 'Scheduled' ? (
                                    <span className="text-white">
                                      {match.homeScore} - {match.awayScore}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">VS</span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 w-[40%] justify-end text-right overflow-hidden">
                                  <span className="text-xs font-semibold text-white truncate">{awayCountry?.name || (match.awayTeamId === 'TBD' ? 'To Be Decided' : match.awayTeamId)}</span>
                                  <span className="text-lg shrink-0">{awayCountry?.flag || '🏳️'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}


            {/* Transactions records */}
            <div className="bg-[#10131c] rounded-xl border border-[#202737] overflow-hidden shadow-lg mt-5">
              
              <div className="px-6 py-4 border-b border-[#202737] bg-[#141824]/40 flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-400" />
                <h3 className="font-extrabold text-white text-sm font-display uppercase tracking-wider">Transaction History Audits</h3>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No active transaction logs found in your session.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#151a26]/75 border-b border-[#202737] text-[#8e97a8] uppercase font-mono tracking-wider text-[10px] font-bold">
                        <th className="py-3 px-5">Timestamp</th>
                        <th className="py-3 px-5">Target Asset</th>
                        <th className="py-3 px-5 text-right">Funds</th>
                        <th className="py-3 px-5 text-right">Shares Received</th>
                        <th className="py-3 px-5 text-right">Share Price</th>
                        <th className="py-3 px-5">Gateway</th>
                        <th className="py-3 px-5">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b2232] text-gray-300 font-mono text-[11px]">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#161a25]/30 transition-colors">
                          <td className="py-3.5 px-5 text-gray-500">{tx.date}</td>
                          <td className="py-3.5 px-5 font-sans font-semibold text-white flex items-center space-x-1.5">
                            <span>{tx.flag}</span>
                            <span>{tx.countryName}</span>
                          </td>
                          <td className="py-3.5 px-5 text-right font-bold text-white">${tx.amountInvested.toFixed(2)}</td>
                          <td className="py-3.5 px-5 text-right font-bold text-slate-200">{tx.sharesQuantity.toFixed(4)}</td>
                          <td className="py-3.5 px-5 text-right text-gray-400">${tx.pricePerShare.toFixed(2)}</td>
                          <td className="py-3.5 px-5">
                            <span className="px-2 py-0.5 bg-[#171d2c] border border-[#242e43] rounded text-white text-[9px] font-mono leading-none font-bold uppercase">
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold uppercase text-[10px]">
                              ● Completed
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

          {/* Dynamic Feed list - Right (1 Column) */}
          <div className="space-y-6">
            
            <div className="bg-[#10131c] rounded-xl border border-[#202737] p-5 shadow-lg">
              <div className="flex items-center space-x-2 pb-4 border-b border-[#212737] mb-4">
                <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                <h3 className="font-extrabold text-white text-sm font-display uppercase tracking-wider">Live Activity Stream</h3>
              </div>

              {/* Live activity items rendering */}
              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                {activities.map((act) => (
                  <div 
                    key={act.id} 
                    className="p-3 rounded-lg bg-[#151a26]/60 border border-[#21293c] text-xs flex items-center justify-between hover:border-[#d4af37]/35 transition-all"
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className="p-1 px-1.5 bg-[#1d2436] rounded border border-[#2b354e] text-amber-400 text-[9px] font-mono font-bold uppercase leading-none self-center">
                        BUY
                      </div>
                      <div>
                        <p className="text-gray-300 font-semibold">
                          <span className="text-gray-400 font-bold font-mono">{act.userName}</span> ⏤ Owned <span className="text-white font-bold">{act.flag} {act.countryName}</span> shares.
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{act.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold font-mono text-xs">+${act.amountInvested.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3.5 bg-neutral-900/60 border border-[#21293c] text-[10px] text-gray-500 leading-relaxed rounded-lg flex items-start space-x-2">
                <Terminal className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Investor activity generated in real time as market index alters.</span>
              </div>
            </div>

            {/* Educational / Security Trust Panel */}
            <div className="bg-gradient-to-br from-[#10131c] to-[#121b2d] rounded-xl border border-[#202a3f] p-5 shadow-lg text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <h4 className="font-bold text-white text-sm font-display">Secured Clearing System</h4>
              <p className="text-xs text-gray-400 leading-relaxed px-1">
                Your investment and transactions are fully protected. 
                All transaction paths are audited in compliance with World Escrow and tournament rules.
              </p>
              <div className="text-[10px] uppercase font-mono tracking-wider font-bold bg-[#141822] py-2 rounded text-blue-400 border border-[#242b3c]">
                SECURE SHARES COMPLIANCE
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
