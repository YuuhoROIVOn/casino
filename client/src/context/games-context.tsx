import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { GameType } from "@/types";

interface GamesContextType {
  games: GameType[];
  getGameById: (id: string) => GameType | null;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<GameType[]>([
    {
      id: "roulette",
      name: "Roulette",
      description: "Spin the wheel and test your luck with cute Hololive croupiers!",
      image: "https://pixabay.com/get/g82169e1a2efb19e073e163a64d032f8de63b8af58d56472277eac6f96bc00af46af107c028adaa482a828a2bfa31fe8345196c6794e9d2767ce8842adaa4ad17_1280.jpg",
      status: "HOT",
      categories: ["table"],
      minBet: 10,
      maxBet: 1000,
      houseEdge: 0.027,
    },
    {
      id: "poker",
      name: "Poker",
      description: "Play Texas Hold'em with Hololive character dealers and win big!",
      image: "https://pixabay.com/get/g4f163b23633fb3fb3ec3c8d84dd9dafc0f36227d673407b052dd4b59f3e4d334287255223fd082554e940ed3baa0ae0e369ba815c5ae5033704665c5201dadc6_1280.jpg",
      status: "POPULAR",
      categories: ["table"],
      minBet: 50,
      maxBet: 2000,
      houseEdge: 0.025,
    },
    {
      id: "blackjack",
      name: "Blackjack",
      description: "Beat the dealer to 21 and win $HOLOCOIN with your favorite VTubers!",
      image: "https://pixabay.com/get/g83655ce0158b6f7d222063cdd40d6e3bfc7777990c9f7d7ee8f874113e4e5732cc01b19b0710c99f28ea178bf01c870438c6a1a93ada189d7d7070fe233803e8_1280.jpg",
      status: "NEW",
      categories: ["table"],
      minBet: 20,
      maxBet: 1000,
      houseEdge: 0.01,
    },
    {
      id: "plinko",
      name: "Plinko",
      description: "Drop the ball and watch it bounce for instant anime-themed prizes!",
      image: "https://pixabay.com/get/g0e56df621214c87324f60c6c5fd7b8e01ea2a13af5d0ccc2e9e89f1ed0cfa9df9edcd2c3acf8d2ea2fa0f3c9b0a4edb5cd95d9e3e7d9539a18711c0b99a0d35a_1280.jpg",
      status: "POPULAR",
      categories: ["slots"],
      minBet: 10,
      maxBet: 500,
      houseEdge: 0.1,
    },
    {
      id: "slots",
      name: "Slot Machine",
      description: "Spin the reels with Hololive characters and win massive jackpots!",
      image: "https://pixabay.com/get/g3fbe2ce6f69b33d5ee4efd7a8d8fb56bbbad9f293d4a35dea86a4e67cdf66a0e2e4d0f33f1d6953ab62bdc5debb193290bcc2cadc33e60ad7f91b2fd7c05e22c_1280.jpg",
      status: "HOT",
      categories: ["slots"],
      minBet: 1,
      maxBet: 100,
      houseEdge: 0.15,
    },
  ]);

  const getGameById = (id: string): GameType | null => {
    return games.find(game => game.id === id) || null;
  };

  const value = {
    games,
    getGameById,
  };

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
}

export const useGamesContext = () => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error("useGamesContext must be used within a GamesProvider");
  }
  return context;
};
