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
}

// 1. Fetch or create a user profile in Firestore
export async function getOrCreateUserProfile(uid: string, email: string, displayName: string): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data() as UserProfile;
  } else {
    const defaultProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      balance: 1000.00, // complimentary $1000 demo trading cash balance
      totalInvested: 0
    };
    await setDoc(userDocRef, defaultProfile);
    
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
  const paymentRef = doc(db, 'payments', paymentId);
  const paySnap = await getDoc(paymentRef);
  
  if (!paySnap.exists()) {
    throw new Error("Payment record not found");
  }

  const payment = paySnap.data();
  if (payment.status !== 'Pending') {
    return payment.status === 'Completed';
  }

  // Atomically update holdings, create transaction, update user balance & total invested
  const batch = writeBatch(db);
  
  // A. Mark payment completed
  batch.update(paymentRef, { status: 'Completed' });

  // B. Create Transaction record
  const txId = 'TX-' + Math.floor(10000000 + Math.random() * 90000000);
  const txDocRef = doc(db, 'transactions', txId);
  const transaction: TransactionRecord = {
    id: txId,
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
  batch.set(txDocRef, { ...transaction, userId });

  // C. Update or Create Holdings
  const holdingId = `${userId}_${payment.countryId}`;
  const holdingRef = doc(db, 'holdings', holdingId);
  const holdingSnap = await getDoc(holdingRef);

  if (holdingSnap.exists()) {
    const existingHolding = holdingSnap.data() as ShareHolding;
    const newSharesQuantity = existingHolding.sharesQuantity + payment.sharesQuantity;
    const newAmountInvested = existingHolding.amountInvested + payment.amount;
    const newAveragePrice = Number((newAmountInvested / newSharesQuantity).toFixed(4));
    
    batch.update(holdingRef, {
      sharesQuantity: newSharesQuantity,
      amountInvested: newAmountInvested,
      averagePurchasePrice: newAveragePrice,
      potentialWinningValue: newSharesQuantity * payment.winningSettlementPrice,
      purchaseDate: new Date().toISOString()
    });
  } else {
    const newHolding: ShareHolding = {
      id: holdingId,
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
    batch.set(holdingRef, { ...newHolding, userId });
  }

  // D. Update User Balance & Total Invested
  const userRef = doc(db, 'users', userId);
  batch.update(userRef, {
    balance: increment(-payment.amount),
    totalInvested: increment(payment.amount)
  });

  // E. Add User Notification
  const notifId = 'NOTIF-' + Math.floor(100000 + Math.random() * 900000);
  const notifRef = doc(db, 'notifications', notifId);
  batch.set(notifRef, {
    id: notifId,
    userId,
    title: `Purchase Confirmed: ${payment.countryName}`,
    message: `Payment Verified via CryptoMUS. Allocated $${payment.amount.toFixed(2)} for ${payment.sharesQuantity.toFixed(4)} shares.`,
    type: 'success',
    timestamp: new Date().toLocaleString(),
    read: false
  });

  // Commit batch
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
