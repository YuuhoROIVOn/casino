// User types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  isAdmin?: boolean;
  balance?: number;
  lastLogin?: string;
}

// Wallet and transaction types
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'deposit' | 'withdrawal' | 'game' | 'purchase';
  date: string;
}

// Game types
export interface GameType {
  id: string;
  name: string;
  description: string;
  image: string;
  status?: string;
  categories: string[];
  minBet: number;
  maxBet: number;
  houseEdge: number;
}

export interface GameResult {
  id: string;
  gameId: string;
  userId: string;
  betAmount: number;
  winAmount: number;
  isWin: boolean;
  date: string;
  gameData?: any;
}

// NFT and marketplace types
export interface NFTItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  rarity: string;
  category: string;
  purchaseDate?: string;
}
