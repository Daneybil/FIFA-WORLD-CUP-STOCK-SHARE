import React, { useState } from 'react';
import { ShareHolding } from '../types';
import { X, ArrowRight, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { sellSharesInFirestore } from '../lib/firebase-service';

interface SellModalProps {
  holding: ShareHolding;
  marketPrice: number;
  userId: string | null;
  onClose: () => void;
  onCompleteSale: (sharesSold?: number, usdReceived?: number) => void;
}

export default function SellModal({
  holding,
  marketPrice,
  userId,
  onClose,
  onCompleteSale
}: SellModalProps) {
  const [sharesToSell, setSharesToSell] = useState<number>(holding.sharesQuantity);
  const [isSelling, setIsSelling] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const maxShares = holding.sharesQuantity;
  const currentValuationToReceive = sharesToSell * marketPrice;
  const isInvalidAmount = sharesToSell <= 0 || sharesToSell > maxShares;

  const handleMaxClick = () => {
    setSharesToSell(maxShares);
  };

  const handleHalfClick = () => {
    setSharesToSell(Number((maxShares / 2).toFixed(4)));
  };

  const handleConfirmSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalidAmount) return;

    setIsSelling(true);
    setErrorMsg(null);

    try {
      if (userId) {
        // Authenticated user - Sell in Firestore
        await sellSharesInFirestore(userId, holding.countryId, sharesToSell, marketPrice);
        onCompleteSale();
      } else {
        // Guest user - Complete sale in memory
        onCompleteSale(sharesToSell, currentValuationToReceive);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Liquidation failed. The transaction request could not be processed.");
    } finally {
      setIsSelling(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
      {/* 3D Extruded Premium Luxury Card Container */}
      <div className="bg-gradient-to-b from-[#120d0d] via-[#0a0707] to-[#050303] border border-red-500/20 w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative font-sans my-auto border-t-red-500/40">
        
        {/* Glowing Top Premium Border Highlight */}
        <div className="h-[2px] w-full bg-gradient-to-r from-red-800 via-red-500 to-red-800" />

        {/* Header Toolbar - Deep Crimson Elegant Design */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a1b1b] bg-[#120a0a]">
          <div className="flex items-center space-x-3.5">
            <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] select-none">
              {holding.flag}
            </span>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-red-400 font-extrabold font-mono block">
                Certified Liquidation Protocol
              </span>
              <h3 className="font-black text-white text-base tracking-tight">
                Liquidate {holding.countryName} Equity
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#221414] hover:bg-[#331c1c] hover:text-red-300 text-gray-400 transition-all cursor-pointer border border-[#301a1a] active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 font-sans flex items-start gap-2.5 shadow-inner animate-pulse">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleConfirmSell} className="p-6 space-y-5">
          {/* Real-time details with 3D styled bevels */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-[#100909] p-3.5 rounded-xl border border-red-950/30 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block ml-1">Market Price</span>
              <span className="text-base font-extrabold text-white font-mono block mt-1 ml-1">
                ${marketPrice.toFixed(2)}
              </span>
            </div>
            
            <div className="bg-[#090a10] p-3.5 rounded-xl border border-[#1f273b] shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block ml-1">Shares Owned</span>
              <span className="text-base font-extrabold text-[#d4af37] font-mono block mt-1 ml-1">
                {holding.sharesQuantity.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Amount input field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Shares to Liquidate
              </label>
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={handleHalfClick}
                  className="text-[9px] text-red-400 hover:text-red-300 font-mono font-bold bg-red-950/20 hover:bg-red-950/40 border border-red-500/15 px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="text-[9px] text-red-400 hover:text-red-300 font-mono font-bold bg-red-950/20 hover:bg-red-950/40 border border-red-500/15 px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0.0001"
                max={maxShares}
                step="any"
                value={sharesToSell || ''}
                onChange={(e) => setSharesToSell(Math.min(maxShares, parseFloat(e.target.value) || 0))}
                className="w-full pl-4 pr-12 py-3 bg-[#120b0b] border border-red-950/40 rounded-xl text-base text-white font-mono font-bold focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/35 shadow-inner transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-red-400 font-mono">SHARES</span>
            </div>
          </div>

          {/* Settle valuation projection card */}
          <div className="bg-[#120a0a] p-4.5 rounded-xl border border-red-950/30 text-center space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono font-black block">
                ESCROW USD CREDIT VALUE
              </span>
              <div className="text-3xl font-black text-white font-mono mt-1 tracking-tight">
                ${currentValuationToReceive.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="pt-3.5 border-t border-red-950/30 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Average Purchase Price:</span>
                <span className="text-gray-300 font-mono">${holding.averagePurchasePrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Yield / Profit Valuation:</span>
                {marketPrice >= holding.averagePurchasePrice ? (
                  <span className="text-emerald-400 font-bold font-mono">
                    +${((marketPrice - holding.averagePurchasePrice) * sharesToSell).toFixed(2)} USD
                  </span>
                ) : (
                  <span className="text-red-400 font-bold font-mono">
                    -${((holding.averagePurchasePrice - marketPrice) * sharesToSell).toFixed(2)} USD
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Secure disclaimer */}
          <div className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-lg text-[10px] text-amber-400/90 leading-relaxed font-sans flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Collateral Release:</strong> Initiating liquidation will instantly redeem selected shares at the current market spot rate of <strong>${marketPrice.toFixed(2)}</strong>. Credited funds are deposited into your escrow balance immediately.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isInvalidAmount || isSelling}
            className="w-full py-4 bg-gradient-to-b from-red-500 via-red-600 to-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black font-sans rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_6px_20px_rgba(239,68,68,0.15)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.35)] hover:brightness-110 active:translate-y-0.5 border-t border-red-400 border-b-2 border-red-950 flex items-center justify-center gap-2"
          >
            {isSelling ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                <span className="font-extrabold">Executing Ledger Clearance...</span>
              </>
            ) : (
              <>
                <span className="font-black">Confirm Liquidation / Sell Shares</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
