import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Wallet, 
  Copy, 
  Check, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Lock, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Mail,
  Link,
  MessageSquare,
  Share2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getOrCreateUserProfile } from '../lib/firebase-service';

interface ReferralProgramProps {
  currentUser: { email: string; displayName: string; uid: string } | null;
  onNavigateLogin?: () => void;
  onCompletePurchase?: () => void; // Trigger sync in App.tsx
}

export default function ReferralProgram({ currentUser, onNavigateLogin, onCompletePurchase }: ReferralProgramProps) {
  // Local profile states
  const [userProfile, setUserProfile] = useState<{
    referralCode?: string;
    referralWallet?: number;
    referralCount?: number;
    referralEarnings?: number;
  }>({
    referralCode: '',
    referralWallet: 0,
    referralCount: 0,
    referralEarnings: 0
  });

  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Withdrawal states
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Sync profile data if logged in
  useEffect(() => {
    if (!currentUser) return;

    const loadProfileData = async () => {
      setLoading(true);
      try {
        const profile = await getOrCreateUserProfile(currentUser.uid, currentUser.email || '', currentUser.displayName || '');
        setUserProfile({
          referralCode: profile.referralCode || '',
          referralWallet: profile.referralWallet || 0,
          referralCount: profile.referralCount || 0,
          referralEarnings: profile.referralEarnings || 0
        });
      } catch (err) {
        console.error("Error loading user profile doc in ReferralProgram page:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [currentUser]);

  const handleWithdrawReferrals = async () => {
    if (!currentUser) return;
    setWithdrawLoading(true);
    setWithdrawSuccess(null);
    setWithdrawError(null);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const currentWallet = data.referralWallet || 0;
        const currentBalance = data.balance || 0;
        const currentCount = data.referralCount || 0;

        if (currentCount < 10) {
          throw new Error(`Withdrawal Locked: You need 10 successful referrals. (Current: ${currentCount}/10)`);
        }
        if (currentWallet <= 0) {
          throw new Error("Withdrawal Failed: No referral earnings available to withdraw.");
        }

        await updateDoc(userRef, {
          referralWallet: 0,
          balance: currentBalance + currentWallet
        });

        // Create notification
        const notifId = 'NOTIF-WITHDRAW-' + Math.floor(100000 + Math.random() * 900000);
        await updateDoc(userRef, {
          [`notifications.${notifId}`]: {
            id: notifId,
            userId: currentUser.uid,
            title: "Referral Withdrawal Successful!",
            message: `Your referral balance of $${currentWallet.toFixed(2)} has been successfully transferred to your main investment balance.`,
            type: 'success',
            timestamp: new Date().toLocaleString(),
            read: false
          }
        });

        setUserProfile(prev => ({
          ...prev,
          referralWallet: 0
        }));

        setWithdrawSuccess(`Success! $${currentWallet.toFixed(2)} has been securely transferred to your main wallet balance.`);
        if (onCompletePurchase) {
          onCompletePurchase(); // Syncs global cash balance layout immediately
        }
      }
    } catch (err: any) {
      setWithdrawError(err.message || "Failed to process withdrawal.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const referralCodeToShow = currentUser ? (userProfile.referralCode || 'WCS-PENDING') : 'WCS-GUESTCODE';
  const referralLinkToShow = `${window.location.origin}?ref=${referralCodeToShow}`;
  const promoMessage = `🏆 FIFA World Cup Stock Share Platform ⚽

I'm inviting you to join the official FIFA World Cup Country Stock Share platform! 

This is a unique opportunity available exclusively during the World Cup tournament, which concludes with the grand Final on 19 July.

📈 How it works:
- Invest in countries you believe will perform well.
- Buy shares in one or multiple competing nations.
- Watch share values adjust in real-time as team survival is determined!

Join early to secure your country shares and be part of this premium investment opportunity.

Register your secure investor account now using my referral link:
${referralLinkToShow}`;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-[#0d121e] to-[#04060a] border border-[#1f273b] rounded-2xl p-8 overflow-hidden shadow-2xl text-left">
        <div className="absolute top-0 right-0 w-80 h-full bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] text-[#d4af37] font-extrabold tracking-widest uppercase font-mono block">AMPLIFY YOUR CAPITALS</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mt-1.5 font-display flex items-center gap-2">
            <Gift className="w-7 h-7 text-[#d4af37]" />
            Refer & Earn Program
          </h1>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Invite fellow sports investors to join the World Cup Equities ledger. Whenever your referee places their first successful share purchase, you automatically receive a 15% wallet bonus.
          </p>
        </div>
      </div>

      {/* Guest Mode Overlay / Sign Up CTA */}
      {!currentUser && (
        <div className="bg-[#10131c]/60 border-2 border-dashed border-[#d4af37]/35 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-white text-base uppercase tracking-widest font-display">Get Your Referral Code</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
              Please register or log in to a secure investor profile to activate your unique cryptographic referral code and start earning 15% share purchase bonuses!
            </p>
          </div>
          <div>
            <button
              onClick={onNavigateLogin}
              className="px-6 py-3 bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-black text-xs rounded-xl hover:brightness-110 shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer uppercase tracking-widest inline-flex items-center gap-1.5"
            >
              <span>Activate Referral Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Program Dashboard Area */}
      <div className={`space-y-6 ${!currentUser ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-left">
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display">
                Your Direct Referral Network
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                Copy your unique affiliate parameters to start expanding your investment syndicate.
              </p>
            </div>
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-[#d4af37] px-3 py-1.5 rounded-full uppercase font-extrabold self-start md:self-auto tracking-wider">
              15% Referral Fee Paid 🎁
            </span>
          </div>

          {/* Referral Link & Code Copy Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#1c2335]">
            <div className="bg-[#121622] p-4.5 rounded-xl border border-[#21293c] space-y-3">
              <span className="text-[10px] font-extrabold text-[#d4af37] uppercase tracking-wider block text-left">Your Unique Referral Code</span>
              <div className="flex items-center gap-3">
                <div className="bg-[#080a10] border border-white/10 px-4 py-3 rounded-lg text-sm font-mono font-black text-white flex-grow tracking-widest text-center select-all">
                  {referralCodeToShow}
                </div>
                <button
                  disabled={!currentUser}
                  onClick={() => {
                    navigator.clipboard.writeText(referralCodeToShow);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="bg-[#1c2335] hover:bg-[#d4af37] hover:text-black border border-white/10 px-4 py-3.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 text-left">Instruct new investors to input this code during registration.</p>
            </div>

            <div className="bg-[#121622] p-4.5 rounded-xl border border-[#21293c] space-y-3">
              <span className="text-[10px] font-extrabold text-[#d4af37] uppercase tracking-wider block text-left">Your Direct Invitation Link</span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="bg-[#080a10] border border-white/10 px-3 py-3 rounded-lg text-xs font-mono text-gray-400 flex-grow truncate select-all text-left flex items-center">
                  {referralLinkToShow}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!currentUser}
                    onClick={() => {
                      navigator.clipboard.writeText(referralLinkToShow);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="flex-1 sm:flex-initial bg-[#1c2335] hover:bg-white/10 border border-white/10 px-4 py-3.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                    title="Copy Link to Clipboard"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'COPIED' : 'COPY'}
                  </button>
                  <button
                    disabled={!currentUser}
                    onClick={async () => {
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: 'FIFA World Cup Stock Share',
                            text: promoMessage,
                            url: referralLinkToShow
                          });
                        } catch (err) {
                          console.log('Native share failed or dismissed:', err);
                        }
                      } else {
                        // Smooth scroll down to community sharing redirects if native share is not available
                        const el = document.getElementById('social-share-section');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
                    className="flex-1 sm:flex-initial bg-[#d4af37] hover:bg-white text-black font-extrabold px-4 py-3.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                    title="Share Link on Social Media"
                  >
                    <Share2 className="w-4 h-4" />
                    SHARE
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 text-left">Automatically pre-fills your unique referral code upon landing.</p>
            </div>
          </div>

          {/* 1-Click Social Sharing Section */}
          <div id="social-share-section" className="pt-6 border-t border-[#1c2335] space-y-4">
            <div className="text-left">
              <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                1-Click Social Sharing
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Instantly distribute your direct affiliate link across major communities using our persuasive tournament-ready message.
              </p>
            </div>

            <div className="bg-[#121622] p-4.5 rounded-xl border border-[#21293c] space-y-4 text-left">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-[#d4af37] uppercase tracking-wider block">
                  Message Preview
                </span>
                <div className="bg-[#080a10] border border-white/10 p-3.5 rounded-lg text-xs font-mono text-gray-400 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap select-all">
                  {promoMessage}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(promoMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#0c101b] hover:bg-[#25D366]/20 border border-[#25D366]/30 hover:border-[#25D366] text-white hover:text-[#25D366] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                >
                  <MessageSquare className="w-5 h-5 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLinkToShow)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#0c101b] hover:bg-[#1877F2]/20 border border-[#1877F2]/30 hover:border-[#1877F2] text-white hover:text-[#1877F2] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Facebook className="w-5 h-5 text-[#1877F2]" />
                  <span>Facebook</span>
                </a>

                {/* Twitter (X) */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(promoMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#0c101b] hover:bg-white/10 border border-white/20 hover:border-white text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Twitter className="w-5 h-5 text-gray-300" />
                  <span>X (Twitter)</span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralLinkToShow)}&text=${encodeURIComponent(promoMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#0c101b] hover:bg-[#0088cc]/20 border border-[#0088cc]/30 hover:border-[#0088cc] text-white hover:text-[#0088cc] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Send className="w-5 h-5 text-[#0088cc]" />
                  <span>Telegram</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLinkToShow)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#0c101b] hover:bg-[#0077b5]/20 border border-[#0077b5]/30 hover:border-[#0077b5] text-white hover:text-[#0077b5] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Linkedin className="w-5 h-5 text-[#0077b5]" />
                  <span>LinkedIn</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent("FIFA World Cup Stock Share Opportunity ⚽")}&body=${encodeURIComponent(promoMessage)}`}
                  className="p-3 bg-[#0c101b] hover:bg-[#d4af37]/20 border border-[#d4af37]/30 hover:border-[#d4af37] text-white hover:text-[#d4af37] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Mail className="w-5 h-5 text-[#d4af37]" />
                  <span>Email</span>
                </a>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(referralLinkToShow);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="p-3 bg-[#0c101b] hover:bg-[#d4af37] hover:text-black border border-white/10 hover:border-[#d4af37] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer text-white"
                >
                  {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Link className="w-5 h-5 text-gray-400" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Referral Wallet Stats Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#1c2335]">
            <div className="p-4.5 bg-[#121622] border border-[#21293c] rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Referrals</span>
              <div className="text-2xl font-black text-white font-display">
                {currentUser ? (userProfile.referralCount || 0) : 3}
              </div>
              <span className="text-[9px] text-gray-500 font-mono">Verified successful sign-ups</span>
            </div>

            <div className="p-4.5 bg-[#121622] border border-[#21293c] rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Referral Earnings</span>
              <div className="text-2xl font-black text-[#d4af37] font-display">
                ${(currentUser ? (userProfile.referralEarnings || 0) : 150.00).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[9px] text-gray-500 font-mono">15% share accrued historically</span>
            </div>

            <div className="p-4.5 bg-[#121622] border border-[#21293c] rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block">Referral Wallet Balance</span>
              <div className="text-2xl font-black text-emerald-400 font-display">
                ${(currentUser ? (userProfile.referralWallet || 0) : 150.00).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[9px] text-gray-500 font-mono">Available for secure withdrawal</span>
            </div>
          </div>

          {/* Withdrawal Rule Panel */}
          <div className="p-5 bg-[#111522] border border-[#21293c] rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Referral Withdrawal Threshold Rule</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  To safeguard against fraud, referral earnings can be unlocked for withdrawal after reaching <strong>10 successful qualifying referrals</strong>.
                </p>
              </div>
              <div className="shrink-0 self-start sm:self-auto bg-[#080a10] border border-white/10 px-4 py-2 rounded-lg text-xs font-mono">
                Progress: <strong className="text-[#d4af37]">{currentUser ? (userProfile.referralCount || 0) : 3}</strong> / <span className="text-gray-500 font-bold">10</span>
              </div>
            </div>

            {withdrawSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium text-left">
                {withdrawSuccess}
              </div>
            )}

            {withdrawError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium text-left">
                {withdrawError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                disabled={!currentUser || withdrawLoading || (userProfile.referralCount || 0) < 10 || (userProfile.referralWallet || 0) <= 0}
                onClick={handleWithdrawReferrals}
                className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  currentUser && (userProfile.referralCount || 0) >= 10 && (userProfile.referralWallet || 0) > 0
                    ? 'bg-gradient-to-r from-[#fde68a] to-[#d4af37] text-black font-extrabold shadow-lg shadow-amber-500/10 hover:brightness-110'
                    : 'bg-[#1b2234] text-gray-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                <Wallet className="w-4 h-4" />
                {withdrawLoading ? "Transferring..." : currentUser && (userProfile.referralCount || 0) >= 10 ? "Withdraw Referral Balance" : `Locked: Requires 10 Referrals (${currentUser ? (userProfile.referralCount || 0) : 3}/10)`}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
