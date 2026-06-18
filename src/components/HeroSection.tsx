import React, { useState, useEffect } from 'react';
import { Users, Coins, TrendingUp, Trophy, Calendar } from 'lucide-react';
import { MarketStat } from '../types';

interface HeroSectionProps {
  stats: MarketStat;
  onNavigateToMarket: () => void;
  onNavigateToTournament?: () => void;
  onSelectTab?: (tab: 'all' | 'trending' | 'speculative' | 'group' | 'active' | 'eliminated') => void;
}

export default function HeroSection({ stats, onNavigateToMarket, onNavigateToTournament, onSelectTab }: HeroSectionProps) {
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
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format currency
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="relative overflow-hidden bg-transparent text-[#eaeaea] font-sans">
      
      {/* Completely clear with no dark overlays covering the trophy and background */}
      <div className="absolute inset-0 bg-transparent pointer-events-none" />

      {/* Main Content Area - Center Aligned strictly matching mockup screenshot */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28 text-center flex flex-col items-center">
        
        {/* World's Best Football Stock Marketplace Badge */}
        <div className="inline-flex items-center space-x-2 bg-[#d4af37]/15 border border-[#d4af37]/40 px-4 py-1.5 rounded-full text-xs font-semibold text-[#d4af37] tracking-wider uppercase font-display mb-6 select-none">
          <Trophy className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>World's Best Football Stock Marketplace</span>
        </div>

        {/* Main Title heading matching screenshot */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.12] tracking-tight text-white select-none max-w-3xl mb-4">
          Own Shares In Your <br/>
          <span className="bg-gradient-to-r from-[#d4af37] via-[#f3e3a1] to-[#c5a02e] text-transparent bg-clip-text">
            Favorite World Cup Team
          </span>
        </h1>

        {/* Subtitle matching screenshot with motivating advertising tone */}
        <div className="text-center select-none mb-10 max-w-2xl px-2">
          <p className="text-base sm:text-lg text-gray-200 font-extrabold leading-relaxed">
            Buy shares in teams to win big if they become champions!
          </p>
          <div className="mt-4.5 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <p className="text-[#fde492] text-sm sm:text-base font-black uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5 animate-pulse">
              ✨ Perfect Opportunity to Become a Millionaire! ✨
            </p>
            <p className="text-[#e2e8f0] text-xs sm:text-sm font-semibold leading-relaxed max-w-xl mx-auto">
              This World Cup match is coming to change lives forever! It is your absolute perfect time and opportunity to become a millionaire. Buy shares now at an ultra-cheaper rate and win bigger when the country you support wins the championship!
            </p>
          </div>
        </div>

        {/* Action Buttons matching screenshot closely */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full select-none">
          <button
            onClick={onNavigateToMarket}
            className="px-10 py-3.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-bold font-display text-xs rounded-lg shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:from-white hover:to-[#fbbf24] transition-all duration-300 transform active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Buy Shares Now
          </button>
          
          <button
            onClick={onNavigateToTournament || onNavigateToMarket}
            className="px-8 py-3.5 bg-[#141822] hover:bg-[#1f2433] border border-[#2e3545] rounded-lg text-white font-medium text-xs transition-all duration-200 text-center cursor-pointer uppercase tracking-wider"
          >
            View Tournament Teams
          </button>
        </div>

        {/* Dynamic sub-menu under buy shares now - made larger, touch-friendly, and added the Trending category */}
        <div className="mt-14 flex flex-col items-center gap-5 bg-[#0e1322]/95 backdrop-blur-md border border-[#212f4c] rounded-3xl p-6 sm:p-8 shadow-2xl select-none w-full max-w-5xl">
          <span className="text-sm sm:text-base font-black text-[#d4af37] uppercase tracking-widest font-sans flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#d4af37] animate-pulse" /> Tournaments & Teams:
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4.5 w-full mt-2">
            <button 
              onClick={onNavigateToTournament} 
              className="bg-[#18233d] hover:bg-[#223154] border border-[#2f4068] text-white hover:text-[#d4af37] font-extrabold text-sm sm:text-base px-6 py-4.5 rounded-2xl shadow-xl transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer hover:border-[#d4af37]/50 hover:scale-[1.04] active:scale-[0.96]"
            >
              🏆 Schedule View
            </button>
            <button 
              onClick={() => { onSelectTab?.('all'); onNavigateToMarket(); }} 
              className="bg-[#18233d] hover:bg-[#223154] border border-[#2f4068] text-white hover:text-[#d4af37] font-extrabold text-sm sm:text-base px-6 py-4.5 rounded-2xl shadow-xl transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer hover:border-[#d4af37]/50 hover:scale-[1.04] active:scale-[0.96]"
            >
              ⚽ All Squads
            </button>
            <button 
              onClick={() => { onSelectTab?.('active'); onNavigateToMarket(); }} 
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 hover:text-emerald-300 font-extrabold text-sm sm:text-base px-6 py-4.5 rounded-2xl shadow-xl transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.04] active:scale-[0.96]"
            >
              🟢 Active
            </button>
            <button 
              onClick={() => { onSelectTab?.('trending'); onNavigateToMarket(); }} 
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-400 hover:text-amber-300 font-extrabold text-sm sm:text-base px-6 py-4.5 rounded-2xl shadow-xl transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.04] active:scale-[0.96]"
            >
              🔥 Trending
            </button>
            <button 
              onClick={() => { onSelectTab?.('eliminated'); onNavigateToMarket(); }} 
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/35 text-red-500 hover:text-red-400 font-extrabold text-sm sm:text-base px-6 py-4.5 rounded-2xl shadow-xl transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.04] active:scale-[0.96]"
            >
              🔴 Eliminated
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
