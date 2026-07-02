import React, { useState } from 'react';
import { 
  Ticket, 
  Upload, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  HelpCircle, 
  Search, 
  FileText, 
  Mail, 
  Clock, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { createSupportTicket } from '../lib/firebase-service';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface SupportCenterProps {
  currentUser: { email: string; displayName: string; uid: string } | null;
  onNavigateLogin?: () => void;
}

export default function SupportCenter({ currentUser, onNavigateLogin }: SupportCenterProps) {
  // Support ticket form states
  const [supportFullName, setSupportFullName] = useState(currentUser?.displayName || '');
  const [supportEmail, setSupportEmail] = useState(currentUser?.email || '');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportScreenshot, setSupportScreenshot] = useState<string | null>(null);
  const [supportScreenshotName, setSupportScreenshotName] = useState<string | null>(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportSuccess, setSupportSuccess] = useState<{ ticketId: string; message: string } | null>(null);

  // Drag-and-drop / File upload helpers
  const [dragActive, setDragActive] = useState(false);

  // Ticket status check states
  const [searchTicketId, setSearchTicketId] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // FAQ accordion states
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setSupportError("Only image files are permitted as screenshots.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSupportError("The screenshot exceeds the 5MB size limit.");
      return;
    }

    setSupportScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSupportScreenshot(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSearchTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketId.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchedTicket(null);

    try {
      const ticketRef = doc(db, 'tickets', searchTicketId.trim().toUpperCase());
      const snap = await getDoc(ticketRef);
      if (snap.exists()) {
        setSearchedTicket(snap.data());
      } else {
        setSearchError("No ticket found with that Ticket ID. Please double check the ID.");
      }
    } catch (err: any) {
      setSearchError(err.message || "Failed to search for support ticket.");
    } finally {
      setSearchLoading(false);
    }
  };

  const faqs = [
    {
      q: "How are World Cup Equities priced?",
      a: "Each country share represents equity tied to their tournament survival. Prices fluctuate between $1.00 and $100.00 in real-time based on public buy/sell orders, match predictions, and game outcomes."
    },
    {
      q: "How is the 15% referral bonus paid?",
      a: "Whenever a user you invited signs up with your code and submits their first verified investment, 15% of that payment is automatically computed on our backend and credited to your Referral Wallet instantly."
    },
    {
      q: "Why is there a withdrawal threshold?",
      a: "To prevent self-referrals and account duplication exploits, referral balance transfers require a minimum of 10 successful qualifying referrals to become unlocked."
    },
    {
      q: "Is there support available over phone?",
      a: "Our core compliance team operates strictly via our electronic dispatch desk to ensure a permanent cryptographic audit trail of all technical queries and investment settlements."
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-[#0d121e] to-[#04060a] border border-[#1f273b] rounded-2xl p-8 overflow-hidden shadow-2xl text-left">
        <div className="absolute top-0 right-0 w-80 h-full bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] text-[#d4af37] font-extrabold tracking-widest uppercase font-mono block">COMPLIANCE & ASSISTANCE</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mt-1.5 font-display">
            Official Support Desk
          </h1>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Submit secure technical tickets, check resolution status, or retrieve documentation directly through our audited communications channel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Support Form Column */}
        <div className="lg:col-span-2 bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl space-y-6">
          <div className="text-left">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#d4af37]" />
              Open a Support Ticket
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Submit an official inquiry. Our desk dispatches inquiries to <span className="text-[#d4af37] font-semibold font-mono">Support@worldcupstock.space</span> and tracks ticket statuses.
            </p>
          </div>

          {supportSuccess ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-4 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Support Ticket Created Successfully!</h4>
                <p className="text-xs text-gray-400">
                  Your inquiry has been assigned <strong>Ticket ID: <span className="text-white font-mono bg-[#080a10] px-2 py-0.5 border border-white/10 rounded">{supportSuccess.ticketId}</span></strong> and securely archived.
                </p>
              </div>
              <p className="text-xs text-[#d4af37] font-medium bg-[#080a10] border border-white/5 p-3.5 rounded-lg max-w-md mx-auto leading-relaxed">
                {supportSuccess.message}
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const emailTo = "Support@worldcupstock.space";
                    const emailSubject = `RE: Support Ticket [${supportSuccess.ticketId}] - ${supportSubject}`;
                    const emailBody = `Dear Support Team,

I am writing regarding a technical inquiry on the FIFA World Cup Equity Platform.

--- SUPPORT TICKET DETAILS ---
Ticket ID: ${supportSuccess.ticketId}
Submitted By: ${supportFullName} (${supportEmail})
Subject: ${supportSubject}

--- INQUIRY MESSAGE ---
${supportMessage}

------------------------------
Screenshot Attached: ${supportScreenshotName ? `Yes, "${supportScreenshotName}" (attached file via application)` : 'No'}
------------------------------

Best regards,
${supportFullName}`;
                    window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                  }}
                  className="bg-gradient-to-r from-[#d4af37] via-[#fde68a] to-[#d4af37] hover:brightness-110 active:scale-98 text-black text-xs font-extrabold uppercase tracking-widest px-6 py-3 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Launch Mail App</span>
                </button>
                <button
                  onClick={() => {
                    setSupportSuccess(null);
                    setSupportSubject('');
                    setSupportMessage('');
                    setSupportScreenshot(null);
                    setSupportScreenshotName(null);
                  }}
                  className="bg-[#1c2335] hover:bg-[#d4af37] hover:text-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg transition-all cursor-pointer"
                >
                  Open Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!supportSubject || !supportMessage) {
                  setSupportError("Please specify a subject and describe your inquiry.");
                  return;
                }

                setSupportLoading(true);
                setSupportError(null);

                let ticketId = 'TIC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                try {
                  const dbTicketId = await createSupportTicket(currentUser?.uid || 'Anonymous', {
                    fullName: supportFullName,
                    email: supportEmail,
                    subject: supportSubject,
                    message: supportMessage,
                    screenshot: supportScreenshot || undefined
                  });
                  if (dbTicketId) {
                    ticketId = dbTicketId;
                  }
                } catch (err: any) {
                  console.warn("Firestore ticket creation fallback activated:", err);
                }

                const emailTo = "Support@worldcupstock.space";
                const emailSubject = `RE: Support Ticket [${ticketId}] - ${supportSubject}`;
                const emailBody = `Dear Support Team,

I am writing regarding a technical inquiry on the FIFA World Cup Equity Platform.

--- SUPPORT TICKET DETAILS ---
Ticket ID: ${ticketId}
Submitted By: ${supportFullName} (${supportEmail})
Subject: ${supportSubject}

--- INQUIRY MESSAGE ---
${supportMessage}

------------------------------
Screenshot Attached: ${supportScreenshotName ? `Yes, "${supportScreenshotName}" (attached file via application)` : 'No'}
------------------------------

Best regards,
${supportFullName}`;

                const mailtoUrl = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

                setSupportSuccess({
                  ticketId,
                  message: `A support ticket draft has been created. Click "Launch Mail App" below if your default mail application didn't open automatically.`
                });

                setSupportLoading(false);

                // Open default email client
                window.location.href = mailtoUrl;
              }}
              className="space-y-4.5 pt-4 border-t border-[#1c2335]"
            >
              {supportError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-left">
                  {supportError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={supportFullName}
                    onChange={(e) => setSupportFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Your Email Address</label>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="contact@email.com"
                    className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Inquiry Subject</label>
                <select
                  required
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-medium"
                >
                  <option value="">-- Select Inquiry Subject Category --</option>
                  <option value="Investment Purchase Issue">Investment Purchase Issue</option>
                  <option value="Stripe Checkout Redirection">Stripe Checkout Redirection</option>
                  <option value="Account Verification & 2FA">Account Verification & 2FA</option>
                  <option value="Referral Code & Wallet Bonuses">Referral Code & Wallet Bonuses</option>
                  <option value="Security Logs Auditing">Security Logs Auditing</option>
                  <option value="General Technical Question">General Technical Question</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Detailed Description</label>
                <textarea
                  required
                  rows={5}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Please write the complete details of your technical issue, transaction IDs, or inquiry so our desk can review and respond immediately."
                  className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] resize-none leading-relaxed"
                />
              </div>

              {/* Screenshot Upload / Drag & Drop area */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Screenshot / Document Attachment (Optional)</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all relative ${
                    dragActive 
                      ? 'border-[#d4af37] bg-amber-500/5' 
                      : supportScreenshot 
                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                        : 'border-white/10 hover:border-white/20 bg-[#080a10]'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload-support-unified"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {supportScreenshot ? (
                    <div className="space-y-3">
                      <img 
                        src={supportScreenshot} 
                        alt="Screenshot Preview" 
                        className="w-24 h-24 object-cover mx-auto rounded-lg border border-white/10 shadow" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-xs">
                        <span className="text-emerald-400 font-bold block">✓ Attachment Loaded</span>
                        <span className="text-gray-500 font-mono text-[10px] truncate block max-w-xs mx-auto">{supportScreenshotName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSupportScreenshot(null);
                          setSupportScreenshotName(null);
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider"
                      >
                        Remove Attachment
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload-support-unified" className="cursor-pointer block space-y-2">
                      <Upload className="w-8 h-8 text-gray-500 mx-auto" />
                      <div className="text-xs">
                        <span className="text-[#d4af37] font-bold">Upload a Screenshot</span> or drag and drop here
                      </div>
                      <div className="text-[10px] text-gray-600 font-mono">
                        PNG, JPG, or JPEG up to 5MB
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={supportLoading}
                  className="bg-gradient-to-r from-[#fde68a] to-[#d4af37] text-black font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/10 hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {supportLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Technical Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar Status Checker & FAQ */}
        <div className="space-y-6">
          
          {/* Ticket Status Check Card */}
          <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl text-left space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-[#d4af37] uppercase tracking-widest font-display">Check Ticket Status</h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Enter your secure Ticket ID to retrieve real-time status updates from our ledger database.
              </p>
            </div>

            <form onSubmit={handleSearchTicket} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. TKT-123456"
                  value={searchTicketId}
                  onChange={(e) => setSearchTicketId(e.target.value)}
                  className="w-full bg-[#080a10] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-white cursor-pointer"
                >
                  {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </form>

            {searchError && (
              <p className="text-[10px] text-red-400 bg-red-500/5 p-2.5 rounded-lg border border-red-500/10 font-medium">
                {searchError}
              </p>
            )}

            {searchedTicket && (
              <div className="bg-[#121622] p-4 rounded-xl border border-[#21293c] space-y-3.5 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 font-mono">{searchedTicket.id}</span>
                  <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                    searchedTicket.status === 'Open' 
                      ? 'bg-amber-500/10 text-[#d4af37] border border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {searchedTicket.status}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase font-black block">Inquiry Subject</span>
                  <span className="text-xs font-bold text-white block">{searchedTicket.subject}</span>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-[#1c2335]">
                  <span className="text-[9px] text-gray-500 uppercase font-black block">Message Sent</span>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-medium line-clamp-3">{searchedTicket.message}</p>
                </div>

                <div className="p-2.5 bg-[#080a10] border border-white/5 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Submitted: {new Date(searchedTicket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact support direct information */}
          <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl text-left space-y-4">
            <h3 className="text-xs font-extrabold text-[#d4af37] uppercase tracking-widest font-display">Contact Support</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-black block">Direct Inquiry Dispatch</span>
                  <a href="mailto:Support@worldcupstock.space" className="text-xs font-mono text-[#d4af37] hover:underline font-bold">
                    Support@worldcupstock.space
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ section */}
          <div className="bg-[#0c0f17] p-6 rounded-2xl border border-[#202737] shadow-xl text-left space-y-4">
            <h3 className="text-xs font-extrabold text-[#d4af37] uppercase tracking-widest font-display">Frequently Asked Questions</h3>
            <div className="space-y-2.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-[#1c2335] pb-2.5 last:border-b-0 last:pb-0">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex justify-between items-center text-left text-xs text-white font-bold hover:text-[#d4af37] transition-colors cursor-pointer py-1"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium mt-1.5 pl-1 animate-in slide-in-from-top-1 duration-150">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
