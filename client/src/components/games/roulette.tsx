import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { delay, getRandomNumber } from "@/lib/utils";

interface RouletteProps {
  onClose: () => void;
}

export default function Roulette({ onClose }: RouletteProps) {
  const [betAmount, setBetAmount] = useState(100);
  const [betType, setBetType] = useState("single");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { balance, updateBalance } = useWallet();
  const { toast } = useToast();

  // Roulette numbers in order
  const rouletteNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  const getNumberColor = (num: number) => {
    if (num === 0) return "bg-secondary text-white";
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? "bg-primary text-white" : "bg-card text-white";
  };

  const toggleNumberSelection = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      if (betType === "single" && selectedNumbers.length >= 1) {
        setSelectedNumbers([num]);
      } else {
        setSelectedNumbers([...selectedNumbers, num]);
      }
    }
  };

  const setBetMax = () => {
    if (balance < 1000) {
      setBetAmount(balance);
    } else {
      setBetAmount(1000);
    }
  };

  const spinWheel = async () => {
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

    if (selectedNumbers.length === 0) {
      toast({
        title: "No bet placed",
        description: "Please select at least one number",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    
    // Deduct bet amount
    updateBalance(-betAmount);
    
    // Spin animation
    if (wheelRef.current) {
      const spins = 5;
      const randomResult = getRandomNumber(0, 36);
      setResult(randomResult);
      
      const resultIndex = rouletteNumbers.indexOf(randomResult);
      const rotationDegrees = 360 * spins + (360 / 37) * resultIndex;
      
      wheelRef.current.style.transition = "transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)";
      wheelRef.current.style.transform = `rotate(${rotationDegrees}deg)`;
      
      await delay(4500);
      
      // Check if won
      const won = selectedNumbers.includes(randomResult);
      
      let winAmount = 0;
      if (won) {
        if (betType === "single") {
          winAmount = betAmount * 35;
        } else if (betType === "red-black" || betType === "odd-even" || betType === "high-low") {
          winAmount = betAmount * 2;
        } else if (betType === "dozen" || betType === "column") {
          winAmount = betAmount * 3;
        }
        
        updateBalance(winAmount);
        
        toast({
          title: "You Won!",
          description: `You won ${winAmount} $HOLOCOIN!`,
          variant: "success"
        });
      } else {
        toast({
          title: "Better luck next time",
          description: `The result was ${randomResult}`,
          variant: "default"
        });
      }
      
      setShowResult(true);
      setIsSpinning(false);
      
      // Reset wheel after animation
      await delay(1000);
      if (wheelRef.current) {
        wheelRef.current.style.transition = "none";
        wheelRef.current.style.transform = "rotate(0deg)";
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="bg-card/50 rounded-2xl p-6 h-full flex flex-col items-center justify-center">
          <div
            ref={wheelRef}
            className="roulette-wheel mb-6 transform transition-all duration-1000"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-card/80 text-white flex items-center justify-center text-xl">
                0
              </div>
            </div>
            {/* This would be replaced with actual wheel segments in a real implementation */}
          </div>
          
          {showResult && result !== null && (
            <div className="text-xl font-bold mb-4">
              Result: 
              <span className={`ml-2 px-3 py-1 rounded-md ${getNumberColor(result)}`}>
                {result}
              </span>
            </div>
          )}
          
          <Button
            className="spin-button bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-8 rounded-full shadow-lg mt-6"
            onClick={spinWheel}
            disabled={isSpinning}
          >
            {isSpinning ? "Spinning..." : "SPIN"}
          </Button>
        </div>
      </div>
      
      <div className="col-span-1">
        <div className="bg-card/50 rounded-2xl p-6 h-full">
          <h3 className="font-poppins font-bold text-xl mb-4">Place Your Bets</h3>
          
          <div className="mb-4">
            <Label className="block text-sm text-foreground/70 mb-2">Bet Amount</Label>
            <div className="flex">
              <Input
                type="number"
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-card/50 rounded-l-lg border border-white/10 px-4 py-2 text-white"
              />
              <Button 
                className="bg-primary px-4 rounded-r-lg text-white"
                onClick={setBetMax}
              >
                MAX
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm text-foreground/70 mb-2">Bet Type</Label>
            <select
              className="w-full bg-card/50 rounded-lg border border-white/10 px-4 py-2 text-white"
              value={betType}
              onChange={(e) => {
                setBetType(e.target.value);
                setSelectedNumbers([]);
              }}
            >
              <option value="single">Single Number</option>
              <option value="red-black">Red/Black</option>
              <option value="odd-even">Odd/Even</option>
              <option value="high-low">1-18/19-36</option>
              <option value="dozen">Dozens</option>
              <option value="column">Columns</option>
            </select>
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm text-foreground/70 mb-2">Select Numbers</Label>
            <div className="grid grid-cols-6 gap-2">
              {/* Simplified for display - would include all numbers in actual implementation */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
                <button
                  key={num}
                  className={`w-8 h-8 rounded-full ${
                    selectedNumbers.includes(num) 
                      ? "ring-2 ring-white" 
                      : ""
                  } ${getNumberColor(num)}`}
                  onClick={() => toggleNumberSelection(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-2 rounded-xl transition mt-4"
            onClick={spinWheel}
            disabled={isSpinning}
          >
            Place Bet
          </Button>
        </div>
      </div>
    </div>
  );
}
