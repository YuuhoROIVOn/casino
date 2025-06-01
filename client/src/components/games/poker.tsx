import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { shuffleArray, delay } from "@/lib/utils";

interface PokerProps {
  onClose: () => void;
}

interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  numValue: number;
}

interface PokerHand {
  name: string;
  rank: number;
}

export default function Poker({ onClose }: PokerProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [betAmount, setBetAmount] = useState(50);
  const [potSize, setPotSize] = useState(0);
  const [playerBet, setPlayerBet] = useState(0);
  const [gameStage, setGameStage] = useState<"betting" | "preflop" | "flop" | "turn" | "river" | "showdown">("betting");
  const [gameResult, setGameResult] = useState("");
  const { balance, updateBalance } = useWallet();
  const { toast } = useToast();

  // Initialize deck
  useEffect(() => {
    initDeck();
  }, []);

  const initDeck = () => {
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const newDeck: Card[] = [];

    for (const suit of suits) {
      for (const value of values) {
        let numValue = 0;
        if (value === "A") {
          numValue = 14;
        } else if (value === "K") {
          numValue = 13;
        } else if (value === "Q") {
          numValue = 12;
        } else if (value === "J") {
          numValue = 11;
        } else {
          numValue = parseInt(value);
        }
        newDeck.push({ suit, value, numValue });
      }
    }

    setDeck(shuffleArray(newDeck));
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

    // Reset game state
    const shuffledDeck = shuffleArray([...deck]);
    setDeck(shuffledDeck);
    
    const pHand = [shuffledDeck[0], shuffledDeck[2]];
    const dHand = [shuffledDeck[1], shuffledDeck[3]];
    
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setCommunityCards([]);
    setDeck(shuffledDeck.slice(4));
    
    // Setup initial bets
    setPotSize(betAmount * 2); // Player and dealer's initial bets
    setPlayerBet(betAmount);
    updateBalance(-betAmount);
    
    setGameStage("preflop");
    setGameResult("");
  };

  const dealFlop = async () => {
    if (gameStage !== "preflop") return;
    
    // Deal 3 cards for the flop
    const flop = [deck[0], deck[1], deck[2]];
    setCommunityCards(flop);
    setDeck(prev => prev.slice(3));
    
    setGameStage("flop");
  };

  const dealTurn = async () => {
    if (gameStage !== "flop") return;
    
    // Deal 1 card for the turn
    const turn = [...communityCards, deck[0]];
    setCommunityCards(turn);
    setDeck(prev => prev.slice(1));
    
    setGameStage("turn");
  };

  const dealRiver = async () => {
    if (gameStage !== "turn") return;
    
    // Deal 1 card for the river
    const river = [...communityCards, deck[0]];
    setCommunityCards(river);
    setDeck(prev => prev.slice(1));
    
    setGameStage("river");
  };

  const showdown = async () => {
    if (gameStage !== "river") return;
    
    setGameStage("showdown");
    
    // Evaluate hands and determine winner
    const playerHandRank = evaluateHand([...playerHand, ...communityCards]);
    const dealerHandRank = evaluateHand([...dealerHand, ...communityCards]);
    
    await delay(1000);
    
    if (playerHandRank.rank > dealerHandRank.rank) {
      setGameResult(`You win with ${playerHandRank.name}!`);
      updateBalance(potSize);
      toast({
        title: "You Won!",
        description: `You won ${potSize} $HOLOCOIN with ${playerHandRank.name}!`,
        variant: "success"
      });
    } else if (dealerHandRank.rank > playerHandRank.rank) {
      setGameResult(`Dealer wins with ${dealerHandRank.name}.`);
      toast({
        title: "Dealer Wins",
        description: `Dealer had ${dealerHandRank.name}.`,
        variant: "default"
      });
    } else {
      setGameResult("It's a tie!");
      updateBalance(potSize / 2);
      toast({
        title: "It's a Tie!",
        description: "Your bet has been returned.",
        variant: "default"
      });
    }
  };

  const fold = () => {
    if (gameStage === "betting" || gameStage === "showdown") return;
    
    setGameResult("You folded.");
    setGameStage("showdown");
    toast({
      title: "You Folded",
      description: "Better luck next time!",
      variant: "default"
    });
  };

  const check = () => {
    if (gameStage === "preflop") {
      dealFlop();
    } else if (gameStage === "flop") {
      dealTurn();
    } else if (gameStage === "turn") {
      dealRiver();
    } else if (gameStage === "river") {
      showdown();
    }
  };

  const call = () => {
    // In a simplified version, this is the same as check
    check();
  };

  const raise = () => {
    if (gameStage === "betting" || gameStage === "showdown") return;
    
    if (betAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough $HOLOCOIN to raise",
        variant: "destructive"
      });
      return;
    }
    
    // Add to pot and player's bet
    setPotSize(prev => prev + betAmount);
    setPlayerBet(prev => prev + betAmount);
    updateBalance(-betAmount);
    
    // Move to next stage
    check();
  };

  const evaluateHand = (cards: Card[]): PokerHand => {
    // Simplified poker hand evaluation
    // In a real implementation, this would be much more comprehensive
    
    // Count cards by value
    const valueCounts: Record<number, number> = {};
    cards.forEach(card => {
      valueCounts[card.numValue] = (valueCounts[card.numValue] || 0) + 1;
    });
    
    // Check for pairs, three of a kind, etc.
    const pairs = Object.values(valueCounts).filter(count => count === 2).length;
    const threeOfAKind = Object.values(valueCounts).some(count => count === 3);
    const fourOfAKind = Object.values(valueCounts).some(count => count === 4);
    
    // Simplified hand evaluation
    if (fourOfAKind) return { name: "Four of a Kind", rank: 7 };
    if (threeOfAKind && pairs > 0) return { name: "Full House", rank: 6 };
    if (threeOfAKind) return { name: "Three of a Kind", rank: 3 };
    if (pairs === 2) return { name: "Two Pair", rank: 2 };
    if (pairs === 1) return { name: "Pair", rank: 1 };
    
    return { name: "High Card", rank: 0 };
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-2xl p-6 h-full flex flex-col">
          {/* Poker Table */}
          <div className="flex-1 flex flex-col items-center justify-between py-8">
            {/* Dealer Area */}
            <div className="w-full text-center mb-4">
              <div className="inline-block bg-card/30 rounded-full px-4 py-1 mb-2">
                <span className="text-white/90">Dealer</span>
              </div>
              {gameStage === "showdown" && (
                <div className="flex justify-center flex-wrap mb-4">
                  {dealerHand.map((card, index) => (
                    <div key={index}>
                      {getCardDisplay(card)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Game Result */}
            {gameResult && (
              <div className="text-xl font-bold text-white bg-primary/30 px-4 py-2 rounded-lg mb-4">
                {gameResult}
              </div>
            )}

            {/* Community Cards */}
            <div className="flex justify-center flex-wrap my-6">
              {communityCards.map((card, index) => (
                <div key={index}>
                  {getCardDisplay(card)}
                </div>
              ))}
              {/* Placeholders for missing community cards */}
              {Array(5 - communityCards.length).fill(0).map((_, index) => (
                <div key={`placeholder-${index}`} className="w-20 h-28 bg-card/20 rounded-lg m-1"></div>
              ))}
            </div>

            {/* Player Cards */}
            <div className="w-full text-center mt-4">
              <div className="flex justify-center flex-wrap mb-4">
                {playerHand.map((card, index) => (
                  <div key={index}>
                    {getCardDisplay(card)}
                  </div>
                ))}
              </div>
              <div className="inline-block bg-card/30 rounded-full px-4 py-1">
                <span className="text-white/90">You</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-4">
            {gameStage === "betting" ? (
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-6" onClick={startGame}>
                Start Game
              </Button>
            ) : gameStage !== "showdown" ? (
              <>
                <Button className="bg-destructive hover:bg-destructive/90 text-white font-bold py-2 px-6 rounded-xl" onClick={fold}>
                  Fold
                </Button>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-2 px-6 rounded-xl" onClick={check}>
                  Check
                </Button>
                <Button className="bg-success hover:bg-success/90 text-white font-bold py-2 px-6 rounded-xl" onClick={call}>
                  Call
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-xl" onClick={raise}>
                  Raise
                </Button>
              </>
            ) : (
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6" onClick={() => setGameStage("betting")}>
                New Game
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-1">
        <div className="bg-card/50 rounded-2xl p-6 h-full">
          <h3 className="font-poppins font-bold text-xl mb-4">Game Information</h3>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-foreground/70">Pot Size:</span>
              <span className="font-bold text-accent">{potSize} $HOLOCOIN</span>
            </div>
            <div className="w-full bg-card/50 rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: `${(potSize / 2000) * 100}%` }}></div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              <span className="text-foreground/70">Your Bet:</span>
              <span>{playerBet} $HOLOCOIN</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-foreground/70 mb-2">Bet Amount</label>
            <div className="flex">
              <Input
                type="number"
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                disabled={gameStage !== "betting"}
                className="w-full bg-card/50 rounded-l-lg border border-white/10 px-4 py-2 text-white"
              />
              <Button
                className="bg-primary px-4 rounded-r-lg text-white"
                onClick={() => setBetAmount(Math.min(balance, 1000))}
                disabled={gameStage !== "betting"}
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="bg-card/30 rounded-xl p-4 mb-4">
            <h4 className="font-bold mb-2">Hand Rankings</h4>
            <ul className="text-sm text-foreground/80 space-y-1">
              <li>Royal Flush</li>
              <li>Straight Flush</li>
              <li>Four of a Kind</li>
              <li>Full House</li>
              <li>Flush</li>
              <li>Straight</li>
              <li>Three of a Kind</li>
              <li>Two Pair</li>
              <li>Pair</li>
              <li>High Card</li>
            </ul>
          </div>

          <div className="flex items-center p-3 bg-primary/10 rounded-xl">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
                alt="Dealer Character"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-foreground/90">
                {gameStage === "betting"
                  ? "Ready to play? Place your bet to start!"
                  : gameStage === "preflop"
                  ? "Check to see the flop, or raise to increase the pot."
                  : gameStage === "flop"
                  ? "Three cards are on the table. What's your move?"
                  : gameStage === "turn"
                  ? "The turn is dealt. One more card to go!"
                  : gameStage === "river"
                  ? "Final card is on the table. Time for showdown!"
                  : "Game over! Ready for another round?"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
