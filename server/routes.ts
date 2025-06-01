import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gameService } from "./games";
import { insertUserSchema, insertTransactionSchema, insertGameResultSchema, insertUserNftSchema } from "../shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Wallet routes
  app.get("/api/wallet/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const transactions = await storage.getUserTransactions(userId);
      
      res.json({ 
        balance: user.balance,
        transactions
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get wallet data" });
    }
  });

  app.post("/api/wallet/transaction", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      
      // Update user balance
      const user = await storage.getUser(transactionData.userId);
      if (user) {
        const newBalance = user.balance + transactionData.amount;
        await storage.updateUserBalance(transactionData.userId, newBalance);
      }
      
      res.status(201).json({ transaction });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });

  // Games routes
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json({ games });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:gameId", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json({ game });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.post("/api/games/result", async (req, res) => {
    try {
      const resultData = insertGameResultSchema.parse(req.body);
      const result = await storage.createGameResult(resultData);
      
      // Update user balance with win amount
      const user = await storage.getUser(resultData.userId);
      if (user) {
        const newBalance = user.balance + resultData.winAmount - resultData.betAmount;
        await storage.updateUserBalance(resultData.userId, newBalance);
      }
      
      res.status(201).json({ result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to record game result" });
      }
    }
  });

  // Game-specific logic
  app.post("/api/games/roulette/spin", async (req, res) => {
    try {
      const { userId, betAmount, betType, selectedNumbers } = req.body;
      const result = gameService.playRoulette(betAmount, betType, selectedNumbers);
      
      // Record game result and update user balance
      await storage.createGameResult({
        gameId: 1, // Roulette game ID
        userId,
        betAmount,
        winAmount: result.winAmount,
        isWin: result.isWin,
        gameData: result
      });
      
      const user = await storage.getUser(userId);
      if (user) {
        const newBalance = user.balance + result.winAmount - betAmount;
        await storage.updateUserBalance(userId, newBalance);
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to process roulette spin" });
    }
  });

  // NFT Marketplace routes
  app.get("/api/nfts", async (req, res) => {
    try {
      const nfts = await storage.getAllNFTs();
      res.json({ nfts });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch NFTs" });
    }
  });

  app.post("/api/nfts/purchase", async (req, res) => {
    try {
      const { userId, nftId } = req.body;
      const userNftData = insertUserNftSchema.parse({ userId, nftId });
      
      // Check if user has enough balance
      const user = await storage.getUser(userId);
      const nft = await storage.getNFT(nftId);
      
      if (!user || !nft) {
        return res.status(404).json({ message: "User or NFT not found" });
      }
      
      if (user.balance < nft.price) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Check if NFT is available
      if (!nft.available) {
        return res.status(400).json({ message: "NFT is not available" });
      }
      
      // Create user NFT record
      const userNft = await storage.createUserNFT(userNftData);
      
      // Update NFT availability
      await storage.updateNFTAvailability(nftId, false);
      
      // Create transaction record
      await storage.createTransaction({
        userId,
        amount: -nft.price,
        description: `Purchased ${nft.name} NFT`,
        type: "purchase"
      });
      
      // Update user balance
      await storage.updateUserBalance(userId, user.balance - nft.price);
      
      res.status(201).json({ userNft });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to purchase NFT" });
      }
    }
  });

  app.get("/api/users/:userId/nfts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userNfts = await storage.getUserNFTs(userId);
      res.json({ userNfts });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user NFTs" });
    }
  });

  // Daily login bonus routes
  app.post("/api/daily-bonus/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const canClaim = await storage.checkDailyBonus(userId);
      
      if (!canClaim) {
        return res.status(400).json({ message: "Daily bonus already claimed today" });
      }
      
      const user = await storage.claimDailyBonus(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        message: "Daily bonus claimed successfully", 
        bonusAmount: 100,
        user 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to claim daily bonus" });
    }
  });
  
  app.get("/api/daily-bonus/:userId/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const canClaim = await storage.checkDailyBonus(userId);
      res.json({ canClaim });
    } catch (error) {
      res.status(500).json({ message: "Failed to check daily bonus status" });
    }
  });
  
  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json({ achievements });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  
  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userAchievements = await storage.getUserAchievements(userId);
      res.json({ userAchievements });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });
  
  app.post("/api/users/:userId/achievements/:achievementId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievementId = parseInt(req.params.achievementId);
      
      const userAchievement = await storage.unlockAchievement(userId, achievementId);
      res.status(201).json({ userAchievement });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to unlock achievement" });
      }
    }
  });
  
  // Gacha routes
  app.get("/api/gacha/items", async (req, res) => {
    try {
      const items = await storage.getAllGachaItems();
      res.json({ items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gacha items" });
    }
  });
  
  app.get("/api/users/:userId/gacha/draws", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const draws = await storage.getUserGachaDraws(userId);
      res.json({ draws });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user gacha draws" });
    }
  });
  
  app.post("/api/gacha/draw", async (req, res) => {
    try {
      const { userId, drawType } = req.body;
      
      if (!userId || !drawType) {
        return res.status(400).json({ message: "User ID and draw type are required" });
      }
      
      if (drawType !== 'single' && drawType !== 'multi') {
        return res.status(400).json({ message: "Invalid draw type" });
      }
      
      const draw = await storage.createGachaDraw(userId, drawType);
      res.status(201).json({ draw });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to perform gacha draw" });
      }
    }
  });
  
  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const adminUsers = await storage.getAdminUsers();
      res.json({ adminUsers });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });
  
  app.get("/api/admin/all-users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all users" });
    }
  });
  
  app.get("/api/admin/all-transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all transactions" });
    }
  });
  
  app.get("/api/admin/all-game-results", async (req, res) => {
    try {
      const results = await storage.getAllGameResults();
      res.json({ results });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all game results" });
    }
  });
  
  app.get("/api/admin/all-user-nfts", async (req, res) => {
    try {
      const userNfts = await storage.getAllUserNFTs();
      res.json({ userNfts });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all user NFTs" });
    }
  });
  
  app.post("/api/admin/nfts", async (req, res) => {
    try {
      const nft = await storage.createNFT(req.body);
      res.status(201).json({ nft });
    } catch (error) {
      res.status(500).json({ message: "Failed to create NFT" });
    }
  });
  
  app.patch("/api/admin/nfts/:nftId", async (req, res) => {
    try {
      const nftId = parseInt(req.params.nftId);
      const nft = await storage.updateNFT(nftId, req.body);
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
      }
      res.json({ nft });
    } catch (error) {
      res.status(500).json({ message: "Failed to update NFT" });
    }
  });
  
  app.delete("/api/admin/nfts/:nftId", async (req, res) => {
    try {
      const nftId = parseInt(req.params.nftId);
      const deleted = await storage.deleteNFT(nftId);
      if (!deleted) {
        return res.status(404).json({ message: "NFT not found" });
      }
      res.json({ message: "NFT deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete NFT" });
    }
  });
  
  app.patch("/api/admin/games/:gameId/odds", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const { houseEdge } = req.body;
      
      if (houseEdge === undefined || isNaN(houseEdge)) {
        return res.status(400).json({ message: "Valid house edge value is required" });
      }
      
      const game = await storage.updateGameOdds(gameId, houseEdge);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json({ game });
    } catch (error) {
      res.status(500).json({ message: "Failed to update game odds" });
    }
  });
  
  app.patch("/api/admin/games/:gameId/status", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const game = await storage.updateGameStatus(gameId, status);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json({ game });
    } catch (error) {
      res.status(500).json({ message: "Failed to update game status" });
    }
  });
  
  app.patch("/api/admin/users/:userId/ban", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { isBanned } = req.body;
      
      if (isBanned === undefined) {
        return res.status(400).json({ message: "Ban status is required" });
      }
      
      const user = await storage.banUser(userId, isBanned);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user ban status" });
    }
  });
  
  app.patch("/api/admin/users/:userId/roles", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { isAdmin, isOperator } = req.body;
      
      if (isAdmin === undefined || isOperator === undefined) {
        return res.status(400).json({ message: "Role values are required" });
      }
      
      const user = await storage.setUserRole(userId, isAdmin, isOperator);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user roles" });
    }
  });
  
  // Support tickets routes (for admins and operators)
  app.get("/api/support/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json({ tickets });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  
  app.patch("/api/support/tickets/:ticketId/status", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const ticket = await storage.updateTicketStatus(ticketId, status);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.json({ ticket });
    } catch (error) {
      res.status(500).json({ message: "Failed to update ticket status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}