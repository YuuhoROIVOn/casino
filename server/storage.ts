import { 
  users, type User, type InsertUser,
  transactions, type Transaction, type InsertTransaction,
  games, type Game, type InsertGame,
  gameResults, type GameResult, type InsertGameResult,
  nfts, type NFT, type InsertNFT,
  userNfts, type UserNFT, type InsertUserNFT,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  gachaItems, type GachaItem, type InsertGachaItem,
  gachaDraws, type GachaDraw, type InsertGachaDraw
} from "../shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;
  checkDailyBonus(userId: number): Promise<boolean>;
  claimDailyBonus(userId: number): Promise<User | undefined>;
  updateLastLogin(userId: number): Promise<User | undefined>;
  getAdminUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  banUser(userId: number, isBanned: boolean): Promise<User | undefined>;
  setUserRole(userId: number, isAdmin: boolean, isOperator: boolean): Promise<User | undefined>;
  
  // Transaction operations
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<Transaction[]>;
  
  // Game operations
  getAllGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  updateGameOdds(gameId: number, houseEdge: number): Promise<Game | undefined>;
  updateGameStatus(gameId: number, status: string): Promise<Game | undefined>;
  
  // Game results operations
  getUserGameResults(userId: number): Promise<GameResult[]>;
  createGameResult(result: InsertGameResult): Promise<GameResult>;
  getAllGameResults(): Promise<GameResult[]>;
  
  // NFT operations
  getAllNFTs(): Promise<NFT[]>;
  getNFT(id: number): Promise<NFT | undefined>;
  updateNFTAvailability(nftId: number, available: boolean): Promise<NFT | undefined>;
  createNFT(nft: InsertNFT): Promise<NFT>;
  updateNFT(id: number, nft: Partial<InsertNFT>): Promise<NFT | undefined>;
  deleteNFT(id: number): Promise<boolean>;
  
  // User NFT operations
  getUserNFTs(userId: number): Promise<(UserNFT & { nft: NFT })[]>;
  createUserNFT(userNft: InsertUserNFT): Promise<UserNFT>;
  getAllUserNFTs(): Promise<(UserNFT & { nft: NFT, user: User })[]>;
  
  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  
  // Support operations
  createSupportTicket(userId: number, subject: string, message: string): Promise<any>;
  addMessageToTicket(ticketId: number, userId: number, message: string, isAdmin: boolean): Promise<any>;
  getUserSupportTickets(userId: number): Promise<any[]>;
  getAllSupportTickets(): Promise<any[]>;
  updateTicketStatus(ticketId: number, status: 'open' | 'pending' | 'closed'): Promise<any>;
  unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  
  // Gacha operations
  getAllGachaItems(): Promise<GachaItem[]>;
  getUserGachaDraws(userId: number): Promise<(GachaDraw & { item: GachaItem })[]>;
  createGachaDraw(userId: number, drawType: string): Promise<GachaDraw & { item: GachaItem }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private games: Map<number, Game>;
  private gameResults: Map<number, GameResult>;
  private nfts: Map<number, NFT>;
  private userNfts: Map<number, UserNFT>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private gachaItems: Map<number, GachaItem>;
  private gachaDraws: Map<number, GachaDraw>;
  private supportTickets: Map<number, any>;
  
  private currentUserId: number;
  private currentTransactionId: number;
  private currentGameId: number;
  private currentGameResultId: number;
  private currentNftId: number;
  private currentUserNftId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;
  private currentGachaItemId: number;
  private currentGachaDrawId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.games = new Map();
    this.gameResults = new Map();
    this.nfts = new Map();
    this.userNfts = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.gachaItems = new Map();
    this.gachaDraws = new Map();
    
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.currentGameId = 1;
    this.currentGameResultId = 1;
    this.currentNftId = 1;
    this.currentUserNftId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    this.currentGachaItemId = 1;
    this.currentGachaDrawId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@holocasino.com",
      avatar: null,
      isAdmin: true
    });
  
    // Initialize games with 75% chance of losing (house edge of 0.75)
    const gamesData: InsertGame[] = [
      {
        name: "Roulette",
        description: "Spin the wheel and test your luck with cute Hololive croupiers!",
        image: "https://pixabay.com/get/g82169e1a2efb19e073e163a64d032f8de63b8af58d56472277eac6f96bc00af46af107c028adaa482a828a2bfa31fe8345196c6794e9d2767ce8842adaa4ad17_1280.jpg",
        status: "HOT",
        categories: ["table"],
        minBet: 10,
        maxBet: 1000,
        houseEdge: 0.75,
      },
      {
        name: "Poker",
        description: "Play Texas Hold'em with Hololive character dealers and win big!",
        image: "https://pixabay.com/get/g4f163b23633fb3fb3ec3c8d84dd9dafc0f36227d673407b052dd4b59f3e4d334287255223fd082554e940ed3baa0ae0e369ba815c5ae5033704665c5201dadc6_1280.jpg",
        status: "POPULAR",
        categories: ["table"],
        minBet: 50,
        maxBet: 2000,
        houseEdge: 0.75,
      },
      {
        name: "Blackjack",
        description: "Beat the dealer to 21 and win $HOLOCOIN with your favorite VTubers!",
        image: "https://pixabay.com/get/g83655ce0158b6f7d222063cdd40d6e3bfc7777990c9f7d7ee8f874113e4e5732cc01b19b0710c99f28ea178bf01c870438c6a1a93ada189d7d7070fe233803e8_1280.jpg",
        status: "NEW",
        categories: ["table"],
        minBet: 20,
        maxBet: 1000,
        houseEdge: 0.75,
      },
      {
        name: "Plinko",
        description: "Drop the ball and watch it bounce for instant anime-themed prizes!",
        image: "https://pixabay.com/get/g0e56df621214c87324f60c6c5fd7b8e01ea2a13af5d0ccc2e9e89f1ed0cfa9df9edcd2c3acf8d2ea2fa0f3c9b0a4edb5cd95d9e3e7d9539a18711c0b99a0d35a_1280.jpg",
        status: "POPULAR",
        categories: ["slots"],
        minBet: 10,
        maxBet: 500,
        houseEdge: 0.75,
      },
      {
        name: "Slot Machine",
        description: "Spin the reels with Hololive characters and win massive jackpots!",
        image: "https://pixabay.com/get/g3fbe2ce6f69b33d5ee4efd7a8d8fb56bbbad9f293d4a35dea86a4e67cdf66a0e2e4d0f33f1d6953ab62bdc5debb193290bcc2cadc33e60ad7f91b2fd7c05e22c_1280.jpg",
        status: "HOT",
        categories: ["slots"],
        minBet: 1,
        maxBet: 100,
        houseEdge: 0.75,
      },
      {
        name: "Gacha",
        description: "Draw special Hololive items with a chance to win rare NFTs and coins!",
        image: "https://pixabay.com/get/g2d46ab3e7b1a75b30b74142b18d9d95af4b3fc6b02ee9ad5a59ca99c1c94fcbeebf19affe0d889e3baef65a04a9683dc4d5b9bd2cbadafd3aaa4f3bc76b06dc4_1280.jpg",
        status: "NEW",
        categories: ["gacha"],
        minBet: 10,
        maxBet: 100,
        houseEdge: 0.60,
      },
    ];
    
    gamesData.forEach(game => {
      this.games.set(this.currentGameId, {
        ...game,
        id: this.currentGameId,
      });
      this.currentGameId++;
    });
    
    // Initialize gacha items
    const gachaItemsData: InsertGachaItem[] = [
      {
        name: "Small Coin Reward",
        description: "A small bag of HOLOCOINS!",
        image: "https://pixabay.com/get/g58ab39fd26c8304fa77c0f98d77bc01c7ef5df9f0df8fdfa2e5b9b3adf22a1b1ecac41d1fb5bc9bca3fecaef0de1ccdc_1280.png",
        type: "coin",
        rarity: "common",
        value: 50,
        dropRate: 0.40
      },
      {
        name: "Medium Coin Reward",
        description: "A medium bag of HOLOCOINS!",
        image: "https://pixabay.com/get/g5e64d1cc4a3b1e3a84e5d01ee3d19c4b4e48cdaa0bdcd2dc1b98c2c6b16aca29a18d43a54a42a1e20a2d2f6a8b1686b5_1280.png",
        type: "coin",
        rarity: "uncommon",
        value: 100,
        dropRate: 0.30
      },
      {
        name: "Large Coin Reward",
        description: "A large bag of HOLOCOINS!",
        image: "https://pixabay.com/get/g1cb46dce71bce27c3fceeab1d1cf65df32583b3f4faacd4a60a19c4c1afa81c59c6dbbb92e1add642d3b06ea2ac4452f_1280.png",
        type: "coin",
        rarity: "rare",
        value: 200,
        dropRate: 0.20
      },
      {
        name: "Hololive Mascot NFT",
        description: "A rare collectible NFT featuring Hololive's mascot!",
        image: "https://pixabay.com/get/g733ff98ef4dd4dbbb81caef1ab76b9f6b9f3e25ec7e0f4d39c7a83d2d7fdc85d4e74cdd1e1f29df64aa67a7444c59eea_1280.jpg",
        type: "nft",
        rarity: "epic",
        value: 8, // NFT ID
        dropRate: 0.07
      },
      {
        name: "VTuber Signature Card",
        description: "An extremely rare digital signature card from your favorite VTuber!",
        image: "https://pixabay.com/get/ge6cd5a0a75e7cc9adbc4df68b28e2d2aae69ac96cb39d9b5e49b4a36fce5ded18c42e5ae1ff3a1fb2e683c05fbc60ed2d835a34d0e5d8a0c8d7fb3c654c5ee47_1280.jpg",
        type: "nft",
        rarity: "legendary",
        value: 9, // NFT ID
        dropRate: 0.03
      }
    ];
    
    gachaItemsData.forEach(item => {
      this.gachaItems.set(this.currentGachaItemId, {
        ...item,
        id: this.currentGachaItemId,
        createdAt: new Date().toISOString()
      });
      this.currentGachaItemId++;
    });
    
    // Initialize achievements
    const achievementsData: InsertAchievement[] = [
      {
        name: "Welcome to Hololive Casino",
        description: "Login for the first time",
        image: "https://pixabay.com/get/g9c03fbe79fa5caf3972b095c4dfa66c75b2dc4b1b8cc51ef78e17eeec2fbe32dfeea2f0c6adef2fe16d2ee8c5fafc4a9_1280.png",
        reward: 100,
        requirement: "login_first_time"
      },
      {
        name: "High Roller",
        description: "Place a bet of 500 HOLOCOINS or more",
        image: "https://pixabay.com/get/gd80faca8e3b30a08df23a1fb44a85f59a11fdf2e3ed0d5dfcd9fa2ab73b5c30f54d3b6fdf3fcf0d53e05ae25cfdf31c87bf3aacb5fa3f92cdd8ce0f1c4d60b65_1280.jpg",
        reward: 200,
        requirement: "bet_500_or_more"
      },
      {
        name: "Lucky Streak",
        description: "Win 3 games in a row",
        image: "https://pixabay.com/get/g80a143d9ff77c16e2aaadb0e08efc75bd34fe3c9f8f3b43323dee76b1d5f3c5ec6d79a78f602f2c8e35bdca4be99bee63b9e54fbc36f1eeae2aa651e4eb8c5e6_1280.png",
        reward: 150,
        requirement: "win_3_consecutive"
      },
      {
        name: "Collector",
        description: "Own 3 or more NFTs",
        image: "https://pixabay.com/get/g2be7b9a89ead1b3f5de96972be9d64bfc15c0f22ab2c7f8e8b66e5a659a8a6a8a56bbc2a4bc5bf8e6ec09c69b07ea1e7_1280.png",
        reward: 300,
        requirement: "own_3_nfts"
      },
      {
        name: "Gacha Master",
        description: "Perform 10 gacha draws",
        image: "https://pixabay.com/get/g14d8c90cc4ff5bb47b9a4c5cb7b7a6f70c5ba22ce6df9ee6ce1b1c8e63ff86d5e90b1f8fed8bd87f27a0b1fd4c9a3ef2_1280.png",
        reward: 250,
        requirement: "perform_10_gacha"
      }
    ];
    
    achievementsData.forEach(achievement => {
      this.achievements.set(this.currentAchievementId, {
        ...achievement,
        id: this.currentAchievementId,
        createdAt: new Date().toISOString()
      });
      this.currentAchievementId++;
    });
    
    // Initialize NFTs
    const nftsData: InsertNFT[] = [
      {
        name: "Sakura Avatar",
        description: "Limited edition character avatar for your profile.",
        image: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
        price: 1250,
        rarity: "Rare",
        category: "avatars",
        available: true,
      },
      {
        name: "Poker Card Set",
        description: "Custom card deck for your poker games.",
        image: "https://pixabay.com/get/g2cbeccd5be57d577f18847d796dc1db0e2fe8ac8476d846b83027a3e53d8198c979832d74fa4c1bb45199bc30399247ad777d4565b1cffcb279e3a7d7a295936_1280.jpg",
        price: 2000,
        rarity: "Epic",
        category: "emotes",
        available: true,
      },
      {
        name: "VIP Badge",
        description: "Exclusive badge that gives you VIP status and bonuses.",
        image: "https://images.unsplash.com/photo-1622737133809-d95047b9e673?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
        price: 5000,
        rarity: "Legendary",
        category: "emotes",
        available: true,
      },
      {
        name: "Lucky Charm",
        description: "Increases your luck by 5% in all casino games.",
        image: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
        price: 1800,
        rarity: "Rare",
        category: "effects",
        available: true,
      },
      {
        name: "Neon Casino Background",
        description: "Customize your profile with this neon casino background.",
        image: "https://images.unsplash.com/photo-1578911373434-60ab95d11a4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
        price: 1000,
        rarity: "Common",
        category: "backgrounds",
        available: true,
      },
      {
        name: "Golden Dice",
        description: "Exclusive dice set for games with your friends.",
        image: "https://images.unsplash.com/photo-1608547522513-e9a818b3c6e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
        price: 1500,
        rarity: "Rare",
        category: "emotes",
        available: true,
      },
      {
        name: "Anime Dealer Animation",
        description: "Custom dealer animation for your games.",
        image: "https://images.unsplash.com/photo-1608508644127-ba99d7732fee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
        price: 3000,
        rarity: "Epic",
        category: "effects",
        available: true,
      },
      {
        name: "Cherry Blossom Theme",
        description: "Beautiful cherry blossom theme for your profile.",
        image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
        price: 2500,
        rarity: "Epic",
        category: "backgrounds",
        available: true,
      },
      {
        name: "Hololive Mascot",
        description: "Limited edition Hololive mascot collectible.",
        image: "https://pixabay.com/get/g733ff98ef4dd4dbbb81caef1ab76b9f6b9f3e25ec7e0f4d39c7a83d2d7fdc85d4e74cdd1e1f29df64aa67a7444c59eea_1280.jpg",
        price: 5000,
        rarity: "Legendary",
        category: "collectibles",
        available: true,
      },
      {
        name: "VTuber Signature Card",
        description: "Extremely rare digital signature from your favorite VTuber.",
        image: "https://pixabay.com/get/ge6cd5a0a75e7cc9adbc4df68b28e2d2aae69ac96cb39d9b5e49b4a36fce5ded18c42e5ae1ff3a1fb2e683c05fbc60ed2d835a34d0e5d8a0c8d7fb3c654c5ee47_1280.jpg",
        price: 10000,
        rarity: "Mythic",
        category: "collectibles",
        available: true,
      },
    ];
    
    nftsData.forEach(nft => {
      this.nfts.set(this.currentNftId, {
        ...nft,
        id: this.currentNftId,
        createdAt: new Date().toISOString(),
      });
      this.currentNftId++;
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = {
      ...user,
      id,
      balance: 2500, // Default starting balance
      isAdmin: user.isAdmin || false,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      balance: newBalance,
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async checkDailyBonus(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // If no last daily bonus, user can claim
    if (!user.lastDailyBonus) return true;
    
    // Check if 24 hours have passed since the last bonus
    const lastBonusDate = new Date(user.lastDailyBonus);
    const now = new Date();
    const diffHours = (now.getTime() - lastBonusDate.getTime()) / (1000 * 60 * 60);
    
    return diffHours >= 24;
  }

  async claimDailyBonus(userId: number): Promise<User | undefined> {
    const canClaim = await this.checkDailyBonus(userId);
    if (!canClaim) return undefined;
    
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    // Add 100 HOLOCOIN bonus
    const newBalance = user.balance + 100;
    
    const updatedUser: User = {
      ...user,
      balance: newBalance,
      lastDailyBonus: new Date().toISOString()
    };
    
    this.users.set(userId, updatedUser);
    
    // Create transaction record for the bonus
    await this.createTransaction({
      userId,
      amount: 100,
      description: "Daily login bonus",
      type: "deposit"
    });
    
    return updatedUser;
  }

  async updateLastLogin(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      lastLogin: new Date().toISOString()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAdminUsers(): Promise<User[]> {
    const admins: User[] = [];
    for (const user of this.users.values()) {
      if (user.isAdmin) {
        // Don't return password
        const { password, ...adminWithoutPassword } = user;
        admins.push(adminWithoutPassword as User);
      }
    }
    return admins;
  }

  // Transaction operations
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const userTransactions: Transaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.userId === userId) {
        userTransactions.push(transaction);
      }
    }
    return userTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: new Date().toISOString(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  // Game operations
  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async updateGameOdds(gameId: number, houseEdge: number): Promise<Game | undefined> {
    const game = await this.getGame(gameId);
    if (!game) return undefined;
    
    const updatedGame: Game = {
      ...game,
      houseEdge
    };
    
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  // Game results operations
  async getUserGameResults(userId: number): Promise<GameResult[]> {
    const results: GameResult[] = [];
    for (const result of this.gameResults.values()) {
      if (result.userId === userId) {
        results.push(result);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createGameResult(result: InsertGameResult): Promise<GameResult> {
    const id = this.currentGameResultId++;
    const newResult: GameResult = {
      ...result,
      id,
      createdAt: new Date().toISOString(),
    };
    this.gameResults.set(id, newResult);
    return newResult;
  }

  // NFT operations
  async getAllNFTs(): Promise<NFT[]> {
    return Array.from(this.nfts.values());
  }

  async getNFT(id: number): Promise<NFT | undefined> {
    return this.nfts.get(id);
  }

  async updateNFTAvailability(nftId: number, available: boolean): Promise<NFT | undefined> {
    const nft = await this.getNFT(nftId);
    if (!nft) return undefined;
    
    const updatedNft: NFT = {
      ...nft,
      available,
    };
    this.nfts.set(nftId, updatedNft);
    return updatedNft;
  }

  // User NFT operations
  async getUserNFTs(userId: number): Promise<(UserNFT & { nft: NFT })[]> {
    const userNfts: (UserNFT & { nft: NFT })[] = [];
    for (const userNft of this.userNfts.values()) {
      if (userNft.userId === userId) {
        const nft = await this.getNFT(userNft.nftId);
        if (nft) {
          userNfts.push({
            ...userNft,
            nft,
          });
        }
      }
    }
    return userNfts;
  }

  async createUserNFT(userNft: InsertUserNFT): Promise<UserNFT> {
    const id = this.currentUserNftId++;
    const newUserNft: UserNFT = {
      ...userNft,
      id,
      purchaseDate: new Date().toISOString(),
    };
    this.userNfts.set(id, newUserNft);
    return newUserNft;
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievements: (UserAchievement & { achievement: Achievement })[] = [];
    for (const userAchievement of this.userAchievements.values()) {
      if (userAchievement.userId === userId) {
        const achievement = this.achievements.get(userAchievement.achievementId);
        if (achievement) {
          userAchievements.push({
            ...userAchievement,
            achievement
          });
        }
      }
    }
    return userAchievements;
  }

  async unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    // Check if already unlocked
    for (const userAchievement of this.userAchievements.values()) {
      if (userAchievement.userId === userId && userAchievement.achievementId === achievementId) {
        return userAchievement;
      }
    }
    
    // Get achievement
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      throw new Error("Achievement not found");
    }
    
    // Create user achievement record
    const id = this.currentUserAchievementId++;
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      unlockedAt: new Date().toISOString()
    };
    
    this.userAchievements.set(id, userAchievement);
    
    // Award reward
    const user = await this.getUser(userId);
    if (user) {
      const newBalance = user.balance + achievement.reward;
      await this.updateUserBalance(userId, newBalance);
      
      // Create transaction
      await this.createTransaction({
        userId,
        amount: achievement.reward,
        description: `Achievement Reward: ${achievement.name}`,
        type: "deposit"
      });
    }
    
    return userAchievement;
  }

  // Gacha operations
  async getAllGachaItems(): Promise<GachaItem[]> {
    return Array.from(this.gachaItems.values());
  }

  async getUserGachaDraws(userId: number): Promise<(GachaDraw & { item: GachaItem })[]> {
    const userDraws: (GachaDraw & { item: GachaItem })[] = [];
    for (const draw of this.gachaDraws.values()) {
      if (draw.userId === userId) {
        const item = this.gachaItems.get(draw.itemId);
        if (item) {
          userDraws.push({
            ...draw,
            item
          });
        }
      }
    }
    return userDraws;
  }

  async createGachaDraw(userId: number, drawType: string): Promise<GachaDraw & { item: GachaItem }> {
    // Check if user exists
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if user has enough balance
    const cost = drawType === 'single' ? 10 : 100;
    if (user.balance < cost) {
      throw new Error("Insufficient balance");
    }
    
    // Deduct cost
    await this.updateUserBalance(userId, user.balance - cost);
    
    // Create transaction
    await this.createTransaction({
      userId,
      amount: -cost,
      description: `${drawType === 'single' ? 'Single' : 'Multi'} Gacha Draw`,
      type: "purchase"
    });
    
    // Select random item based on drop rates
    const gachaItems = await this.getAllGachaItems();
    const item = this.selectRandomGachaItem(gachaItems);
    
    // Process reward
    if (item.type === 'coin') {
      // Award coins
      await this.updateUserBalance(userId, user.balance - cost + item.value);
      
      // Create transaction
      await this.createTransaction({
        userId,
        amount: item.value,
        description: `Gacha Reward: ${item.name}`,
        type: "deposit"
      });
    } else if (item.type === 'nft') {
      // Award NFT
      await this.createUserNFT({
        userId,
        nftId: item.value
      });
      
      // Create transaction
      const nft = await this.getNFT(item.value);
      if (nft) {
        await this.createTransaction({
          userId,
          amount: 0,
          description: `Gacha Reward: ${nft.name} NFT`,
          type: "purchase"
        });
      }
    }
    
    // Record draw
    const id = this.currentGachaDrawId++;
    const draw: GachaDraw = {
      id,
      userId,
      itemId: item.id,
      drawType,
      drawAt: new Date().toISOString()
    };
    
    this.gachaDraws.set(id, draw);
    
    return {
      ...draw,
      item
    };
  }

  private selectRandomGachaItem(items: GachaItem[]): GachaItem {
    // Calculate total drop rate
    const totalDropRate = items.reduce((sum, item) => sum + item.dropRate, 0);
    
    // Generate random number
    const random = Math.random() * totalDropRate;
    
    // Select item
    let currentSum = 0;
    for (const item of items) {
      currentSum += item.dropRate;
      if (random <= currentSum) {
        return item;
      }
    }
    
    // Fallback to first item (should never happen)
    return items[0];
  }
}

export const storage = new MemStorage();