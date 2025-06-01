import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Transaction, NFTItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  nfts: NFTItem[];
  updateBalance: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
  addNFT: (nft: NFTItem) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(2500);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const { toast } = useToast();

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedBalance = localStorage.getItem("holocoin_balance");
    const storedTransactions = localStorage.getItem("holocoin_transactions");
    const storedNfts = localStorage.getItem("holocoin_nfts");

    if (storedBalance) {
      setBalance(Number(storedBalance));
    }

    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        console.error("Failed to parse transactions:", error);
      }
    } else {
      // Set initial transactions if none exist
      const initialTransactions: Transaction[] = [
        {
          id: "1",
          amount: 1000,
          description: "Initial deposit",
          type: "deposit",
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        },
        {
          id: "2",
          amount: -250,
          description: "Blackjack bet",
          type: "game",
          date: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        },
        {
          id: "3",
          amount: 750,
          description: "Slot machine win",
          type: "game",
          date: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        },
      ];
      setTransactions(initialTransactions);
      localStorage.setItem("holocoin_transactions", JSON.stringify(initialTransactions));
    }

    if (storedNfts) {
      try {
        setNfts(JSON.parse(storedNfts));
      } catch (error) {
        console.error("Failed to parse NFTs:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("holocoin_balance", balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("holocoin_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("holocoin_nfts", JSON.stringify(nfts));
  }, [nfts]);

  const updateBalance = (amount: number) => {
    setBalance(prevBalance => {
      const newBalance = prevBalance + amount;
      return newBalance < 0 ? prevBalance : newBalance;
    });

    // Add transaction record
    if (amount !== 0) {
      const transactionType = amount > 0 ? "deposit" : "game";
      const description = amount > 0 
        ? "Deposit" 
        : "Game bet";

      addTransaction({
        amount,
        description,
        type: transactionType,
      });
    }
  };

  const addTransaction = (transaction: Omit<Transaction, "id" | "date">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
  };

  const addNFT = (nft: NFTItem) => {
    // Check if NFT is already owned
    if (nfts.some(item => item.id === nft.id)) {
      toast({
        title: "Already owned",
        description: `You already own this ${nft.name}`,
        variant: "destructive"
      });
      return;
    }

    // Add purchase date to the NFT
    const nftWithDate = {
      ...nft,
      purchaseDate: new Date().toISOString()
    };

    setNfts(prev => [...prev, nftWithDate]);

    // Add transaction record
    addTransaction({
      amount: -nft.price,
      description: `Purchased ${nft.name}`,
      type: "purchase",
    });

    toast({
      title: "NFT Acquired!",
      description: `You now own ${nft.name}`,
      variant: "success"
    });
  };

  const value = {
    balance,
    transactions,
    nfts,
    updateBalance,
    addTransaction,
    addNFT,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};
