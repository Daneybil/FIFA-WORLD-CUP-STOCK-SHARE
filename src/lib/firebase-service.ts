import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  writeBatch,
  increment,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { ShareHolding, TransactionRecord, AppNotification } from '../types';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  totalInvested: number;
  referralCode?: string;
  referredBy?: string;
  referralWallet?: number;
  referralCount?: number;
  referralEarnings?: number;
}

function generateReferralCode(uid: string): string {
  const cleanUid = uid.replace(/[^a-zA-Z0-9]/g, '');
  const prefix = cleanUid.slice(0, 3).toUpperCase() || 'WCS';
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}${randomSuffix}`;
}

// 1. Fetch or create a user profile in Firestore
export async function getOrCreateUserProfile(uid: string, email: string, displayName: string): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const data = userDocSnap.data() as UserProfile;
    if (data.balance === 1000.00 || data.balance === 0) {
      data.balance = 5000.00;
      await updateDoc(userDocRef, { balance: 5000.00 });
    }
    
    // Auto-generate referral code for existing users if missing
    if (!data.referralCode) {
      const code = generateReferralCode(uid);
      const updates = {
        referralCode: code,
        referralWallet: data.referralWallet ?? 0,
        referralCount: data.referralCount ?? 0,
        referralEarnings: data.referralEarnings ?? 0
      };
      await updateDoc(userDocRef, updates);
      return {
        ...data,
        ...updates
      };
    }
    
    return data;
  } else {
    // Read pending referral code from session storage (handles both link-based and manual input)
    let referralCodeUsed = '';
    if (typeof window !== 'undefined') {
      referralCodeUsed = sessionStorage.getItem('pending_referral_code') || '';
    }

    const code = generateReferralCode(uid);
    let referredByUid = '';

    if (referralCodeUsed) {
      const q = query(collection(db, 'users'), where('referralCode', '==', referralCodeUsed.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const referrerDoc = snap.docs[0];
        if (referrerDoc.id !== uid) {
          referredByUid = referrerDoc.id;
        }
      }
    }

    const defaultProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      balance: 5000.00, // Starts at $5,000.00 for demo/testing purposes as requested
      totalInvested: 0,
      referralCode: code,
      referralWallet: 0,
      referralCount: 0,
      referralEarnings: 0
    };

    if (referredByUid) {
      defaultProfile.referredBy = referredByUid;
    }

    await setDoc(userDocRef, defaultProfile);
    
    // Clear the pending referral code after successful sign up
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pending_referral_code');
    }

    // Welcome Notification
    await createNotification(uid, {
      title: "Welcome to World Cup Equities",
      message: "Your investor profile has been successfully set up. Welcome to the World Cup Equities platform.",
      type: "success"
    });
    
    return defaultProfile;
  }
}

// 2. Create Payment Session
export async function createPaymentSession(userId: string, data: {
  amount: number;
  paymentMethod: string;
  countryId: string;
  countryName: string;
  flag: string;
  sharesQuantity: number;
  pricePerShare: number;
  winningSettlementPrice: number;
}) {
  const paymentId = 'PAY-' + Math.floor(100000 + Math.random() * 900000);
  const payRef = doc(db, 'payments', paymentId);
  
  const paymentData = {
    id: paymentId,
    userId,
    status: 'Pending',
    timestamp: new Date().toISOString(),
    ...data
  };

  await setDoc(payRef, paymentData);
  return paymentData;
}

// 3. Confirm Payment and Atopically execute Holdings & Transactions Records in Firestore
export async function verifyAndProcessPayment(userId: string, paymentId: string): Promise<boolean> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    const response = await fetch(`${backendUrl}/api/payments/verify-crypto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, paymentId })
    });
    
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to verify crypto payment.");
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("verifyAndProcessPayment error:", error);
    throw error;
  }
}

