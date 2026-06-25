export type PaymentMethod = 'USDT' | 'BTC' | 'ETH' | 'BNB' | 'CreditCard' | 'DebitCard' | 'BankTransfer';

export interface CountryShare {
  id: string; // e.g. "USA"
  name: string;
  flag: string; // emoji flag or reliable icon
  rating: number; // star rating e.g. 1 to 5
  currentPrice: number; // e.g. 1.00
  winningSettlementPrice: number; // e.g. 100.00
  potentialReturn: number; // e.g. 100
  group: string;
  ranking: number;
  popularityScore: number; // 0-100
  trending: 'up' | 'down' | 'stable';
  change24h: number; // percentage change, e.g. +3.2%
  availableShares: number;
  totalSharesPurchased?: number; // total shares purchased on the platform
  status?: 'ACTIVE' | 'ELIMINATED' | 'CHAMPION'; // current tournament status
  statistics: {
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    matchesPlayed?: number; // actual tournament matches played
  };
  description: string;
}

export interface ShareHolding {
  id: string; // unique ID
  countryId: string;
  countryName: string;
  flag: string;
  sharesQuantity: number;
  averagePurchasePrice: number;
  amountInvested: number;
  winningSettlementPrice: number;
  potentialWinningValue: number;
  purchaseDate: string;
  status: 'Active' | 'Settled_Won' | 'Settled_Lost' | 'Refunded';
}

export interface TransactionRecord {
  id: string;
  userId?: string;
  date: string;
  countryId: string;
  countryName: string;
  flag: string;
  amountInvested: number;
  sharesQuantity: number;
  pricePerShare: number;
  paymentMethod: PaymentMethod;
  status: 'Completed' | 'Pending' | 'Failed';
  txHash?: string; // crypto Hash if applicable
}

export interface MarketStat {
  liveMarketCap: string; // e.g. "$12.5B"
  volume24h: string; // e.g. "$450M"
  marketChange24h: string; // e.g. "+3.2%"
  totalShareholders: number;
  totalSharesSold: number;
  totalTournamentPool: number; // in USD
}

export interface MatchFixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  stage: 'Group Stage' | 'Round of 32' | 'Round of 16' | 'Quarter-Finals' | 'Semi-Finals' | 'Third Place' | 'Final';
  status: 'Scheduled' | 'Live' | 'Finished';
}

export interface MarketActivity {
  id: string;
  userName: string;
  countryId: string;
  countryName: string;
  flag: string;
  amountInvested: number;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}
