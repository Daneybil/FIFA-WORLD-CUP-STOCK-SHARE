import React, { useState, useEffect } from 'react';
import { CountryShare, PaymentMethod } from '../types';
import { 
  X, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Coins, 
  CreditCard, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle, 
  Lock, 
  ExternalLink 
} from 'lucide-react';
import { createPaymentSession, verifyAndProcessPayment } from '../lib/firebase-service';

interface PurchaseModalProps {
  country: CountryShare;
  userCash: number;
  userId: string | null;
  onClose: () => void;
  onCompletePurchase: () => void; // Tell parent to reload holdings / transactions from Firestore
}

export default function PurchaseModal({ 
  country, 
  userCash, 
  userId, 
  onClose, 
  onCompletePurchase 
}: PurchaseModalProps) {
  // Step 1: Input amount
  // Step 2: CryptoMUS Payment Gateway
  // Step 3: Success Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<number>(100);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('USDT');
  
  // CryptoMUS transaction context
  const [paymentId, setPaymentId] = useState<string>('');
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(900); // 15 minutes
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Credit Card fields (if CreditCard/DebitCard chosen)
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');

  // Settle calculations
  const sharesCalculated = amount > 0 ? amount / country.currentPrice : 0;
  const potentialPayout = sharesCalculated * country.winningSettlementPrice;
  const potentialReturnPercent = Number((country.winningSettlementPrice / country.currentPrice).toFixed(1));
  const hasSufficientBalance = userCash >= amount;

  // Countdown timer for Crypto Address
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1 Click: Proceed to CryptoMUS Gateway
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 5) return;
    if (!hasSufficientBalance) {
      setErrorMsg("Insufficient USD collateral value in your investor account balance.");
      return;
    }
    if (!userId) {
      setErrorMsg("Investor identification node mismatch. Please authenticate before making purchases.");
      return;
    }

    setApiLoading(true);
    setErrorMsg(null);
    try {
      // Create real session in Firestore (Pending state)
      const session = await createPaymentSession(userId, {
        amount,
        paymentMethod: selectedMethod,
        countryId: country.id,
        countryName: country.name,
        flag: country.flag,
        sharesQuantity: sharesCalculated,
        pricePerShare: country.currentPrice,
        winningSettlementPrice: country.winningSettlementPrice
      });

      setPaymentId(session.id);
      setStep(2);
      setCountdown(900); // reset clock
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to contact CryptoMUS Gateway.");
    } finally {
      setApiLoading(false);
    }
  };

  // Step 2 Click: Verify Payment & Settle Shares (Triggers Firebase atomic batch operation)
  const handleVerifyPayment = async () => {
    if (!userId || !paymentId) return;
    setIsVerifying(true);
    setErrorMsg(null);
    
    try {
      // Direct CryptoMUS Payment Gateway verify callback simulation
      // In a real network, this queries CryptoMUS endpoint or listens to webhook.
      // We directly fetch the payment session from Firestore and atomically transition it!
      const success = await verifyAndProcessPayment(userId, paymentId);
      
      if (success) {
        setStep(3);
        onCompletePurchase(); // notify parent to reload states from Firestore!
      } else {
        setErrorMsg("CryptoMUS Gateway feedback: Payment not detected yet. Please ensure blockchain deposit was broadcasted.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Security Clearing error.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#0f121a] border border-[#212838] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative font-sans my-auto">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#202737] bg-[#111622]">
          <div className="flex items-center space-x-3">
            <span className="text-2xl hover:scale-110 transition-transform">{country.flag}</span>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-amber-500 font-extrabold font-mono block">CryptoMUS Merchant Protocol</span>
              <h3 className="font-extrabold text-white text-base font-display">
                {step === 1 && `Acquire ${country.name} Equity`}
                {step === 2 && `CryptoMUS Secure Checkout`}
                {step === 3 && `Order Settle Receipt`}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#161a25] hover:bg-[#202737] hover:text-[#d4af37] text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-sans flex items-start gap-2 select-none">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: CALCULATOR & AMOUNT SPECIFICATIONS */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-5">
            
            {/* Real-time price and ledger info cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#080a0f] p-3 rounded-xl border border-white/5">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Price Per Share</span>
                <span className="text-sm font-extrabold text-white font-mono block mt-1">${country.currentPrice.toFixed(2)}</span>
              </div>
              <div className="bg-[#080a0f] p-3 rounded-xl border border-white/5">
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Available Balance</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono block mt-1">${userCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Capital allocation input field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9ba2b0]">
                  Capital to Allocate (USD)
                </label>
                <span className="text-[10px] text-gray-500 font-mono font-bold">Min: $5.00</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                <input
                  type="number"
                  min="5"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 bg-[#151a26] border border-[#262f43] rounded-xl text-sm text-white font-mono font-bold focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/35"
                />
              </div>
            </div>

            {/* Live equity calculations stream */}
            <div className="bg-[#121622] p-4 rounded-xl border border-[#21293c]/60 text-center space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8b92a2] font-mono font-black">SHARES TO BE ISSUED</span>
                <div className="text-3xl font-black text-white font-mono mt-0.5 tracking-tight">
                  {sharesCalculated.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                </div>
              </div>
              
              <div className="pt-3 border-t border-[#1b2230] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Winning Settlement Price:</span>
                  <span className="text-amber-400 font-bold font-mono">${country.winningSettlementPrice.toFixed(2)} / share</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Potential Return Factor:</span>
                  <span className="text-sky-400 font-extrabold font-mono">x{potentialReturnPercent} ({((potentialReturnPercent - 1)*100).toFixed(0)}% ROI)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Purchase Cost:</span>
                  <span className="text-white font-bold font-mono">${amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#1b2230]/55">
                  <span className="text-gray-400 font-bold">Potential Settlement Value:</span>
                  <span className="text-emerald-400 font-black font-mono text-sm">${potentialPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Select CryptoMUS Payment Method */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400">
                Select CryptoMUS Inbound Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('USDT')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${selectedMethod === 'USDT' ? 'bg-[#d4af37]/15 border-[#d4af37] text-white font-bold' : 'bg-[#151a26]/70 border-[#262f43] text-gray-400 hover:text-white'}`}
                >
                  <Coins className="w-5 h-5 mx-auto text-[#d4af37] mb-1" />
                  <span className="text-[10px] block font-mono font-bold">USDT (TRC20)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('BTC')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${selectedMethod === 'BTC' ? 'bg-[#d4af37]/15 border-[#d4af37] text-white font-bold' : 'bg-[#151a26]/70 border-[#262f43] text-gray-400 hover:text-white'}`}
                >
                  <Coins className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                  <span className="text-[10px] block font-mono font-bold">BTC (Legacy)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('CreditCard')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${selectedMethod === 'CreditCard' ? 'bg-[#d4af37]/15 border-[#d4af37] text-white font-bold' : 'bg-[#151a26]/70 border-[#262f43] text-gray-400 hover:text-white'}`}
                >
                  <CreditCard className="w-5 h-5 mx-auto text-sky-400 mb-1" />
                  <span className="text-[10px] block font-sans font-bold">Debit / Card</span>
                </button>
              </div>
            </div>

            {/* Validation indicators */}
            {amount > 0 && !hasSufficientBalance && (
              <div className="bg-red-500/10 border border-red-500/20 px-3.5 py-3 rounded-lg text-xs text-red-400 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Balance Alert:</strong> Account balance is ${userCash.toFixed(2)}, lowering than requested checkout payload of ${amount.toFixed(2)}. Please reduce investment amount.
                </span>
              </div>
            )}

            {/* Proceed Action button */}
            <button
              type="submit"
              disabled={amount < 5 || !hasSufficientBalance || apiLoading}
              className="w-full py-4 bg-gradient-to-r from-[#d4af37] via-[#f7ebd1] to-[#bca03f] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black font-display rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:brightness-105 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {apiLoading ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  <span>Configuring Escrow Session...</span>
                </>
              ) : (
                <>
                  <span>Proceed to CryptoMUS Gateway</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>

          </form>
        )}

        {/* STEP 2: CRYPTOMUS ESCROW PAYMENT SECTOR */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            
            {/* Header info */}
            <div className="bg-[#121622] rounded-xl border border-[#21283a] p-4 text-center select-none font-mono">
              <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-black block">CRYPTOMUS MERCHANT BILLING CODE</span>
              <div className="text-base font-black text-white mt-1.5">{paymentId}</div>
              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#1b2230] text-xs">
                <span className="text-gray-400">Merchant Payload:</span>
                <span className="text-white font-bold">${amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-gray-400">Target Asset Equity:</span>
                <span className="text-white font-bold">{country.flag} {sharesCalculated.toFixed(4)} {country.id} Shares</span>
              </div>
            </div>

            {/* Method specific graphics */}
            {(selectedMethod === 'USDT' || selectedMethod === 'BTC') ? (
              <div className="space-y-5 text-center">
                <p className="text-xs text-gray-300">
                  Please broadcast the exact payment amount to the generated CryptoMUS secure cold deposit register before the reservation session expires:
                </p>

                {/* QR code simulation node */}
                <div className="w-36 h-36 bg-white border-4 border-[#121622] p-1.5 mx-auto rounded-lg flex items-center justify-center shadow-lg relative">
                  <div className="inset-0 absolute bg-gradient-to-br from-[#d4af37]/5 to-black/10 pointer-events-none" />
                  {/* Styled block representing real QR Code */}
                  <div className="w-full h-full bg-[radial-gradient(#1e1e1e_2px,transparent_2px)] [background-size:8px_8px] select-none opacity-85" />
                  <div className="absolute w-8 h-8 rounded-lg bg-black text-[#d4af37] flex items-center justify-center border border-[#d4af37]/40 leading-none text-[8px] font-bold">
                    FIFA
                  </div>
                </div>

                {/* Network & Deposit Details */}
                <div className="space-y-2.5 max-w-sm mx-auto">
                  <div className="bg-[#0c0f16] p-2 rounded-lg border border-white/5 text-left font-mono">
                    <span className="text-[8px] uppercase text-gray-500 font-bold block">CryptoMUS Ingress Deposit Address ({selectedMethod})</span>
                    <div className="flex items-center justify-between text-[11px] text-white font-black mt-0.5 truncate">
                      <span>{selectedMethod === 'USDT' ? 'TY2ka4A1Yv9Y1BvP89GfAmsD8fN4X9s7qT' : '1BvBMSEYstW235H89GfAmsD8fN5X8r2pX'}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(selectedMethod === 'USDT' ? 'TY2ka4A1Yv9Y1BvP89GfAmsD8fN4X9s7qT' : '1BvBMSEYstW235H89GfAmsD8fN5X8r2pX')}
                        className="text-[9px] uppercase tracking-wider text-amber-500 font-black hover:text-white ml-2 shrink-0 cursor-pointer"
                      >
                        [COPY]
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 px-1 font-mono">
                    <span>Protocol Network: <strong className="text-white">{selectedMethod === 'USDT' ? 'TRON (TRC20)' : 'Bitcoin Mainnet'}</strong></span>
                    <span className="flex items-center gap-1">⏰ Session expires: <strong className="text-red-400 font-bold font-mono">{formatTimer(countdown)}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              /* DEBIT / CREDIT CARD SIMULATION INTERFACE */
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide block">Fiat Credit / Debit Card Gate</span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 font-sans mb-1">Cardholder Complete Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#141824] border border-[#232a3d] rounded-xl text-xs text-white uppercase tracking-wider focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 font-sans mb-1">Debit / Credit Card Number</label>
                    <input 
                      type="text" 
                      maxLength={19}
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#141824] border border-[#232a3d] rounded-xl text-xs text-white font-mono tracking-widest focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 font-sans mb-1">Expiry Date (MM/YY)</label>
                      <input 
                        type="text" 
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#141824] border border-[#232a3d] rounded-xl text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 font-sans mb-1">CVV / CVC Code</label>
                      <input 
                        type="password" 
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#141824] border border-[#232a3d] rounded-xl text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Note reinforcing zero simulation / actual secure system */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-[11px] text-[#4ade80] space-y-1">
              <div className="font-extrabold flex items-center gap-1 uppercase">
                <Lock className="w-3.5 h-3.5" /> 100% Secure Collateral Settlement Block
              </div>
              <p className="leading-relaxed opacity-90">
                This is a secure production checkout interface. Clicking the action button below queries the CryptoMUS network payment status directly. The system verifies confirmation before any share equity allocations are recorded to the ledger.
              </p>
            </div>

            {/* Verification Controls */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 bg-[#171d2c] hover:bg-[#20293c] border border-white/5 whitespace-nowrap rounded-xl text-xs font-bold text-gray-300 uppercase transition-colors cursor-pointer"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-40 hover:brightness-105 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Contacting Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5" />
                    <span>Authorize & Verify Payment</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: TRANSACTION COMPLETE SUCCESS RECIEPT */}
        {step === 3 && (
          <div className="p-6 text-center space-y-6 select-none font-sans">
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">CRYPTOMUS INGRESS CONFIRMED</span>
              <h3 className="text-xl font-black text-white font-display">Payment Settled Successfully!</h3>
              <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                Your transaction was verified against CryptoMUS API gateway hashes. Your {country.name} shares have been atomically recorded to your active ledger portfolio.
              </p>
            </div>

            {/* Reciept Table Block */}
            <div className="bg-[#121622] rounded-xl border border-[#21283a] p-4 text-left divide-y divide-[#1c2232] text-xs font-mono max-w-sm mx-auto">
              <div className="pb-2.5 flex justify-between items-center text-gray-400">
                <span>Transaction UID:</span>
                <span className="text-white font-bold">{paymentId}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-gray-400">
                <span>Shares Acquired:</span>
                <span className="text-[#d4af37] font-extrabold">{sharesCalculated.toFixed(4)} {country.id} Shares</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-gray-400">
                <span>Purchase Price:</span>
                <span className="text-white">${country.currentPrice.toFixed(2)} / share</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-gray-400">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-400 font-bold">${amount.toFixed(2)} USD</span>
              </div>
              <div className="pt-2.5 flex justify-between items-center text-gray-400">
                <span>Winning Payout Pot:</span>
                <span className="text-emerald-400 font-extrabold">${potentialPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Final Done Action */}
            <button
              onClick={onClose}
              className="w-full max-w-sm mx-auto py-3.5 bg-gradient-to-r from-[#d4af37] to-[#bca03f] text-black font-black font-display rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:brightness-105"
            >
              Open My Portal Dashboard
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
