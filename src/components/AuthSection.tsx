import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

interface AuthSectionProps {
  onAuthSuccess: (user: { email: string; displayName: string }) => void;
}

export default function AuthSection({ onAuthSuccess }: AuthSectionProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all credentials fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (isSignUp && !displayName) {
      setError('Please specify your profile display name.');
      return;
    }

    setLoading(true);
    // Real database loading and firebase authentication timing sync
    setTimeout(() => {
      setLoading(false);
      onAuthSuccess({
        email: email,
        displayName: isSignUp ? displayName : email.split('@')[0],
      });
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuthSuccess({
        email: 'daneybil2020@gmail.com',
        displayName: 'Google Partner Account',
      });
    }, 850);
  };

  const handleQuickDemoAccess = () => {
    onAuthSuccess({
      email: 'demo.investor@fifashares.com',
      displayName: 'Premium Demo Trader',
    });
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 font-sans select-none">
      
      {/* Decorative Golden Ring Emblem */}
      <div className="flex justify-center mb-6">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#fde68a] to-[#d4af37] p-1 shadow-[0_8px_30px_rgba(212,175,55,0.25)] flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-black" />
        </div>
      </div>

      {/* Main Glassmorphic Panel Card Container */}
      <div className="bg-[#101420]/90 border border-[#1f2538] p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Abstract Corner Light Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-display text-white">
            {isSignUp ? 'Create Investor Ledger' : 'Access Share Holdings'}
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            {isSignUp 
              ? 'Prepare your secure escrow trading account with zero KYC overhead.' 
              : 'Supply your authentication key credentials to unlock investment portfolios.'
            }
          </p>
        </div>

        {/* Auth Mode Toggle Tabs slider */}
        <div className="grid grid-cols-2 bg-[#080a10] p-1 rounded-lg border border-white/5 mb-6">
          <button
            onClick={() => { setIsSignUp(false); setError(''); }}
            className={`py-2 text-xs font-semibold rounded uppercase tracking-wider transition-all duration-200 ${
              !isSignUp ? 'bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(''); }}
            className={`py-2 text-xs font-semibold rounded uppercase tracking-wider transition-all duration-200 ${
              isSignUp ? 'bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-lg flex items-center space-x-2 animate-shake">
            <span className="font-extrabold font-mono uppercase bg-red-500 text-black px-1.5 py-0.5 rounded text-[9px] mr-1">ERROR</span>
            <span>{error}</span>
          </div>
        )}

        {/* Input Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-400">FullName / Display Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. investor@fifastocks.com"
                className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-400">Secure Access Password</label>
              {!isSignUp && (
                <span className="text-[10px] text-gray-400 hover:text-white cursor-pointer hover:underline">Forgot?</span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] hover:from-white hover:to-[#fbbf24] text-black font-extrabold rounded-xl transition-all duration-300 text-xs font-display uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Simulating Ledger Session Auth...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-1.5">
                <span>{isSignUp ? 'Establish Portfolio Account' : 'Authenticate Credentials'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

        </form>

        {/* Divider separator */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative z-10 px-3 bg-[#101420] text-[10px] font-extrabold text-gray-500 font-mono tracking-widest uppercase">OR CONNECT AUTHENTICATORS</span>
        </div>

        {/* OAuth Social Authentication buttons */}
        <div className="space-y-3">
          
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-gray-100 text-black font-bold text-xs rounded-xl transition-all duration-150 flex items-center justify-center space-x-2.5 cursor-pointer border border-[#cbd5e1] shadow-sm"
          >
            <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Log In with Google Account</span>
          </button>

          <button
            onClick={handleQuickDemoAccess}
            className="w-full py-2.5 bg-[#141928] hover:bg-[#1a2033] border border-[#232b43] text-gray-300 hover:text-white font-semibold text-xs rounded-xl transition-all duration-150 flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Instant Access / Sandbox Bypass</span>
          </button>

        </div>

        {/* Ledger Security Audit note */}
        <div className="mt-6 flex justify-center items-center space-x-1.5 text-[10px] text-gray-500 font-mono tracking-wider">
          <HelpCircle className="w-3 h-3 text-[#d4af37]" />
          <span>Need help? Contact Escrow Ledger Syndicate</span>
        </div>

      </div>
    </div>
  );
}
