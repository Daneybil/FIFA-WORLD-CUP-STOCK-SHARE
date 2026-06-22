import React from 'react';
import { Shield, Wallet, Coins, TrendingUp, LineChart, Trophy, CreditCard, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Choose Your Champion",
      desc: "Select a country you believe has the strength and tactical prowess to win the FIFA World Cup."
    },
    {
      id: 2,
      title: "Allocate Capital",
      desc: "Decide the precise amount you wish to invest in that country's customized equity shares."
    },
    {
      id: 3,
      title: "Secure Settlement",
      desc: "Complete your transaction seamlessly using standard cryptocurrency or popular fiat gateways."
    },
    {
      id: 4,
      title: "Private Custody",
      desc: "Your acquired country shares are instantly and securely recorded into your private personal ledger."
    },
    {
      id: 5,
      title: "Track Performance",
      desc: "Monitor your team's real-time fixture success and asset price valuation through our active indices."
    },
    {
      id: 6,
      title: "Championship Maturity",
      desc: "If your selected nation wins the tournament, the settlement value of your shares increases significantly according to clear index rules."
    },
    {
      id: 7,
      title: "Capital Liquidity",
      desc: "Audited profits are credited directly to your portfolio, available for secure withdrawal in selected payout networks."
    }
  ];

  const valueProps = [
    {
      icon: <Shield className="w-6 h-6 text-amber-400" />,
      title: "Secure Portfolio Storage",
      desc: "Multi-layered enterprise safety measures keeping all your active equity certificates and tournament balances fully audited."
    },
    {
      icon: <Wallet className="w-6 h-6 text-amber-400" />,
      title: "Encrypted User Wallets",
      desc: "Your custody account utilizes advanced encryption standards to ensure safe asset authorization and storage."
    },
    {
      icon: <Coins className="w-6 h-6 text-emerald-400" />,
      title: "Crypto Payments Supported",
      desc: "Make instant, zero-wait settlements using leading blockchain tokens like USDT, USDC, and Bitcoin."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-400" />,
      title: "Fiat Payments Supported",
      desc: "Deposit local currencies conveniently using direct credit transfers and global payment networks."
    },
    {
      icon: <LineChart className="w-6 h-6 text-amber-400" />,
      title: "Real-Time Tournament Tracking",
      desc: "Direct integration with authorized live athletic data pipelines guarantees immediate valuation updates."
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      title: "Professional Portfolio Management",
      desc: "Sophisticated capital tracking dashboard makes managing multiple national equities and settlement rules intuitive."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-12">
      
      {/* Intro Brand Deck */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-extrabold px-3 py-1 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-full font-mono">
          SECURE ALTERNATIVE SPORTS INVESTMENTS
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white font-display tracking-tight uppercase">
          How the Equity Index Works
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Our platform brings a specialized, fully institutionalized equity model to global soccer. Acquire and trade team shares represented dynamically based on their live performance. No speculation, all logic.
        </p>
      </div>

      {/* Numerical Step Path */}
      <div className="relative border-l-2 border-[#1e2535] ml-4 md:ml-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:border-l-0 md:ml-0 gap-6 space-y-8 md:space-y-0">
        {steps.map((s, idx) => (
          <div 
            key={s.id} 
            className="relative pl-8 md:pl-0 bg-[#10131c]/80 border border-[#1f2638] rounded-2xl p-6 shadow-xl backdrop-blur-sm hover:border-[#d4af37]/30 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Circular step tracker circle */}
            <div className="absolute left-0 top-6 -translate-x-1/2 md:-translate-x-0 md:relative md:top-0 md:left-0 mb-4 w-10 h-10 rounded-full bg-gradient-to-br from-[#fde68a] to-[#d4af37] text-black flex items-center justify-center font-black font-mono text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              {s.id}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-white text-base tracking-wide font-display">
                {s.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                {s.desc}
              </p>
            </div>

            {idx < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-600 z-10">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Features Deck */}
      <div className="bg-[#10131c]/50 p-8 rounded-2xl border border-[#212739] shadow-2xl space-y-8">
        <div className="text-center md:text-left">
          <span className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase font-mono block">
            STABILITY & TRUST PROTOCOLS
          </span>
          <h3 className="text-xl font-bold text-white font-display uppercase tracking-wider mt-1">
            Platform Security & Compliance
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Our state-of-the-art alternative trading ecosystem is built on transparency, offering you robust custody, fast off-ramps, and instantaneous automated settlement protocols.
          </p>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {valueProps.map((p, idx) => (
            <div 
              key={idx} 
              className="bg-[#0b0d13] p-5.5 rounded-xl border border-[#1d2232] hover:bg-[#11141e] transition-all flex space-x-4 items-start"
            >
              <div className="p-2.5 rounded-lg bg-[#141926] shrink-0">
                {p.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm font-display">{p.title}</h4>
                <p className="text-xs text-gray-400 leading-normal">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
