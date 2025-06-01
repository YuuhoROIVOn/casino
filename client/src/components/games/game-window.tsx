import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Roulette from "@/components/games/roulette";
import Blackjack from "@/components/games/blackjack";
import Poker from "@/components/games/poker";
import Plinko from "@/components/games/plinko";
import Slots from "@/components/games/slots";
import { useGames } from "@/hooks/use-games";
import { X } from "lucide-react";

interface GameWindowProps {
  gameId: string | null;
  onClose: () => void;
}

export default function GameWindow({ gameId, onClose }: GameWindowProps) {
  const { getGameById } = useGames();
  const game = gameId ? getGameById(gameId) : null;

  if (!game) return null;

  const renderGameComponent = () => {
    switch (game.id) {
      case "roulette":
        return <Roulette onClose={onClose} />;
      case "blackjack":
        return <Blackjack onClose={onClose} />;
      case "poker":
        return <Poker onClose={onClose} />;
      case "plinko":
        return <Plinko onClose={onClose} />;
      case "slots":
        return <Slots onClose={onClose} />;
      default:
        return <div>Game not found</div>;
    }
  };

  return (
    <section className="mb-16 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-poppins font-bold">
          <span>{game.name}</span>
        </h2>
        <Button
          onClick={onClose}
          variant="ghost"
          className="rounded-full flex items-center gap-2 hover:bg-card/50"
        >
          <X className="w-4 h-4" />
          Back to Games
        </Button>
      </div>

      <Card className="rounded-3xl overflow-hidden shadow-2xl bg-card">
        <CardContent className="p-6">
          {renderGameComponent()}
        </CardContent>
      </Card>
    </section>
  );
}
