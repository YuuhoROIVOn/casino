import { useState } from "react";
import HeroSection from "@/components/hero-section";
import { Button } from "@/components/ui/button";
import GameCard from "@/components/game-card";
import GameWindow from "@/components/games/game-window";
import WalletSection from "@/components/wallet-section";
import MarketplaceSection from "@/components/marketplace-section";
import { useGames } from "@/hooks/use-games";

export default function Home() {
  const { games } = useGames();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const tabs = [
    { id: "all", label: "All" },
    { id: "table", label: "Table Games" },
    { id: "slots", label: "Slots" }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handlePlayGame = (gameId: string) => {
    setSelectedGame(gameId);
    // Scroll to game section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseGame = () => {
    setSelectedGame(null);
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <HeroSection />

      {selectedGame ? (
        <GameWindow gameId={selectedGame} onClose={handleCloseGame} />
      ) : (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-poppins font-bold">Casino Games</h2>
            <div className="flex space-x-2">
              {tabs.map(tab => (
                <Button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  className={`rounded-full ${activeTab === tab.id ? "bg-primary/20 text-primary" : ""}`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {games.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                onPlay={handlePlayGame}
                tabContent={activeTab}
              />
            ))}
          </div>
        </section>
      )}

      <WalletSection />
      <MarketplaceSection />
    </div>
  );
}