// 3B. Sell / Liquidate shares in Firestore
export async function sellSharesInFirestore(
  userId: string,
  countryId: string,
  sharesToSell: number,
  marketPrice: number
): Promise<boolean> {
  const holdingId = `${userId}_${countryId}`;
  const holdingRef = doc(db, 'holdings', holdingId);
  const holdingSnap = await getDoc(holdingRef);

  if (!holdingSnap.exists()) {
    throw new Error("You do not hold any active equity for this country.");
  }

  const holding = holdingSnap.data() as ShareHolding;
  if (holding.sharesQuantity < sharesToSell) {
    throw new Error("Insufficient shares quantity to execute this liquidation.");
  }

  const batch = writeBatch(db);
  const creditAmount = sharesToSell * marketPrice;

  // A. Update or Delete holding
  const remainingShares = holding.sharesQuantity - sharesToSell;
  if (remainingShares < 0.0001) {
    batch.delete(holdingRef);
  } else {
    const remainingInvested = Math.max(0, holding.amountInvested - (sharesToSell * holding.averagePurchasePrice));
    batch.update(holdingRef, {
      sharesQuantity: remainingShares,
      amountInvested: remainingInvested,
      potentialWinningValue: remainingShares * holding.winningSettlementPrice,
      purchaseDate: new Date().toISOString()
    });
  }

  // B. Credit user's wallet balance
  const userRef = doc(db, 'users', userId);
  batch.update(userRef, {
    balance: increment(creditAmount),
    totalInvested: increment(-creditAmount)
  });

  // C. Create Transaction record
  const txId = 'TX-SELL-' + Math.floor(10000000 + Math.random() * 90000000);
  const txDocRef = doc(db, 'transactions', txId);
  const transaction: TransactionRecord = {
    id: txId,
    date: new Date().toISOString(),
    countryId: holding.countryId,
    countryName: holding.countryName,
    flag: holding.flag,
    amountInvested: -creditAmount, // negative for selling/redeeming
    sharesQuantity: -sharesToSell, // negative to show selling
    pricePerShare: marketPrice,
    paymentMethod: 'USDT', // simulated refund method
    status: 'Completed',
    txHash: '0x' + Array.from({length:40}, () => Math.floor(Math.random()*16).toString(16)).join('')
  };
  batch.set(txDocRef, { ...transaction, userId });

  // D. Create notification
  const notifId = 'NOTIF-' + Math.floor(100000 + Math.random() * 900000);
  const notifRef = doc(db, 'notifications', notifId);
  batch.set(notifRef, {
    id: notifId,
    userId,
    title: `Liquidation Confirmed: ${holding.countryName}`,
    message: `Successfully liquidated ${sharesToSell.toFixed(4)} shares at $${marketPrice.toFixed(2)} / share. $${creditAmount.toFixed(2)} USD credited to escrow balance.`,
    type: 'success',
    timestamp: new Date().toLocaleString(),
    read: false
  });

  await batch.commit();
  return true;
}

// 4. Create Notification
export async function createNotification(userId: string, data: {
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'alert';
}) {
  const notifId = 'NOTIF-' + Math.floor(100000 + Math.random() * 900000);
  const notifRef = doc(db, 'notifications', notifId);
  
  await setDoc(notifRef, {
    id: notifId,
    userId,
    title: data.title,
    message: data.message,
    type: data.type,
    timestamp: new Date().toLocaleString(),
    read: false
  });
}

// 5. Fetch User Holdings from Firestore
export async function getUserHoldings(userId: string): Promise<ShareHolding[]> {
  const q = query(collection(db, 'holdings'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const holdings: ShareHolding[] = [];
  snap.forEach(doc => {
    holdings.push(doc.data() as ShareHolding);
  });
  return holdings;
}

// 6. Fetch User Transactions from Firestore
export async function getUserTransactions(userId: string): Promise<TransactionRecord[]> {
  const q = query(collection(db, 'transactions'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const transactions: TransactionRecord[] = [];
  snap.forEach(doc => {
    transactions.push(doc.data() as TransactionRecord);
  });
  // Sort by date desc
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 7. Fetch User Notifications from Firestore
export async function getUserNotifications(userId: string): Promise<AppNotification[]> {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const notifications: AppNotification[] = [];
  snap.forEach(doc => {
    notifications.push(doc.data() as AppNotification);
  });
  return notifications;
}

// 8. Mark notification read
export async function markNotificationReadInFirestore(notificationId: string) {
  const ref = doc(db, 'notifications', notificationId);
  await updateDoc(ref, { read: true });
}

// 9. Clear all notifications
export async function clearAllUserNotificationsInFirestore(userId: string) {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

// 10. Deposit user funds securely in Firestore user document
export async function depositUserFunds(userId: string, amount: number): Promise<number> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error("User profile not found in database");
  }
  const currentBalance = userSnap.data().balance || 0;
  const newBalance = Number((currentBalance + amount).toFixed(2));
  await updateDoc(userRef, { balance: newBalance });
  
  // Create a funding notification in Firestore
  await createNotification(userId, {
    title: "USD Collateral Deposited",
    message: `Secure funding of $${amount.toFixed(2)} has been credited to your portfolio ledger balance.`,
    type: "success"
  });
  
  return newBalance;
}

// 11. Fetch latest public transactions from across the system for Live Activity Stream
export async function getLatestPublicTransactions(): Promise<TransactionRecord[]> {
  try {
    const q = query(collection(db, 'transactions'));
    const snap = await getDocs(q);
    const txs: any[] = [];
    snap.forEach(doc => {
      txs.push(doc.data());
    });
    // Sort by date descending in-memory to guarantee safety and bypass complex indexing needs
    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return txs.slice(0, 20);
  } catch (err) {
    console.error("Error retrieving public transactions:", err);
    return [];
  }
}

// 12. Submit Support Ticket securely to the backend
export async function createSupportTicket(userId: string, ticketData: {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  screenshot?: string; // base64 encoded
}): Promise<string> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    const response = await fetch(`${backendUrl}/api/support/ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, ...ticketData })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to submit support ticket.");
    }

    const data = await response.json();
    return data.ticketId;
  } catch (error) {
    console.error("createSupportTicket error:", error);
    throw error;
  }
}
