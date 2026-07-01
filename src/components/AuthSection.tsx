import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Info
} from 'lucide-react';
import { Logo } from './Logo';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  ActionCodeSettings,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface AuthSectionProps {
  onAuthSuccess: (user: { email: string; displayName: string; uid: string; phoneNumber?: string }) => void;
  defaultIsSignUp?: boolean;
}

// Google Brand Icon SVG component for a high-end presentation
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function AuthSection({ onAuthSuccess, defaultIsSignUp = false }: AuthSectionProps) {
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  
  // State variables for email login/signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralCode, setReferralCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pending_referral_code') || '';
    }
    return '';
  });
  
  // Resend verification helper states
  const [canResendVerification, setCanResendVerification] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Sync isSignUp when prop changes
  useEffect(() => {
    setIsSignUp(defaultIsSignUp);
    setError('');
    setSuccessMsg('');
    setCanResendVerification(false);
  }, [defaultIsSignUp]);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Apply custom provider parameters if needed (optional)
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      onAuthSuccess({
        email: user.email || '',
        displayName: user.displayName || 'Investor',
        uid: user.uid,
      });
      setSuccessMsg('Successfully authenticated with Google!');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      let errMsg = err.message || 'An error occurred during Google Sign-In.';
      if (err.code === 'auth/popup-closed-by-user') {
        errMsg = 'The sign-in popup was closed before completing. Please try again.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errMsg = 'Popup request was cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        errMsg = 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Password reset handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!resetEmail) {
      setError("Please enter your email address to receive a secure password reset link.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccessMsg("We have dispatched a secure password-reset link to your email address.");
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

  // Email and password login/register submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setCanResendVerification(false);
    
    if (!email || !password) {
      setError('Please fill in all credential fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp && !displayName) {
      setError('Please specify your profile display name.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Register user
        if (referralCode) {
          sessionStorage.setItem('pending_referral_code', referralCode.trim().toUpperCase());
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update display name
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        
        // Send email verification with action code settings to redirect back to production
        try {
          const actionCodeSettings: ActionCodeSettings = {
            url: 'https://www.worldcupstock.space',
            handleCodeInApp: false,
          };
          await sendEmailVerification(userCredential.user, actionCodeSettings);
          console.log("Verification email sent successfully.");
        } catch (verifErr) {
          console.error("Failed to send verification email:", verifErr);
        }

        // Mandatory Verification: Sign out the user immediately so they cannot enter
        await auth.signOut();
        
        setSuccessMsg(`Your portfolio account has been successfully created! A secure verification email has been dispatched to ${email}. You must verify your email before logging in.`);
        setIsSignUp(false); // Go to login page
        setEmail(email);
        setPassword('');
      } else {
        // Login user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Check if verified
        if (!userCredential.user.emailVerified) {
          // Unverified! Sign out and display message
          await auth.signOut();
          setError("Your email address is unverified. You must verify your email before you are permitted to log in.");
          setCanResendVerification(true);
          setLoading(false);
          return;
        }

        // Logged in successfully
        onAuthSuccess({
          email: userCredential.user.email || email,
          displayName: userCredential.user.displayName || displayName || userCredential.user.email?.split('@')[0] || 'Investor',
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

  // Helper function to resend verification email for an unverified user
  const handleResendVerification = async () => {
    setError('');
    setSuccessMsg('');
    if (!email || !password) {
      setError("Please fill in your Email and Password above to resend verification.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://www.worldcupstock.space',
        handleCodeInApp: false,
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      await auth.signOut();
      setSuccessMsg(`A fresh verification link has been dispatched to ${email}. Please check your inbox.`);
      setCanResendVerification(false);
    } catch (err: any) {
      console.error("Resend verification error:", err);
      setError(err.message || "Failed to dispatch verification email. Please double check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-md mx-auto my-12 px-4 font-sans select-none"
    >
      
      {/* Decorative Golden Ring Emblem with fine outer glow */}
      <div className="flex justify-center mb-8">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative p-1.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] rounded-3xl shadow-[0_10px_35px_rgba(212,175,55,0.25)] flex items-center justify-center cursor-pointer"
        >
          <Logo size={68} />
        </motion.div>
      </div>

      {/* Main Glassmorphic Panel Card Container */}
      <div className="bg-[#101420]/95 border border-[#1f2538] p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        {/* Abstract Corner Light Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#d4af37]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#1f2538]/30 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold font-display text-white tracking-wide">
            {isForgotPasswordMode 
              ? 'Reset Your Password' 
              : isSignUp ? 'Create Portfolio Account' : 'Access Your Portfolio'
            }
          </h2>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {isForgotPasswordMode
              ? 'Enter your registered email address below, and we will send you a secure link to reset your password.'
              : isSignUp 
                ? 'Create a secure account to buy shares and track your World Cup investments.' 
                : 'Sign in to manage your portfolio and track your active holdings.'
            }
          </p>
        </div>

        {/* Auth Mode Toggle Tabs slider (Log In / Sign Up) */}
        {!isForgotPasswordMode && (
          <div className="relative grid grid-cols-2 bg-[#080a10] p-1 rounded-xl border border-white/5 mb-6 overflow-hidden">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-b from-[#fde68a] to-[#d4af37]"
              style={{
                left: isSignUp ? '50%' : '2px',
                right: isSignUp ? '2px' : '50%',
                width: 'calc(50% - 4px)'
              }}
            />
            <button
              type="button"
              onClick={() => { 
                setIsSignUp(false); 
                setError(''); 
                setSuccessMsg(''); 
                setCanResendVerification(false);
              }}
              className={`relative z-10 py-2.5 text-xs font-semibold rounded uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                !isSignUp ? 'text-black font-extrabold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { 
                setIsSignUp(true); 
                setError(''); 
                setSuccessMsg(''); 
                setCanResendVerification(false);
              }}
              className={`relative z-10 py-2.5 text-xs font-semibold rounded uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isSignUp ? 'text-black font-extrabold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-4 p-3.5 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-xl flex flex-col items-start space-y-2 overflow-hidden"
            >
              <div className="flex items-start space-x-2.5">
                <span className="font-extrabold font-mono uppercase bg-red-500 text-black px-1.5 py-0.5 rounded text-[8px] tracking-wider mt-0.5 shrink-0">ERROR</span>
                <span className="flex-1 text-left font-medium leading-relaxed">{error}</span>
              </div>
              {canResendVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="mt-1 text-xs font-extrabold text-[#d4af37] hover:text-white underline cursor-pointer flex items-center space-x-1"
                >
                  <span>Resend Verification Email 📧</span>
                </button>
              )}
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-4 p-3.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl flex items-center space-x-2.5 overflow-hidden"
            >
              <span className="font-extrabold font-mono uppercase bg-emerald-500 text-black px-1.5 py-0.5 rounded text-[8px] tracking-wider shrink-0">SUCCESS</span>
              <span className="flex-1 text-left font-medium leading-relaxed">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isForgotPasswordMode ? (
          /* ==================== FORGOTTEN PASSWORD SECTION ==================== */
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[#9ca2af] text-left">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="developer@fifastocks.com"
                  className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10 font-medium transition-all duration-200"
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
          /* ==================== STANDARD AUTH SECTIONS ==================== */
          <div className="space-y-5">
            
            {/* EMAIL SIGN-IN/SIGN-UP FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignUp && (
                <div className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-400 text-left">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10 font-medium transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {isSignUp && (
                <div className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-400 text-left">Referral Code (Optional)</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. USERCODE"
                      className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10 font-medium uppercase font-mono transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[#9ca2af] text-left">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@fifastocks.com"
                    className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10 font-medium transition-all duration-200"
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
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-11 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10 font-medium transition-all duration-200"
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

              {/* TASK 4: Email Verification Notice (Renders on the Create Account page with a highly professional look) */}
              {isSignUp && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-[#141d30] border border-[#2b3a5a] text-gray-300 rounded-xl text-left leading-relaxed relative overflow-hidden flex items-start space-x-3 shadow-inner"
                >
                  <Info className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#d4af37] block">Important Account Activation Info 📧</span>
                    <p className="text-[11px] text-gray-300 leading-normal">
                      After creating your account, a verification email will be sent automatically.
                    </p>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      If you do not find it in your Inbox within a few minutes, please check your <span className="font-semibold text-gray-300">Spam or Junk folder</span>.
                    </p>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      After verifying your email address, return here and log in.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-b from-[#fde68a] to-[#d4af37] hover:from-white hover:to-[#fbbf24] active:scale-[0.99] text-black font-extrabold rounded-xl transition-all duration-300 text-xs font-display uppercase tracking-wider shadow-[0_10px_20px_rgba(212,175,55,0.15)] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
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
          </div>
        )}

        {/* Security Audit Note */}
        <div className="mt-8 flex justify-center items-center space-x-1.5 text-[10px] text-gray-500 font-mono tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Secured with Industry-Standard Encryption</span>
        </div>

      </div>
    </motion.div>
  );
}
