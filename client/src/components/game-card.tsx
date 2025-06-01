import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GameType } from "@/types";

interface GameCardProps {
  game: GameType;
  onPlay: (gameId: string) => void;
  tabContent?: string;
}

export default function GameCard({ game, onPlay, tabContent = "all" }: GameCardProps) {
  const { id, name, description, image, status } = game;

  const getBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "hot":
        return "bg-primary/20 text-primary";
      case "new":
        return "bg-accent/20 text-accent";
      case "popular":
        return "bg-secondary/20 text-secondary";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <div 
      className={cn(
        "game-card rounded-2xl overflow-hidden bg-card shadow-xl",
        {"hidden": tabContent !== "all" && !game.categories.includes(tabContent)}
      )}
      data-game={id}
      data-tab-content={`all ${game.categories.join(" ")}`}
    >
      <div className="w-full h-48 overflow-hidden">
        <img 
          src={image} 
          alt={`${name} Game`} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-poppins font-bold text-xl">{name}</h3>
          {status && (
            <Badge className={cn("text-xs px-2 py-1 rounded-full", getBadgeColor(status))}>
              {status.toUpperCase()}
            </Badge>
          )}
        </div>
        <p className="text-sm text-foreground/70 mb-4">{description}</p>
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-xl transition" 
          onClick={() => onPlay(id)}
        >
          Play Now
        </Button>
      </div>
    </div>
  );
}
