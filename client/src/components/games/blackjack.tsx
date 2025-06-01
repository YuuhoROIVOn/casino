import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { shuffleArray, delay } from "@/lib/utils";

interface BlackjackProps {
  onClose: () => void;
}

interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  numValue: number;
}

export default function Blackjack({ onClose }: BlackjackProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [betAmount, setBetAmount] = useState(150);
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealerTurn" | "gameOver">("betting");
  const [result, setResult] = useState("");
  const { balance, updateBalance } = useWallet();
  const { toast } = useToast();

  // Initialize deck
  useEffect(() => {
    initDeck();
  }, []);

  // Calculate totals when hands change
  useEffect(() => {
    setPlayerTotal(calculateHandTotal(playerHand));
  }, [playerHand]);

  useEffect(() => {
    setDealerTotal(calculateHandTotal(dealerHand));
  }, [dealerHand]);

  // Check for blackjack or bust
  useEffect(() => {
    if (gameState === "playing" && playerTotal === 21) {
      handleStand();
    } else if (gameState === "playing" && playerTotal > 21) {
      endGame("Player busts! Dealer wins.");
    }
  }, [playerTotal, gameState]);

  useEffect(() => {
    if (gameState === "dealerTurn") {
      dealerPlay();
    }
  }, [gameState, dealerTotal]);

  const initDeck = () => {
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const newDeck: Card[] = [];

    for (const suit of suits) {
      for (const value of values) {
        let numValue = 0;
        if (value === "A") {
          numValue = 11;
        } else if (["J", "Q", "K"].includes(value)) {
          numValue = 10;
        } else {
          numValue = parseInt(value);
        }
        newDeck.push({ suit, value, numValue });
      }
    }

    setDeck(shuffleArray(newDeck));
  };

  const calculateHandTotal = (hand: Card[]) => {
    let total = hand.reduce((sum, card) => sum + card.numValue, 0);
    let aces = hand.filter(card => card.value === "A").length;

    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  };

  const dealCard = (): Card => {
    const card = deck[0];
    setDeck(prev => prev.slice(1));
    return card;
  };

  const startGame = () => {
    if (betAmount <= 0) {
      toast({
        title: "Invalid bet amount",
        description: "Please enter a bet amount greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (betAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough $HOLOCOIN to place this bet",
        variant: "destructive"
      });
      return;
    }

    // Deduct bet amount
    updateBalance(-betAmount);

    // Reset hands
    const shuffledDeck = shuffleArray([...deck]);
    setDeck(shuffledDeck);
    
    const pHand = [shuffledDeck[0], shuffledDeck[2]];
    const dHand = [shuffledDeck[1], shuffledDeck[3]];
    
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(shuffledDeck.slice(4));
    setGameState("playing");
    setResult("");
  };

  const hit = () => {
    if (gameState !== "playing") return;
    
    const card = dealCard();
    setPlayerHand(prev => [...prev, card]);
  };

  const handleStand = () => {
    if (gameState !== "playing") return;
    setGameState("dealerTurn");
  };

  const dealerPlay = async () => {
    let currentDealerHand = [...dealerHand];
    let currentTotal = calculateHandTotal(currentDealerHand);
    
    while (currentTotal < 17) {
      await delay(1000);
      const card = dealCard();
      currentDealerHand = [...currentDealerHand, card];
      setDealerHand(currentDealerHand);
      currentTotal = calculateHandTotal(currentDealerHand);
    }
    
    // Determine winner
    if (currentTotal > 21) {
      endGame("Dealer busts! Player wins.", betAmount * 2);
    } else if (currentTotal === playerTotal) {
      endGame("Push! It's a tie.", betAmount);
    } else if (currentTotal > playerTotal) {
      endGame("Dealer wins!");
    } else {
      endGame("Player wins!", betAmount * 2);
    }
  };

  const endGame = (message: string, winAmount: number = 0) => {
    setResult(message);
    setGameState("gameOver");
    
    if (winAmount > 0) {
      updateBalance(winAmount);
      toast({
        title: "You Won!",
        description: `You won ${winAmount} $HOLOCOIN!`,
        variant: "success"
      });
    } else if (message.includes("tie")) {
      updateBalance(betAmount);
      toast({
        title: "It's a tie!",
        description: "Your bet has been returned.",
        variant: "default"
      });
    } else {
      toast({
        title: "Better luck next time",
        description: message,
        variant: "default"
      });
    }
  };

  const double = () => {
    if (gameState !== "playing" || playerHand.length > 2) return;
    
    if (betAmount * 2 > balance + betAmount) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough $HOLOCOIN to double down",
        variant: "destructive"
      });
      return;
    }
    
    // Double bet
    updateBalance(-betAmount);
    setBetAmount(betAmount * 2);
    
    // Take one card and stand
    const card = dealCard();
    setPlayerHand(prev => [...prev, card]);
    
    // Move to dealer's turn after a short delay
    setTimeout(() => {
      setGameState("dealerTurn");
    }, 1000);
  };

  const getCardDisplay = (card: Card) => {
    const suitSymbol = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠"
    }[card.suit];
    
    const isRed = card.suit === "hearts" || card.suit === "diamonds";
    
    return (
      <div className="playing-card">
        <span className={`text-2xl ${isRed ? "card-red" : "card-black"}`}>{suitSymbol}</span>
        <span className={`absolute top-2 left-2 text-sm ${isRed ? "card-red" : "card-black"}`}>{card.value}</span>
        <span className={`absolute bottom-2 right-2 text-sm ${isRed ? "card-red" : "card-black"}`}>{card.value}</span>
      </div>
    );
  };

  const setBetQuick = (amount: number) => {
    setBetAmount(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-2xl p-6 h-full flex flex-col">
          {/* Blackjack Table */}
          <div className="flex-1 flex flex-col items-center justify-between py-8">
            {/* Dealer Area */}
            <div className="w-full text-center mb-8">
              <div className="inline-block bg-card/30 rounded-full px-4 py-1 mb-2">
                <span className="text-white/90">Dealer: {gameState === "betting" || (gameState === "playing" && dealerHand.length > 0) ? "?" : dealerTotal}</span>
              </div>
              <div className="flex justify-center flex-wrap">
                {dealerHand.map((card, index) => (
                  <div key={index} className={index === 1 && gameState === "playing" ? "playing-card bg-primary/10 backdrop-blur-sm" : ""}>
                    {index === 1 && gameState === "playing" ? (
                      <span className="text-2xl text-white/30">?</span>
                    ) : (
                      getCardDisplay(card)
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Result */}
            {result && (
              <div className="text-xl font-bold text-white bg-primary/30 px-4 py-2 rounded-lg mb-4">
                {result}
              </div>
            )}

            {/* Player Cards */}
            <div className="w-full text-center">
              <div className="flex justify-center flex-wrap mb-4">
                {playerHand.map((card, index) => (
                  <div key={index}>
                    {getCardDisplay(card)}
                  </div>
                ))}
              </div>
              <div className="inline-block bg-card/30 rounded-full px-4 py-1">
                <span className="text-white/90">You: {playerTotal}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            {gameState === "betting" ? (
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-6" onClick={startGame}>
                Deal Cards
              </Button>
            ) : gameState === "playing" ? (
              <>
                <Button className="bg-destructive hover:bg-destructive/90 text-white font-bold py-2 px-6 rounded-xl" onClick={handleStand}>
                  Stand
                </Button>
                <Button className="bg-success hover:bg-success/90 text-white font-bold py-2 px-6 rounded-xl" onClick={hit}>
                  Hit
                </Button>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-2 px-6 rounded-xl"
                  onClick={double}
                  disabled={playerHand.length > 2}
                >
                  Double
                </Button>
              </>
            ) : gameState === "gameOver" ? (
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6" onClick={() => setGameState("betting")}>
                New Game
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      
      <div className="col-span-1">
        <div className="bg-card/50 rounded-2xl p-6 h-full">
          <h3 className="font-poppins font-bold text-xl mb-4">Game Information</h3>

          <div className="mb-4">
            <div className="flex justify-between">
              <span className="text-foreground/70">Current Bet:</span>
              <span className="font-bold text-accent">{betAmount} $HOLOCOIN</span>
            </div>
          </div>

          <div className="mb-6">
            <Label className="block text-sm text-foreground/70 mb-2">Bet Amount</Label>
            <div className="flex">
              <Input
                type="number"
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                disabled={gameState !== "betting"}
                className="w-full bg-card/50 rounded-l-lg border border-white/10 px-4 py-2 text-white"
              />
              <Button
                className="bg-primary px-4 rounded-r-lg text-white"
                onClick={() => setBetAmount(Math.min(balance, 1000))}
                disabled={gameState !== "betting"}
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="flex space-x-2 mb-6">
            <Button
              variant="outline"
              className="flex-1 hover:bg-card/40 text-white py-2 rounded-lg transition"
              onClick={() => setBetQuick(10)}
              disabled={gameState !== "betting"}
            >
              10
            </Button>
            <Button
              variant="outline"
              className="flex-1 hover:bg-card/40 text-white py-2 rounded-lg transition"
              onClick={() => setBetQuick(50)}
              disabled={gameState !== "betting"}
            >
              50
            </Button>
            <Button
              variant="outline"
              className="flex-1 hover:bg-card/40 text-white py-2 rounded-lg transition"
              onClick={() => setBetQuick(100)}
              disabled={gameState !== "betting"}
            >
              100
            </Button>
            <Button
              variant="outline"
              className="flex-1 hover:bg-card/40 text-white py-2 rounded-lg transition"
              onClick={() => setBetQuick(500)}
              disabled={gameState !== "betting"}
            >
              500
            </Button>
          </div>

          <div className="bg-card/30 rounded-xl p-4 mb-4">
            <h4 className="font-bold mb-2">Game Rules</h4>
            <ul className="text-sm text-foreground/80 space-y-1">
              <li>• Dealer stands on 17</li>
              <li>• Blackjack pays 3:2</li>
              <li>• Insurance pays 2:1</li>
              <li>• Double down on any first 2 cards</li>
            </ul>
          </div>

          <div className="flex items-center p-3 bg-primary/10 rounded-xl">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
                alt="Dealer Character"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-foreground/90">
                {gameState === "betting"
                  ? "Place your bets and get ready to play!"
                  : gameState === "playing" && playerTotal > 16
                  ? "Your hand is " + playerTotal + ". Consider standing for the best odds!"
                  : gameState === "playing"
                  ? "Your hand is " + playerTotal + ". Do you want to hit or stand?"
                  : "Thanks for playing! Try your luck with another round?"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
