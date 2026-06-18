import React, { useState, useEffect } from 'react';
import { CountryShare, PaymentMethod } from '../types';
import { X, Lock, Coins, CreditCard, Landmark, CheckCircle, Clipboard, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { MOCK_WALLET_ADDRESSES } from '../mockData';

interface PurchaseModalProps {
  country: CountryShare;
  onClose: () => void;
  onCompletePurchase: (
    countryId: string, 
    amount: number, 
    shares: number, 
    paymentMethod: PaymentMethod
  ) => void;
}

export default function PurchaseModal({ country, onClose, onCompletePurchase }: PurchaseModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: Payment Execution, 3: Success Confirmation
  const [amount, setAmount] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('USDT');
  
  // Clipboard copied status
  const [copied, setCopied] = useState(false);

  // Credit card details
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Secure OTP logic
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [secureOTP, setSecureOTP] = useState('');
  const [otpError, setOtpError] = useState('');

  // Settle calculations
  const sharesCalculated = amount > 0 ? amount / country.currentPrice : 0;
  const potentialPayout = sharesCalculated * country.winningSettlementPrice;

  // Handles copying wallet
  const handleCopyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate secure random 6-digit OTP
  const triggerOTPSemantic = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSecureOTP(code);
    setOtpSent(true);
    setOtpError('');
    // Secure Network OTP alert
    alert(`[Secure Network OTP] Your authentication code is: ${code}`);
  };

  // Processes payment checkout
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    if (paymentMethod === 'CreditCard' || paymentMethod === 'DebitCard') {
      if (!otpSent) {
        triggerOTPSemantic();
        return;
      }
      if (otpCode !== secureOTP) {
        setOtpError('Invalid secure authorization code. Please double check.');
        return;
      }
    }

    // Advance to step 3 (Success)
    setStep(3);
  };

  // Triggers state completion up to App
  const handleFinalSuccessConfirm = () => {
    onCompletePurchase(country.id, amount, sharesCalculated, paymentMethod);
    onClose();
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#0f121a] border border-[#212838] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative font-sans my-auto">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202737]">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">{country.flag}</span>
            <div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Secure checkout</span>
              <h3 className="font-extrabold text-white text-base font-display">Acquire Shares of {country.name}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#161a25] hover:bg-[#202737] hover:text-[#d4af37] text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step PROGRESS ticker indicator */}
        <div className="grid grid-cols-3 text-center border-b border-[#1c2230] text-[10px] font-mono tracking-widest uppercase font-semibold text-gray-500">
          <div className={`py-2 text-center border-r border-[#1c2230] ${step >= 1 ? 'text-[#d4af37] bg-[#d4af37]/5 font-bold' : ''}`}>1. Order details</div>
          <div className={`py-2 text-center border-r border-[#1c2230] ${step >= 2 ? 'text-[#d4af37] bg-[#d4af37]/5 font-bold' : ''}`}>2. Escrow Payment</div>
          <div className={`py-2 text-center ${step >= 3 ? 'text-[#22c55e] bg-green-500/5 font-bold' : ''}`}>3. Secured Node</div>
        </div>

        {/* STEP 1: CONFIGURE AMOUNT & PAYMENT CHANNEL */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            
            {/* Live country price indicator */}
            <div className="bg-[#0b0e14] p-3 rounded-lg border border-[#1b2230] flex items-center justify-between text-xs font-mono text-gray-400">
              <span>Dynamic price per share:</span>
              <span className="font-bold text-white">${country.currentPrice.toFixed(2)}</span>
            </div>

            {/* Form allocation */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9ba2b0]">
                Capital Allocation (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
                <input
                  type="number"
                  min="5"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-3 bg-[#151a26] border border-[#262f43] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-medium">Minimum purchase volume: $5.00</p>
            </div>

            {/* Instant breakdown conversion widget */}
            <div className="bg-[#121622] p-4 rounded-lg border border-[#21293c]/60 text-center space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#8b92a2] font-semibold">Total Stock Allocation</span>
              <div className="text-3xl font-extrabold text-white font-mono">
                {sharesCalculated.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
              <p className="text-xs text-[#a0a8b7] font-semibold">
                You will receive <span className="text-[#d4af37] font-bold">{sharesCalculated.toFixed(2)} {country.id} Shares</span>.
              </p>
              <div className="pt-2 border-t border-[#1b2230] flex justify-between items-center text-[11px] text-gray-400">
                <span>Hold Potential Payload:</span>
                <span className="text-[#22c55e] font-extrabold font-mono">${potentialPayout.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Select payment method */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9ba2b0]">
                Select Escrow Payment Gateway
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { id: 'USDT', label: 'USDT (TRC20)', icon: Coins, category: 'crypto' },
                  { id: 'BTC', label: 'Bitcoin (BTC)', icon: Coins, category: 'crypto' },
                  { id: 'ETH', label: 'Ethereum (ETH)', icon: Coins, category: 'crypto' },
                  { id: 'CreditCard', label: 'Credit Card', icon: CreditCard, category: 'fiat' },
                  { id: 'DebitCard', label: 'Debit Card', icon: CreditCard, category: 'fiat' },
                  { id: 'BankTransfer', label: 'Bank Wire', icon: Landmark, category: 'fiat' },
                ].map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setPaymentMethod(channel.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                        paymentMethod === channel.id
                          ? 'bg-[#d4af37]/10 border-[#d4af37] text-white'
                          : 'bg-[#141823] border-[#222a3d] hover:border-gray-600 text-[#9ba2b0]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${paymentMethod === channel.id ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">{channel.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advance to next step */}
            <button
              onClick={() => setStep(2)}
              disabled={amount < 5}
              className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f4e8cb] to-[#c5a02e] disabled:opacity-50 text-black font-bold font-display rounded-lg text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <span>Initialize Escrow Hold</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

        {/* STEP 2: PAYMENT EXECUTION (CRYPTO OR FIAT OVERLAY) */}
        {step === 2 && (
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
            
            {/* If Selected Payment is Crypto */}
            {['USDT', 'BTC', 'ETH', 'BNB'].includes(paymentMethod) ? (
              <div className="space-y-4">
                <div className="bg-[#121622] p-4 rounded-lg border border-[#21293c] text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Send exactly:</div>
                  <div className="text-2xl font-extrabold text-white font-mono mt-1">
                    ${amount.toFixed(2)} USD value
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 uppercase font-mono tracking-widest font-bold">
                    via {paymentMethod} Protocol
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-lg border border-[#212836] relative">
                  <QrCode className="w-24 h-24 text-white mb-2" />
                  <span className="text-[9px] text-[#868d9d] font-mono">Scan QR to pay directly</span>
                </div>

                {/* Wallet key generator destination */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#9ba2b0]">
                    Official Escrow Treasury Wallet Address ({paymentMethod})
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      readOnly
                      value={MOCK_WALLET_ADDRESSES[paymentMethod as keyof typeof MOCK_WALLET_ADDRESSES] || '0xAddressMock'}
                      className="w-full p-3 bg-[#0a0c10] border border-[#242b3b] rounded-l-lg text-xs font-mono text-gray-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyWallet(MOCK_WALLET_ADDRESSES[paymentMethod as keyof typeof MOCK_WALLET_ADDRESSES] || '0xAddress')}
                      className="px-4 bg-[#1f2638] hover:bg-[#d4af37] hover:text-black border-y border-r border-[#242b3b] rounded-r-lg text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 px-3.5 py-3 rounded-lg text-xs text-emerald-400 flex items-start space-x-2.5">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>
                    Your secure ownership deed is prepared. Once blockchain confirmation registers, shares are dynamically credited.
                  </span>
                </div>
              </div>
            ) : (
              /* If Selected payment is Fiat Card details */
              <div className="space-y-4">
                
                {paymentMethod === 'BankTransfer' ? (
                  <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-lg border border-[#242b3b]">
                    <h4 className="font-bold text-sm text-white font-display">Treasury Wire Instructions:</h4>
                    <div className="space-y-1.5 text-xs text-gray-400 font-mono">
                      <p><span className="text-gray-500">Bank:</span> FIFA Escrow Union Bank Ltd</p>
                      <p><span className="text-gray-500">SWIFT/BIC:</span> FIFASW88XXX</p>
                      <p><span className="text-gray-500">Account Number:</span> 4829-1029-9231-1002</p>
                      <p><span className="text-gray-500">Beneficiary:</span> World Cup Trust Escrow fund</p>
                      <p><span className="text-gray-500">Transfer Memo:</span> OWN {country.name.toUpperCase()} SHARES</p>
                    </div>
                  </div>
                ) : (
                  /* Card fields */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 font-mono uppercase">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        className="w-full p-2.5 bg-[#151a26] border border-[#262f43] rounded-lg text-xs text-white uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 font-mono uppercase">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={16}
                          placeholder="4111 2222 3333 4444"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '') })}
                          className="w-full p-2.5 bg-[#151a26] border border-[#262f43] rounded-lg text-xs text-white font-mono"
                        />
                        <CreditCard className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 font-mono uppercase">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="12/28"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full p-2.5 bg-[#151a26] border border-[#262f43] rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 font-mono uppercase">Security CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          placeholder="***"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full p-2.5 bg-[#151a26] border border-[#262f43] rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Integrated OTP Form panel inside checkout */}
                    {otpSent && (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-lg space-y-2 mt-4">
                        <div className="text-xs text-amber-300 font-semibold flex items-center space-x-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>OTP Authentication Code Required</span>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Enter 6-digit OTP code"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full p-2 bg-black border border-amber-500/40 rounded text-center text-sm tracking-widest text-[#d4af37] font-bold font-mono"
                        />
                        {otpError && <p className="text-[11px] text-red-400 font-semibold">{otpError}</p>}
                        <p className="text-[10px] text-[#818a99] leading-relaxed">
                          Enter the code sent to your registered financial institution. Check the browser-alert modal simulator output.
                        </p>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions flow */}
            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-[#181d2a] hover:bg-[#202737] border border-[#2e3546] rounded-lg text-xs text-white transition-all cursor-pointer font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 text-black font-extrabold font-display rounded-lg text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
              >
                {paymentMethod === 'BankTransfer' 
                  ? 'Confirm Wired Transfer' 
                  : (otpSent ? 'Validate and Finalize' : 'Authorize Escrow holding')}
              </button>
            </div>

          </form>
        )}

        {/* STEP 3: TRANSACTION NOTARIZED & COMPLETED SUCCESS */}
        {step === 3 && (
          <div className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-bounce">
                <CheckCircle className="w-9 h-9" />
              </div>
            </div>

            <div className="space-y-1.5 px-4">
              <h4 className="text-xl font-extrabold text-[#22c55e] font-display">Escrow Allotment Secure!</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Permanent ownership records generated on our secure Escrow Ledger Node.
              </p>
            </div>

            {/* Visual certificate details */}
            <div className="bg-[#121622] rounded-lg border border-[#22293c] p-4 text-left space-y-3 max-w-sm mx-auto font-mono text-[11px] text-gray-400 relative">
              <div className="flex justify-between">
                <span>CERTIFICATE DEED:</span>
                <span className="text-white font-bold">FIFA-WCS-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between">
                <span>NATION OWNED:</span>
                <span className="text-[#d4af37] font-bold">{country.flag} {country.name}</span>
              </div>
              <div className="flex justify-between">
                <span>QTY ALLOCATED:</span>
                <span className="text-white font-bold">{sharesCalculated.toFixed(4)} Shares</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-[#1b2230]">
                <span>CAPITAL CAPITALIZED:</span>
                <span className="text-white font-bold">${amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-amber-500">SETTLEMENT PAYLOAD:</span>
                <span className="text-emerald-400 font-bold">${potentialPayout.toLocaleString(undefined, { maximumFractionDigits: 2 })} (At Trophy Win)</span>
              </div>
            </div>

            <button
              onClick={handleFinalSuccessConfirm}
              className="w-full py-3.5 bg-[#d4af37] hover:brightness-110 active:scale-98 text-black font-extrabold font-display rounded-lg text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer"
            >
              Complete Registration & Update Portfolio
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
