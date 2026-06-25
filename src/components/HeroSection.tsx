import React, { useState, useEffect } from 'react';
import { Users, Coins, TrendingUp, Trophy, Calendar, Activity, BookOpen, ShieldCheck, UserPlus, FileText, Play, AlertTriangle, Youtube, ExternalLink, Tv } from 'lucide-react';
import { MarketStat } from '../types';

interface HeroSectionProps {
  stats: MarketStat;
  onNavigateToMarket: () => void;
  onNavigateToTournament?: () => void;
  onSelectTab?: (tab: 'all' | 'trending' | 'speculative' | 'group' | 'active' | 'eliminated') => void;
  onNavigateToSection?: (section: 'dashboard' | 'market' | 'live-data' | 'tournament' | 'how-it-works' | 'admin') => void;
  onTriggerCreateAccount?: () => void;
}

export default function HeroSection({ 
  stats, 
  onNavigateToMarket, 
  onNavigateToTournament, 
  onSelectTab,
  onNavigateToSection,
  onTriggerCreateAccount
}: HeroSectionProps) {
  const [videoMode, setVideoMode] = useState<'embed' | 'fallback'>('embed');
  const [playClicked, setPlayClicked] = useState(false);
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
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display leading-[1.08] tracking-tight text-white select-none max-w-4xl mb-6">
          Own Shares In Your <br/>
          <span className="bg-gradient-to-r from-[#d4af37] via-[#f3e3a1] to-[#c5a02e] text-transparent bg-clip-text">
            Favorite World Cup Team
          </span>
        </h1>

        {/* Subtitle matching screenshot with motivating advertising tone */}
        <div className="text-center select-none mb-12 max-w-3xl px-2">
          <p className="text-xl sm:text-2xl text-white font-black leading-relaxed tracking-wide mb-5">
            Buy shares in teams to win big if they become champions!
          </p>
          <div className="mt-5 bg-gradient-to-br from-[#d4af37]/20 via-[#d4af37]/5 to-black border-2 border-[#d4af37] rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(212,175,55,0.15)] relative overflow-hidden backdrop-blur-md">
            <p className="text-yellow-400 text-base sm:text-lg font-black uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
              ✨ Perfect Opportunity to Become a Millionaire! ✨
            </p>
            <p className="text-white text-sm sm:text-base font-bold leading-relaxed max-w-2xl mx-auto">
              This World Cup match is coming to change lives forever! It is your absolute perfect time and opportunity to become a millionaire. Buy shares now at an ultra-cheaper rate and win bigger when the country you support wins the championship!
            </p>
          </div>
        </div>

        {/* ==================== LARGE PROFESSIONAL YOUTUBE VIDEO SECTION ==================== */}
        <div id="hero-presentation-video" className="w-full max-w-4xl px-2 mb-12 select-none">
          <div className="relative bg-[#0d111c] border-2 border-[#d4af37] rounded-3xl shadow-[0_20px_50px_rgba(212,175,55,0.25)] overflow-hidden">
            
            {/* Top Info Bar */}
            <div className="bg-[#111625] border-b border-[#2d364d] px-4 py-3 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest">FIFA LIVE</span>
                <span className="text-xs font-bold text-gray-200 hidden sm:inline truncate max-w-sm">
                  The Best FIFA Football Awards™ 2025 | FIFA Celebration Dinner
                </span>
              </div>
              <div className="flex items-center bg-black/45 rounded-lg p-0.5 border border-[#2d364d]">
                <button
                  onClick={() => setVideoMode('embed')}
                  className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all duration-200 ${
                    videoMode === 'embed'
                      ? 'bg-[#d4af37] text-black shadow-[0_2px_8px_rgba(212,175,55,0.3)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Embedded Player
                </button>
                <button
                  onClick={() => setVideoMode('fallback')}
                  className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all duration-200 ${
                    videoMode === 'fallback'
                      ? 'bg-[#d4af37] text-black shadow-[0_2px_8px_rgba(212,175,55,0.3)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Direct Stream Card
                </button>
              </div>
            </div>

            {/* Video Body */}
            {videoMode === 'embed' ? (
              <div className="aspect-video w-full relative bg-black">
                {!playClicked ? (
                  <div 
                    className="absolute inset-0 w-full h-full cursor-pointer relative overflow-hidden flex items-center justify-center group" 
                    onClick={() => setPlayClicked(true)}
                  >
                    {/* Background image: high-quality guaranteed thumbnail */}
                    <img 
                      src="https://img.youtube.com/vi/8bK6aFcsAO4/hqdefault.jpg" 
                      alt="The Best FIFA Football Awards™ 2025 | FIFA Celebration Dinner Thumbnail"
                      className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />
                    
                    {/* Big glowing custom YouTube Play Button */}
                    <div className="relative z-10 flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-red-600 hover:bg-red-500 rounded-2xl flex items-center justify-center shadow-[0_10px_35px_rgba(220,38,38,0.6)] border border-white/20 transition-all duration-300 transform group-hover:scale-110 active:scale-95">
                        <Play className="w-10 h-10 text-white fill-white ml-1.5" />
                      </div>
                      <span className="text-xs font-black text-white tracking-widest uppercase px-3.5 py-2 bg-black/80 border border-[#d4af37]/45 rounded-lg backdrop-blur-sm">
                        Click to Play Stream
                      </span>
                    </div>

                    {/* Quick Badge overlay */}
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-600 text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5 shadow-md">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      <span>LIVE STREAM</span>
                    </div>
                  </div>
                ) : (
                  <iframe
                    id="presentation-video-frame"
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/8bK6aFcsAO4?autoplay=1&rel=0&modestbranding=1"
                    title="The Best FIFA Football Awards™ 2025 | FIFA Celebration Dinner"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            ) : (
              <div className="aspect-video w-full relative overflow-hidden flex flex-col justify-center items-center bg-gradient-to-br from-[#0c101c] via-[#111728] to-[#0c101c]">
                {/* Background Thumbnail preview */}
                <img 
                  src="https://img.youtube.com/vi/8bK6aFcsAO4/hqdefault.jpg" 
                  alt="FIFA Awards Stream background"
                  className="absolute inset-0 w-full h-full object-cover opacity-25 blur-sm scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Interactive Content */}
                <div className="relative z-10 max-w-lg mx-auto text-center px-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] cursor-pointer mb-4 transition-all duration-300 transform hover:scale-110 active:scale-95 border-2 border-white/25">
                    <a 
                      href="https://www.youtube.com/watch?v=8bK6aFcsAO4" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full h-full flex items-center justify-center pl-1"
                    >
                      <Play className="w-7 h-7 text-white fill-white" />
                    </a>
                  </div>
                  
                  <span className="px-2.5 py-1 bg-black/75 border border-red-500/50 rounded text-[9px] font-mono font-bold text-red-500 uppercase tracking-widest mb-3">
                    Broadcasting on YouTube
                  </span>
                  
                  <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug tracking-tight mb-2">
                    The Best FIFA Football Awards™ 2025 | FIFA Celebration Dinner
                  </h3>
                  <p className="text-[11px] text-[#d4af37]/90 font-semibold mb-6">
                    Official Feed ⏤ Broadcast by FIFA
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-center">
                    <a
                      href="https://www.youtube.com/watch?v=8bK6aFcsAO4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                    >
                      <Youtube className="w-4 h-4 fill-white" />
                      <span>Watch Live on YouTube</span>
                    </a>
                    
                    <button
                      onClick={() => setVideoMode('embed')}
                      className="px-5 py-2.5 bg-[#1a2135] hover:bg-[#252f4c] text-gray-200 border border-[#374464] font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Tv className="w-4 h-4 text-gray-400" />
                      <span>Try Embedded Player</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Stream Status / Fallback Notice */}
            <div className="bg-[#111625]/60 px-4 py-2.5 flex items-center justify-between text-[11px] text-gray-400 select-none">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Regional embed blockage? Use the <b>Direct Stream Card</b> to play directly on YouTube.</span>
              </span>
              <a
                href="https://www.youtube.com/watch?v=8bK6aFcsAO4"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white underline font-bold flex items-center gap-1 ml-2 text-gray-300 font-mono text-[10px]"
              >
                <span>watch on youtube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>

        {/* Action Buttons matching screenshot closely */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full select-none mb-8">
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

        {/* ==================== PROFESSIONAL INVESTOR NAVIGATION MENU ==================== */}
        <div id="investor-navigation-menu" className="w-full max-w-5xl bg-[#0b0e17]/95 border-2 border-[#d4af37] rounded-2xl p-2 sm:p-3 shadow-[0_0_30px_rgba(212,175,55,0.2)] mb-10 select-none">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full">
            
            <button
              onClick={() => {
                if (onNavigateToSection) onNavigateToSection('market');
                else onNavigateToMarket();
              }}
              className="flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-4 md:py-3.5 bg-[#121623] hover:bg-[#1b2135] border border-transparent hover:border-[#d4af37]/50 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
            >
              <TrendingUp className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
              <div className="text-center md:text-left">
                <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">World Cup Market</span>
                <span className="hidden md:block text-[9px] text-[#d4af37]/85 font-medium">Equities & Indexes</span>
              </div>
            </button>

            <button
              onClick={() => onNavigateToSection?.('live-data')}
              className="flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-4 md:py-3.5 bg-[#121623] hover:bg-[#1b2135] border border-transparent hover:border-[#d4af37]/50 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
            >
              <Activity className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
              <div className="text-center md:text-left">
                <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">Live Data Center</span>
                <span className="hidden md:block text-[9px] text-[#d4af37]/85 font-medium">Fixtures & Scores</span>
              </div>
            </button>

            <button
              onClick={() => {
                if (onNavigateToSection) onNavigateToSection('tournament');
                else if (onNavigateToTournament) onNavigateToTournament();
              }}
              className="flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-4 md:py-3.5 bg-[#121623] hover:bg-[#1b2135] border border-transparent hover:border-[#d4af37]/50 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
            >
              <Trophy className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
              <div className="text-center md:text-left">
                <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">Tournament & Teams</span>
                <span className="hidden md:block text-[9px] text-[#d4af37]/85 font-medium">Standings & Groups</span>
              </div>
            </button>

            <button
              onClick={() => onNavigateToSection?.('how-it-works')}
              className="flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-4 md:py-3.5 bg-[#121623] hover:bg-[#1b2135] border border-transparent hover:border-[#d4af37]/50 rounded-xl text-white transition-all transform active:scale-95 cursor-pointer group"
            >
              <FileText className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
              <div className="text-center md:text-left">
                <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">How It Works</span>
                <span className="hidden md:block text-[9px] text-[#d4af37]/85 font-medium">Platform Guide</span>
              </div>
            </button>

            <button
              onClick={() => {
                if (onTriggerCreateAccount) onTriggerCreateAccount();
                else onNavigateToSection?.('how-it-works');
              }}
              className="col-span-2 md:col-span-1 flex flex-col md:flex-row items-center justify-center gap-2.5 px-4 py-4 md:py-3.5 bg-[#d4af37] hover:bg-white text-black rounded-xl transition-all transform active:scale-95 cursor-pointer group"
            >
              <UserPlus className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
              <div className="text-center md:text-left">
                <span className="block font-black text-xs sm:text-xs tracking-wider uppercase">Create Account</span>
                <span className="hidden md:block text-[9px] text-black/80 font-medium font-sans">Get $1,000 Test Balance</span>
              </div>
            </button>

          </div>
        </div>

        {/* ==================== EXTRA HIGH-TRUST SECURITY SHIELD SECTION ==================== */}
        <div id="investor-security-shield-hub" className="w-full max-w-5xl bg-gradient-to-r from-[#101422] to-[#0a0d16] border border-[#20293d] rounded-2xl p-5 sm:p-6 shadow-xl text-left select-none mb-14">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-white text-base sm:text-lg lg:text-xl font-display uppercase tracking-wider bg-gradient-to-r from-[#d4af37] to-white bg-clip-text text-transparent">
                  Investor Security & Trust Shield
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
                  Enterprise grade collateral backing, audited security clearing nodes, and real-time synchronisation.
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4 shrink-0 w-full md:w-auto">
              <div className="p-3 bg-neutral-900/60 border-2 border-[#d4af37]/50 rounded-xl flex-1 md:flex-initial text-center md:text-left shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <span className="block text-[9px] uppercase tracking-widest text-[#d4af37] font-extrabold font-mono">FULLY BACKED COLLATERAL</span>
                <span className="block text-sm sm:text-base font-black text-white font-mono mt-0.5">$1,000,000,000+ USD</span>
              </div>
              <div className="p-3 bg-neutral-900/60 border border-[#20293d] rounded-xl flex-1 md:flex-initial text-center md:text-left">
                <span className="block text-[9px] uppercase tracking-widest text-emerald-400 font-extrabold font-mono font-sans">COMPLIANT AUDITS</span>
                <span className="block text-xs font-black text-emerald-400 font-sans mt-1">100% SECURED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tournaments & Teams shortcut tab panel (originally sub-menu under buy shares now) */}
        <div className="flex flex-col items-center gap-5 bg-[#0e1322]/95 backdrop-blur-md border border-[#212f4c] rounded-3xl p-6 sm:p-8 shadow-2xl select-none w-full max-w-5xl">
          <span className="text-sm sm:text-base font-black text-[#d4af37] uppercase tracking-widest font-sans flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#d4af37] animate-pulse" /> Tournaments & Teams Index:
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
