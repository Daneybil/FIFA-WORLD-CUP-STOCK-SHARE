import React from 'react';
import { CountryShare } from '../types';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface MarketTickerProps {
  countries: CountryShare[];
}

export default function MarketTicker({ countries }: MarketTickerProps) {
  // Duplicate the list of countries to create a seamless infinite marquee scroll
  const sortedAndDuplicated = [...countries, ...countries, ...countries];

  return (
    <div className="bg-[#0b0d12] border-b border-[#181a20] py-2.5 overflow-hidden relative select-none z-10">
      {/* Absolute indicator for LIVE badge */}
      <div className="absolute left-0 top-0 bottom-0 px-3 bg-[#131722] border-r border-[#262a35] flex items-center space-x-1.5 z-20 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="w-2 h-2 rounded-full bg-emerald-500 absolute" />
        <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-emerald-400">LIVE TICKER</span>
      </div>

      <div className="flex animate-marquee whitespace-nowrap pl-24">
        {sortedAndDuplicated.map((country, index) => {
          const isUp = country.trending === 'up' || country.change24h > 0;
          const isDown = country.trending === 'down' || country.change24h < 0;

          return (
            <div
              key={`${country.id}-${index}`}
              className="inline-flex items-center space-x-2.5 mx-6 text-xs font-mono"
            >
              <span className="text-sm">{country.flag}</span>
              <span className="font-semibold text-white font-sans">{country.name}</span>
              <span className="text-[#a0a5b0]">${country.currentPrice.toFixed(2)}</span>
              
              <span
                className={`inline-flex items-center space-x-0.5 text-[11px] font-bold pb-0.5 ${
                  isUp 
                    ? 'text-emerald-500' 
                    : isDown 
                    ? 'text-red-500' 
                    : 'text-gray-400'
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : isDown ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1" />
                )}
                <span>
                  {country.change24h > 0 ? '+' : ''}
                  {country.change24h.toFixed(1)}%
                </span>
              </span>

              <span className="text-[10px] text-gray-600">|</span>
              <span className="text-[10px] font-semibold text-amber-500/80">Settl: ${country.winningSettlementPrice.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
