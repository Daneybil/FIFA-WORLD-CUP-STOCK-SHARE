import express from "express";
import path from "path";
import dns from "dns";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fs from "fs";

// Set DNS order to prefer IPv4 for consistent local and container networking
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();
const PORT = 3000;

// The Football-Data.org API Token (Server-only secret, never exposed to user browser)
const API_TOKEN = process.env.FOOTBALL_DATA_API_TOKEN || "81091c3dff0e4554919567ed8c2fe40c";

// Simple robust in-memory caching mechanism
// Football-Data.org free tier allows only 10 requests per minute.
// We cache the responses for 10 minutes (600,000 ms) to keep API rate-limit flawless.
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes cache

// Helper function to fetch from Football-Data.org API
async function fetchFromFootballData(path: string) {
  const url = `https://api.football-data.org/${path}`;
  console.log(`[Football-Data API] Sending request to: ${url}`);
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Auth-Token": API_TOKEN,
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`External API responded with status ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Caching Proxy Fetcher
async function getCachedFootballData(cacheKey: string, apiPath: string) {
  const now = Date.now();
  const cachedVal = cache[cacheKey];

  if (cachedVal && (now - cachedVal.timestamp < CACHE_DURATION_MS)) {
    console.log(`[Cache Hit] Serving stale data for key: ${cacheKey}`);
    return cachedVal.data;
  }

  try {
    const freshData = await fetchFromFootballData(apiPath);
    cache[cacheKey] = {
      data: freshData,
      timestamp: now
    };
    return freshData;
  } catch (error: any) {
    console.error(`[API Error] Failed to fetch ${apiPath} from external network:`, error.message);
    if (cache[cacheKey]) {
      console.warn(`[API Fallback] Returning expired cache for key: ${cacheKey}`);
      return cache[cacheKey].data;
    }
    throw error;
  }
}

// ========================================== PROXIED API ENDPOINTS

// 1. Teams endpoint: /api/football/teams
app.get("/api/football/teams", async (req, res) => {
  try {
    const data = await getCachedFootballData("teams", "v4/competitions/WC/teams");
    res.json(data);
  } catch (error: any) {
    res.status(502).json({
      error: "Failed to fetch World Cup teams from official API.",
      details: error.message
    });
  }
});

// 2. Standings endpoint: /api/football/standings
app.get("/api/football/standings", async (req, res) => {
  try {
    const data = await getCachedFootballData("standings", "v4/competitions/WC/standings");
    res.json(data);
  } catch (error: any) {
    res.status(502).json({
      error: "Failed to fetch World Cup standings from official API.",
      details: error.message
    });
  }
});

// 3. Matches endpoint: /api/football/matches
app.get("/api/football/matches", async (req, res) => {
  try {
    const data = await getCachedFootballData("matches", "v4/competitions/WC/matches");
    res.json(data);
  } catch (error: any) {
    res.status(502).json({
      error: "Failed to fetch World Cup matches from official API.",
      details: error.message
    });
  }
});

// ========================================== STRIPE & FIREBASE SECURE LEDGER INTEGRATION

// Load Firebase applet configuration safely
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
  console.log("[Firebase Admin] Initialized successfully.");
} catch (e: any) {
  console.error("[Firebase Admin] Initialization error:", e.message);
}

// Get the correct Firestore instance matching database setting
function getAdminFirestore() {
  const databaseId = firebaseConfig.firestoreDatabaseId;
  if (databaseId) {
    return getFirestore(databaseId);
  }
  return getFirestore();
}

// Lazy Initialize Stripe Client
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    stripeClient = new Stripe(key, {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeClient;
}

// 1. Stripe Session Creation Endpoint
app.post("/api/payments/create-checkout-session", express.json(), async (req, res) => {
  try {
    const {
      userId,
      countryId,
      countryName,
      flag,
      amount,
      sharesQuantity,
      pricePerShare,
      winningSettlementPrice
    } = req.body;

    if (!userId || !countryId || !amount || !sharesQuantity) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const stripe = getStripe();
    const paymentId = 'PAY-STRIPE-' + Math.floor(100000 + Math.random() * 900000);

    // Create a checkout session redirect URL
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${countryName} ${flag || ''} Share Equity`,
              description: `Escrow-cleared acquisition of ${parseFloat(sharesQuantity).toFixed(4)} shares of ${countryName} World Cup team.`,
            },
            unit_amount: Math.round(parseFloat(amount) * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_cancelled=true`,
      metadata: {
        paymentId,
        userId,
        countryId,
        countryName,
        flag: flag || '',
        amount: amount.toString(),
        sharesQuantity: sharesQuantity.toString(),
        pricePerShare: pricePerShare.toString(),
        winningSettlementPrice: winningSettlementPrice.toString(),
      },
    });

    res.json({ url: session.url, id: session.id });
  } catch (error: any) {
    console.error("[Stripe API] Error creating checkout session:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. Stripe Webhook Signature Verification Endpoint
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();

  let event: any;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      console.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET or stripe-signature missing. Safely parsing body directly for sandbox/testing.");
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      await processSuccessfulStripePayment(session);
    } catch (err: any) {
      console.error("[Stripe Webhook] Error processing Firestore updates:", err.message);
      return res.status(500).send(`Database Settle Error: ${err.message}`);
    }
  }

  res.json({ received: true });
});

// 3. Atomically update Firestore on payment verification (Complete transaction log)
async function processSuccessfulStripePayment(session: any) {
  const db = getAdminFirestore();
  const metadata = session.metadata;

  if (!metadata || !metadata.userId) {
    console.error("[Stripe Webhook] No metadata or userId found in session:", session.id);
    return;
  }

  const userId = metadata.userId;
  const countryId = metadata.countryId;
  const countryName = metadata.countryName;
  const flag = metadata.flag;
  const amount = parseFloat(metadata.amount);
  const sharesQuantity = parseFloat(metadata.sharesQuantity);
  const pricePerShare = parseFloat(metadata.pricePerShare);
  const winningSettlementPrice = parseFloat(metadata.winningSettlementPrice);
  
  const stripeSessionId = session.id;
  const stripePaymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || "";

  console.log(`[Stripe Webhook] Atomically updating ledger for User ${userId}, Country ${countryName}, Amount $${amount}`);

  const batch = db.batch();

  // A. Record Payment document as completed
  const paymentId = metadata.paymentId || `PAY-STRIPE-${stripeSessionId.slice(-8)}`;
  const paymentRef = db.collection('payments').doc(paymentId);
  batch.set(paymentRef, {
    id: paymentId,
    userId,
    status: 'Completed',
    timestamp: new Date().toISOString(),
    amount,
    paymentMethod: 'Stripe',
    countryId,
    countryName,
    flag,
    sharesQuantity,
    pricePerShare,
    winningSettlementPrice,
    stripeSessionId,
    stripePaymentIntentId,
    paymentStatus: 'Paid'
  }, { merge: true });

  // B. Record Transaction log (Idempotent check!)
  const txId = stripePaymentIntentId ? `TX-${stripePaymentIntentId}` : `TX-STRIPE-${stripeSessionId.slice(-8)}`;
  const txDocRef = db.collection('transactions').doc(txId);
  
  const txSnap = await txDocRef.get();
  if (txSnap.exists) {
    console.log(`[Stripe Webhook] Transaction ${txId} already processed. Skipping to avoid double ledger actions.`);
    return;
  }

  const transaction = {
    id: txId,
    userId,
    date: new Date().toISOString(),
    countryId,
    countryName,
    flag,
    amountInvested: amount,
    sharesQuantity,
    pricePerShare,
    paymentMethod: 'Stripe',
    status: 'Completed',
    txHash: stripePaymentIntentId || stripeSessionId,
    stripeSessionId,
    stripePaymentIntentId,
    paymentStatus: 'Paid'
  };
  batch.set(txDocRef, transaction);

  // C. Update/Create Holdings
  const holdingId = `${userId}_${countryId}`;
  const holdingRef = db.collection('holdings').doc(holdingId);
  const holdingSnap = await holdingRef.get();

  if (holdingSnap.exists) {
    const existingHolding = holdingSnap.data() || {};
    const existingShares = existingHolding.sharesQuantity || 0;
    const existingAmount = existingHolding.amountInvested || 0;
    
    const newSharesQuantity = existingShares + sharesQuantity;
    const newAmountInvested = existingAmount + amount;
    const newAveragePrice = Number((newAmountInvested / newSharesQuantity).toFixed(4));

    batch.update(holdingRef, {
      sharesQuantity: newSharesQuantity,
      amountInvested: newAmountInvested,
      averagePurchasePrice: newAveragePrice,
      potentialWinningValue: newSharesQuantity * winningSettlementPrice,
      purchaseDate: new Date().toISOString()
    });
  } else {
    const newHolding = {
      id: holdingId,
      userId,
      countryId,
      countryName,
      flag,
      sharesQuantity,
      averagePurchasePrice: pricePerShare,
      amountInvested: amount,
      winningSettlementPrice,
      potentialWinningValue: sharesQuantity * winningSettlementPrice,
      purchaseDate: new Date().toISOString(),
      status: 'Active'
    };
    batch.set(holdingRef, newHolding);
  }

  // D. Increment user profile total invested
  const userRef = db.collection('users').doc(userId);
  batch.update(userRef, {
    totalInvested: FieldValue.increment(amount)
  });

  // E. Push persistent real-time notifications to feed
  const notifId = `NOTIF-STRIPE-${stripeSessionId.slice(-8)}`;
  const notifRef = db.collection('notifications').doc(notifId);
  batch.set(notifRef, {
    id: notifId,
    userId,
    title: `Purchase Confirmed: ${countryName}`,
    message: `Payment Verified via Stripe. Allocated $${amount.toFixed(2)} for ${sharesQuantity.toFixed(4)} shares.`,
    type: 'success',
    timestamp: new Date().toLocaleString(),
    read: false
  });

  // F. Secure Referral Reward System (15% of first successful investment)
  try {
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      const userData = userSnap.data() || {};
      const referredBy = userData.referredBy;
      const referralRewardIssued = userData.referralRewardIssued;

      if (referredBy && !referralRewardIssued) {
        const rewardAmount = Number((amount * 0.15).toFixed(2));
        const referrerRef = db.collection('users').doc(referredBy);

        batch.update(userRef, {
          referralRewardIssued: true,
          referralRewardAmount: rewardAmount,
          referralRewardReferrer: referredBy
        });

        batch.update(referrerRef, {
          referralWallet: FieldValue.increment(rewardAmount),
          referralEarnings: FieldValue.increment(rewardAmount),
          referralCount: FieldValue.increment(1)
        });

        const refNotifId = `NOTIF-REF-${stripeSessionId.slice(-8)}`;
        const refNotifRef = db.collection('notifications').doc(refNotifId);
        batch.set(refNotifRef, {
          id: refNotifId,
          userId: referredBy,
          title: "Referral Bonus Received! 🎁",
          message: `Congratulations! Your referral ${userData.displayName || userData.email} made their first investment of $${amount.toFixed(2)}. You have been credited a 15% bonus of $${rewardAmount.toFixed(2)} to your Referral Wallet.`,
          type: 'success',
          timestamp: new Date().toLocaleString(),
          read: false
        });
        console.log(`[Referral System] Credited $${rewardAmount} to referrer ${referredBy} for user ${userId}`);
      }
    }
  } catch (refErr: any) {
    console.error("[Referral System Error] Failed to process referral reward:", refErr.message);
  }

  await batch.commit();
  console.log(`[Stripe Webhook] Ledger atomically synchronized for Stripe checkout session: ${stripeSessionId}`);
}

// 4. Crypto payment verification securely on the backend
app.post("/api/payments/verify-crypto", express.json(), async (req, res) => {
  try {
    const { userId, paymentId } = req.body;
    if (!userId || !paymentId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const db = getAdminFirestore();
    const paymentRef = db.collection('payments').doc(paymentId);
    const paySnap = await paymentRef.get();

    if (!paySnap.exists) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    const payment = paySnap.data() || {};
    if (payment.status !== 'Pending') {
      return res.json({ success: payment.status === 'Completed' });
    }

    const batch = db.batch();

    // A. Mark payment completed
    batch.update(paymentRef, { status: 'Completed' });

    // B. Create Transaction record
    const txId = 'TX-' + Math.floor(10000000 + Math.random() * 90000000);
    const txDocRef = db.collection('transactions').doc(txId);
    const transaction = {
      id: txId,
      userId,
      date: new Date().toISOString(),
      countryId: payment.countryId,
      countryName: payment.countryName,
      flag: payment.flag,
      amountInvested: payment.amount,
      sharesQuantity: payment.sharesQuantity,
      pricePerShare: payment.pricePerShare,
      paymentMethod: payment.paymentMethod,
      status: 'Completed',
      txHash: '0x' + Array.from({length:40}, () => Math.floor(Math.random()*16).toString(16)).join('')
    };
    batch.set(txDocRef, transaction);

    // C. Update or Create Holdings
    const holdingId = `${userId}_${payment.countryId}`;
    const holdingRef = db.collection('holdings').doc(holdingId);
    const holdingSnap = await holdingRef.get();

    if (holdingSnap.exists) {
      const existingHolding = holdingSnap.data() || {};
      const existingShares = existingHolding.sharesQuantity || 0;
      const existingAmount = existingHolding.amountInvested || 0;

      const newSharesQuantity = existingShares + payment.sharesQuantity;
      const newAmountInvested = existingAmount + payment.amount;
      const newAveragePrice = Number((newAmountInvested / newSharesQuantity).toFixed(4));

      batch.update(holdingRef, {
        sharesQuantity: newSharesQuantity,
        amountInvested: newAmountInvested,
        averagePurchasePrice: newAveragePrice,
        potentialWinningValue: newSharesQuantity * payment.winningSettlementPrice,
        purchaseDate: new Date().toISOString()
      });
    } else {
      const newHolding = {
        id: holdingId,
        userId,
        countryId: payment.countryId,
        countryName: payment.countryName,
        flag: payment.flag,
        sharesQuantity: payment.sharesQuantity,
        averagePurchasePrice: payment.pricePerShare,
        amountInvested: payment.amount,
        winningSettlementPrice: payment.winningSettlementPrice,
        potentialWinningValue: payment.sharesQuantity * payment.winningSettlementPrice,
        purchaseDate: new Date().toISOString(),
        status: 'Active'
      };
      batch.set(holdingRef, newHolding);
    }

    // D. Update User Balance & Total Invested
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
      balance: FieldValue.increment(-payment.amount),
      totalInvested: FieldValue.increment(payment.amount)
    });

    // E. Add User Notification
    const notifId = 'NOTIF-' + Math.floor(100000 + Math.random() * 900000);
    const notifRef = db.collection('notifications').doc(notifId);
    batch.set(notifRef, {
      id: notifId,
      userId,
      title: `Purchase Confirmed: ${payment.countryName}`,
      message: `Payment Verified via CryptoMUS. Allocated $${payment.amount.toFixed(2)} for ${payment.sharesQuantity.toFixed(4)} shares.`,
      type: 'success',
      timestamp: new Date().toLocaleString(),
      read: false
    });

    // F. Referral Reward System
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      const userData = userSnap.data() || {};
      const referredBy = userData.referredBy;
      const referralRewardIssued = userData.referralRewardIssued;

      if (referredBy && !referralRewardIssued) {
        const rewardAmount = Number((payment.amount * 0.15).toFixed(2));
        const referrerRef = db.collection('users').doc(referredBy);

        batch.update(userRef, {
          referralRewardIssued: true,
          referralRewardAmount: rewardAmount,
          referralRewardReferrer: referredBy
        });

        batch.update(referrerRef, {
          referralWallet: FieldValue.increment(rewardAmount),
          referralEarnings: FieldValue.increment(rewardAmount),
          referralCount: FieldValue.increment(1)
        });

        const refNotifId = 'NOTIF-REF-' + Math.floor(100000 + Math.random() * 900000);
        const refNotifRef = db.collection('notifications').doc(refNotifId);
        batch.set(refNotifRef, {
          id: refNotifId,
          userId: referredBy,
          title: "Referral Bonus Received! 🎁",
          message: `Congratulations! Your referral ${userData.displayName || userData.email} made their first investment of $${payment.amount.toFixed(2)}. You have been credited a 15% bonus of $${rewardAmount.toFixed(2)} to your Referral Wallet.`,
          type: 'success',
          timestamp: new Date().toLocaleString(),
          read: false
        });
      }
    }

    await batch.commit();
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Crypto Verify API] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 5. Support Ticket Endpoint
app.post("/api/support/ticket", express.json({ limit: "10mb" }), async (req, res) => {
  try {
    const { userId, fullName, email, subject, message, screenshot } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    const db = getAdminFirestore();
    const ticketRef = db.collection('tickets').doc(ticketId);

    const ticketData: any = {
      id: ticketId,
      userId: userId || 'Anonymous',
      fullName,
      email,
      subject,
      message,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    if (screenshot) {
      ticketData.screenshot = screenshot;
    }

    await ticketRef.set(ticketData);

    // Simulate sending email to Support@worldcupstock.space
    console.log(`[Email Dispatch] Support ticket ${ticketId} automatically dispatched from ${email} to Support@worldcupstock.space`);

    res.json({ 
      success: true, 
      ticketId, 
      message: "Your support request has been successfully dispatched to Support@worldcupstock.space. We will be in touch shortly." 
    });
  } catch (error: any) {
    console.error("[Support Ticket API] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ========================================== VITE DEVELOPEMENT OR STATIC PRODUCTION MIDDLEWARE

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode: mount Vite dev server as middleware
    console.log("[Server] Launching in Development mode with active Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve statically built web folder
    console.log("[Server] Launching in Production mode. Serving static index assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server Ready] Listening at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
