import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, HelpCircle, ArrowRight, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Logo } from './Logo';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';

interface AuthSectionProps {
  onAuthSuccess: (user: { email: string; displayName: string; uid: string }) => void;
}

export default function AuthSection({ onAuthSuccess }: AuthSectionProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralCode, setReferralCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pending_referral_code') || '';
    }
    return '';
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Password reset submit handler for the dedicated forgot password view
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!resetEmail) {
      setError("Please enter your email address to receive a reset link.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccessMsg("We have sent a secure password-reset link to your email address.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      let localizedError = err.message || "Failed to trigger password reset.";
      if (err.code === 'auth/user-not-found') {
        localizedError = "No account found with this email.";
      } else if (err.code === 'auth/invalid-email') {
        localizedError = "Please enter a valid email address.";
      }
      setError(localizedError);
    } finally {
      setLoading(false);
    }
  };

  // Email/Password login or registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!email || !password) {
      setError('Please fill in all credential fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp && !displayName) {
      setError('Please specify a profile display name.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Save the typed referral code in sessionStorage so it is picked up by getOrCreateUserProfile
        if (referralCode) {
          sessionStorage.setItem('pending_referral_code', referralCode.trim().toUpperCase());
        }
        // Register user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        
        try {
          await sendEmailVerification(userCredential.user);
          console.log("Verification email sent successfully.");
        } catch (verifErr) {
          console.error("Failed to send verification email:", verifErr);
        }
        
        // Pass info back
        onAuthSuccess({
          email: userCredential.user.email || email,
          displayName: displayName,
          uid: userCredential.user.uid
        });
      } else {
        // Login user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess({
          email: userCredential.user.email || email,
          displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Investor',
          uid: userCredential.user.uid
        });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let localizedError = err.message || "An authentication error occurred.";
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        localizedError = "Invalid email address or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        localizedError = "This email address is already registered.";
      } else if (err.code === 'auth/user-not-found') {
        localizedError = "No account found with this email.";
      }
      setError(localizedError);
    } finally {
      setLoading(false);
    }
  };

  // Google sign in integration
  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      onAuthSuccess({
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || 'Google Account',
        uid: userCredential.user.uid
      });
    } catch (err: any) {
      console.error("Google Auth error:", err);
      // Fallback or warning if popup blocked by sandbox/iframe
      setError("Please ensure you have allowed popups, or try the 'Open in a new tab' button at the top right, as browser sandboxes in the preview iframe may restrict Google Auth Popups. Alternatively, register or log in with Email Credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Password reset implementation
  const handleForgotPassword = async () => {
    setError('');
    setSuccessMsg('');
    if (!email) {
      setError("Please input your email address above to receive a reset dispatch link.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("We sent a secure password-reset link to your email registry.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to trigger password reset dispatch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 font-sans select-none animate-fade-in">
      
      {/* Decorative Golden Ring Emblem */}
      <div className="flex justify-center mb-6">
        <div className="relative p-1 bg-gradient-to-b from-[#fde68a] to-[#d4af37] rounded-3xl shadow-[0_8px_30px_rgba(212,175,55,0.4)] flex items-center justify-center">
          <Logo size={72} />
        </div>
      </div>

      {/* Main Glassmorphic Panel Card Container */}
      <div className="bg-[#101420]/90 border border-[#1f2538] p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Abstract Corner Light Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-display text-white">
            {isForgotPasswordMode 
              ? 'Reset Your Password' 
              : isSignUp ? 'Create Portfolio Account' : 'Access Your Portfolio'
            }
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            {isForgotPasswordMode
              ? 'Enter your registered email address below, and we will send you a secure link to reset your password.'
              : isSignUp 
                ? 'Create a secure account to buy shares and track your World Cup investments.' 
                : 'Sign in to manage your portfolio and track your active holdings.'
            }
          </p>
        </div>

        {/* Auth Mode Toggle Tabs slider */}
        {!isForgotPasswordMode && (
          <div className="grid grid-cols-2 bg-[#080a10] p-1 rounded-lg border border-white/5 mb-6">
            <button
              onClick={() => { setIsSignUp(false); setError(''); setSuccessMsg(''); }}
              className={`py-2 text-xs font-semibold rounded uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                !isSignUp ? 'bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); setSuccessMsg(''); }}
              className={`py-2 text-xs font-semibold rounded uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isSignUp ? 'bg-gradient-to-b from-[#fde68a] to-[#d4af37] text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-lg flex items-center space-x-2">
            <span className="font-extrabold font-mono uppercase bg-red-500 text-black px-1.5 py-0.5 rounded text-[9px] mr-1">ERROR</span>
            <span className="flex-1 text-left">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs rounded-lg flex items-center space-x-2">
            <span className="font-extrabold font-mono uppercase bg-emerald-500 text-black px-1.5 py-0.5 rounded text-[9px] mr-1">SUCCESS</span>
            <span className="flex-1 text-left">{successMsg}</span>
          </div>
        )}

        {isForgotPasswordMode ? (
          /* ==================== FORGOTTEN PASSWORD SECTION ==================== */
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[#9ca2af] text-left">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="developer@fifastocks.com"
                  className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium"
                />
              </div>
            </div>

            {/* Reset Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] hover:from-white hover:to-[#fbbf24] text-black font-extrabold rounded-xl transition-all duration-300 text-xs font-display uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-1.5">
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setIsForgotPasswordMode(false); setError(''); setSuccessMsg(''); }}
                className="text-xs font-bold text-[#d4af37] hover:text-white cursor-pointer hover:underline focus:outline-none"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Input Credentials Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-400 text-left">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium"
                  />
                </div>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-400 text-left">Referral Code (Optional)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. USERCODE"
                    className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium uppercase font-mono"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[#9ca2af] text-left">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@fifastocks.com"
                  className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-400">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => { setIsForgotPasswordMode(true); setError(''); setSuccessMsg(''); if (email) setResetEmail(email); }}
                    className="text-[10px] text-gray-400 hover:text-white cursor-pointer hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-[#d4af37] focus:outline-none transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-[10.5px] text-gray-400 rounded-lg text-left leading-relaxed">
                <span className="text-amber-500 font-bold uppercase tracking-wider block mb-0.5">Verification Dispatch Tip 📧</span>
                Upon successful sign-up, a secure verification link will be dispatched. If you do not see the verification email, please check your spam folder or junk folder as it is dispatched securely.
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] hover:from-white hover:to-[#fbbf24] text-black font-extrabold rounded-xl transition-all duration-300 text-xs font-display uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-1.5">
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

          </form>
        )}

        {/* Divider separator */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative z-10 px-3 bg-[#101420] text-[10px] font-extrabold text-gray-500 font-mono tracking-widest uppercase">OR CONNECT</span>
        </div>

        {/* Google sign-in backup */}
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
            <span>Sign In with Google</span>
          </button>

        </div>

        {/* Security Audit note */}
        <div className="mt-6 flex justify-center items-center space-x-1.5 text-[10px] text-gray-500 font-mono tracking-wider">
          <HelpCircle className="w-3 h-3 text-[#d4af37]" />
          <span>Secured with Industry-Standard Encryption</span>
        </div>

      </div>
    </div>
  );
}
