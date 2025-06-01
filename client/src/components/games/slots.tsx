import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/context/wallet-context";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/user-context";
import { FaArrowLeft, FaExpand, FaCompress, FaCog, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { formatCurrency, generateGameResult } from "@/lib/utils";
import confetti from "canvas-confetti";

// Slot machine types
interface SlotProps {
  onClose: () => void;
}

interface Symbol {
  id: string;
  name: string;
  value: number;
  image: string;
}

interface SlotReel {
  symbols: Symbol[];
  spinning: boolean;
  stoppedAt: number | null;
}

interface WinningLine {
  symbols: Symbol[];
  multiplier: number;
  lineNumber: number;
}

// Slot machine symbols
const SYMBOLS: Symbol[] = [
  { id: "cherry", name: "Cherry", value: 1, image: "https://pixabay.com/get/gf7ccd7df61b36ee7ccf4cc4c903f52ce1aca5ed52f20e0bb2e05c2aad6dbf723b1c7fab9deace022c46a47ad3edbf9b2bd9cd7ce7e2e4be40c6dcc4c35cd8243_1280.png" },
  { id: "lemon", name: "Lemon", value: 1.5, image: "https://pixabay.com/get/g5cc0b26c0adbe0ff4af825f8fc8a6a0d0fad44bc18dfadf56b90abd01f9f11ccd2f52071cc0da34a4e17d51d1b6c1f9df9d4cc06af0b4cb67f3f54adead92ec7_1280.png" },
  { id: "orange", name: "Orange", value: 2, image: "https://pixabay.com/get/g06cc66fc06cc582a2d6cdf96fa5a1e7c42feb0cc8e98feabea9e61e88d6c1d9ce8d0bd3c6a0cb68e11d143842d1a96c45bcb7f7ce29d2fa0ca8e6c7fbe0ca0bd_1280.png" },
  { id: "plum", name: "Plum", value: 2.5, image: "https://pixabay.com/get/ga70dcc5b95e39147f9d293dc4b1d5c1e5acf28d3b1fbf0e0d3c69cd5a7de3e72b4582824e79ea43cef8e4cfa72dd83d0a6b32ae8cdc8dd7b3bc91cd3b0d4b5f9_1280.png" },
  { id: "bell", name: "Bell", value: 3, image: "https://pixabay.com/get/ge5b4c1e4de62b2b41022b08d74e6aedf6b1eec1ebe4ef5fddfee59ae3dbad87eb7a9fd1c60d1c5cbbf0fcd3bf36e14c29d4c1bda8fcbf11aaf2ad1064c4c0eae_1280.png" },
  { id: "seven", name: "Seven", value: 5, image: "https://pixabay.com/get/g8b1f4e7608b6ce59304c70a85f0f7e0f0e4cc54b9ece5f5389c1ce9ed6bb7f7aaf7be59f7e81c5b0aa7aa1d8dd05c16d913c3dd3cc3e8c57c21bb96c4dd4a7d7_1280.png" },
  { id: "bar", name: "Bar", value: 7, image: "https://pixabay.com/get/g6ab8bc38c52f9fc31e21f7e6ece96363c9c2dd2d9e767a00a23e88fd9fae7bdb77dc99c08c27a7e7dbf53d4d8aea9be27dee2b88e6a5ca46bac2c0d33a2d2be1_1280.png" },
  { id: "wild", name: "Wild", value: 10, image: "https://pixabay.com/get/g483cdc24f6d7d0d5c4d8d2975a2abf90532e08df7ea50ca0fc89bff58f4dc06a67c3a7bf4e95ded69e5fb2a74a2c38c3_1280.png" },
];

// Constants
const NUM_REELS = 5;
const VISIBLE_SYMBOLS = 3;
const REEL_SPIN_TIME = 2000; // ms
const PRIZE_MULTIPLIER = 0.75; // Adjusted for 75% house edge

export default function SlotMachine({ onClose }: SlotProps) {
  const { balance, updateBalance, addTransaction } = useWalletContext();
  const { user } = useUser();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reels, setReels] = useState<SlotReel[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningLines, setWinningLines] = useState<WinningLine[]>([]);
  const [totalWin, setTotalWin] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [paytableVisible, setPaytableVisible] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const slotMachineRef = useRef<HTMLDivElement>(null);
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const jackpotSound = useRef<HTMLAudioElement | null>(null);

  // Initialize the slot machine
  useEffect(() => {
    // Create initial reels
    const initialReels: SlotReel[] = Array.from({ length: NUM_REELS }, () => ({
      symbols: generateRandomSymbols(30),
      spinning: false,
      stoppedAt: null
    }));
    
    setReels(initialReels);
    
    // Create audio elements
    spinSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3");
    winSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3");
    jackpotSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/273/273-preview.mp3");
    
    // Cleanup
    return () => {
      spinSound.current?.pause();
      winSound.current?.pause();
      jackpotSound.current?.pause();
    };
  }, []);

  const generateRandomSymbols = (count: number): Symbol[] => {
    const result: Symbol[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      result.push(SYMBOLS[randomIndex]);
    }
    return result;
  };

  const spin = async () => {
    if (isSpinning) return;
    
    // Validate bet
    if (betAmount <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (betAmount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough $HOLOCOIN for this bet.",
        variant: "destructive",
      });
      return;
    }
    
    // Deduct bet amount
    updateBalance(balance - betAmount);
    
    // Reset previous win
    setWinningLines([]);
    setTotalWin(0);
    
    // Start spinning
    setIsSpinning(true);
    
    // Play spin sound
    if (soundEnabled && spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(() => {});
    }
    
    // Create new reels with fresh symbols
    const newReels = reels.map(reel => ({
      ...reel,
      symbols: generateRandomSymbols(30),
      spinning: true,
      stoppedAt: null
    }));
    
    setReels(newReels);
    
    // Determine if the player should win based on house edge
    const shouldWin = generateGameResult(0.25); // 25% chance to win
    
    // Prepare rigged outcome if necessary
    let riggedOutcome: number[] | null = null;
    
    if (shouldWin) {
      // Player wins, select a random winning pattern
      const winType = Math.random();
      
      if (winType < 0.7) {
        // Small win (3 matching symbols in middle row)
        const symbolIndex = Math.floor(Math.random() * (SYMBOLS.length - 2)); // Avoid highest value symbols
        riggedOutcome = Array(NUM_REELS).fill(symbolIndex);
      } else if (winType < 0.95) {
        // Medium win (4 matching high value symbols)
        const symbolIndex = Math.floor(Math.random() * 3) + (SYMBOLS.length - 3); // Higher value symbols
        riggedOutcome = Array(NUM_REELS).fill(symbolIndex);
      } else {
        // Jackpot (5 matching wilds or 7s)
        const symbolIndex = SYMBOLS.length - 1; // Wild symbol
        riggedOutcome = Array(NUM_REELS).fill(symbolIndex);
      }
    }
    
    // Stop reels one by one with a delay
    for (let i = 0; i < NUM_REELS; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newReels = [...reels];
      
      // If we have a rigged outcome, ensure this reel shows the right symbol
      if (riggedOutcome) {
        const targetSymbol = SYMBOLS[riggedOutcome[i]];
        
        // Ensure the middle position will have the targeted symbol
        const currentSymbols = [...newReels[i].symbols];
        currentSymbols[Math.floor(currentSymbols.length / 2)] = targetSymbol;
        
        newReels[i] = {
          ...newReels[i],
          symbols: currentSymbols,
          spinning: false,
          stoppedAt: Math.floor(currentSymbols.length / 2) - 1
        };
      } else {
        newReels[i] = {
          ...newReels[i],
          spinning: false,
          stoppedAt: Math.floor(Math.random() * (newReels[i].symbols.length - VISIBLE_SYMBOLS))
        };
      }
      
      setReels(newReels);
    }
    
    // Calculate winnings after all reels have stopped
    setTimeout(() => {
      const visibleSymbols = getVisibleSymbols();
      const lines = calculateWinningLines(visibleSymbols);
      
      setWinningLines(lines);
      
      // Calculate total win
      const win = lines.reduce((total, line) => total + line.multiplier * betAmount, 0);
      setTotalWin(win);
      
      // Update balance
      if (win > 0) {
        updateBalance(balance - betAmount + win);
        
        // Record transaction
        addTransaction({
          amount: win - betAmount,
          description: `Slot Machine ${win > betAmount ? 'Win' : 'Loss'}: ${win > 0 ? formatCurrency(win) : '0'}`,
          type: 'game',
        });
        
        // Play win sound
        if (soundEnabled) {
          if (win >= betAmount * 5) {
            // Jackpot win
            jackpotSound.current?.play().catch(() => {});
            triggerJackpotAnimation();
          } else {
            // Regular win
            winSound.current?.play().catch(() => {});
          }
        }
        
        // Show toast
        toast({
          title: win >= betAmount * 5 ? "JACKPOT! 🎉" : "You Won!",
          description: `You won ${formatCurrency(win)}!`,
          variant: "success",
        });
      } else {
        // Record loss transaction
        addTransaction({
          amount: -betAmount,
          description: "Slot Machine Loss",
          type: 'game',
        });
        
        toast({
          title: "Better Luck Next Time",
          description: "No winning combinations this time.",
          variant: "destructive",
        });
      }
      
      setIsSpinning(false);
    }, 500);
  };
  
  const getVisibleSymbols = (): Symbol[][] => {
    return reels.map(reel => {
      if (reel.stoppedAt === null) return Array(VISIBLE_SYMBOLS).fill(SYMBOLS[0]);
      
      const startIndex = reel.stoppedAt;
      const visibleSymbols: Symbol[] = [];
      
      for (let i = 0; i < VISIBLE_SYMBOLS; i++) {
        const index = (startIndex + i) % reel.symbols.length;
        visibleSymbols.push(reel.symbols[index]);
      }
      
      return visibleSymbols;
    });
  };
  
  const calculateWinningLines = (visibleSymbols: Symbol[][]): WinningLine[] => {
    const lines: WinningLine[] = [];
    
    // Check horizontal lines
    for (let row = 0; row < VISIBLE_SYMBOLS; row++) {
      const lineSymbols = visibleSymbols.map(reelSymbols => reelSymbols[row]);
      const firstSymbol = lineSymbols[0];
      
      // Count how many consecutive symbols match the first one (or are wild)
      let matchCount = 1;
      for (let i = 1; i < lineSymbols.length; i++) {
        if (lineSymbols[i].id === firstSymbol.id || lineSymbols[i].id === 'wild') {
          matchCount++;
        } else {
          break;
        }
      }
      
      // If at least 3 matches, it's a win
      if (matchCount >= 3) {
        // Calculate multiplier based on symbol value and number of matches
        const baseMultiplier = firstSymbol.value;
        const multiplier = baseMultiplier * (matchCount - 2) * PRIZE_MULTIPLIER;
        
        lines.push({
          symbols: lineSymbols.slice(0, matchCount),
          multiplier,
          lineNumber: row
        });
      }
    }
    
    // Check diagonal lines (top-left to bottom-right)
    const diagonalDown: Symbol[] = [];
    for (let i = 0; i < Math.min(NUM_REELS, VISIBLE_SYMBOLS); i++) {
      diagonalDown.push(visibleSymbols[i][i]);
    }
    
    let matchCount = 1;
    const firstSymbol = diagonalDown[0];
    for (let i = 1; i < diagonalDown.length; i++) {
      if (diagonalDown[i].id === firstSymbol.id || diagonalDown[i].id === 'wild') {
        matchCount++;
      } else {
        break;
      }
    }
    
    if (matchCount >= 3) {
      const baseMultiplier = firstSymbol.value;
      const multiplier = baseMultiplier * (matchCount - 2) * PRIZE_MULTIPLIER * 1.5; // Diagonal pays more
      
      lines.push({
        symbols: diagonalDown.slice(0, matchCount),
        multiplier,
        lineNumber: 3 // diagonal down
      });
    }
    
    // Check diagonal lines (bottom-left to top-right)
    const diagonalUp: Symbol[] = [];
    for (let i = 0; i < Math.min(NUM_REELS, VISIBLE_SYMBOLS); i++) {
      diagonalUp.push(visibleSymbols[i][VISIBLE_SYMBOLS - 1 - i]);
    }
    
    matchCount = 1;
    const firstDiagUpSymbol = diagonalUp[0];
    for (let i = 1; i < diagonalUp.length; i++) {
      if (diagonalUp[i].id === firstDiagUpSymbol.id || diagonalUp[i].id === 'wild') {
        matchCount++;
      } else {
        break;
      }
    }
    
    if (matchCount >= 3) {
      const baseMultiplier = firstDiagUpSymbol.value;
      const multiplier = baseMultiplier * (matchCount - 2) * PRIZE_MULTIPLIER * 1.5; // Diagonal pays more
      
      lines.push({
        symbols: diagonalUp.slice(0, matchCount),
        multiplier,
        lineNumber: 4 // diagonal up
      });
    }
    
    return lines;
  };
  
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  const togglePaytable = () => {
    setPaytableVisible(!paytableVisible);
  };
  
  const triggerJackpotAnimation = () => {
    // Multiple confetti blasts
    const colors = ['#FF3D69', '#FFD300', '#00FF8B', '#00CFFF', '#FF8BFF'];
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6, x: 0.5 },
          colors: colors,
        });
      }, i * 600);
    }
    
    // Side confetti
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });
    }, 300);
  };
  
  return (
    <div 
      ref={containerRef}
      className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'w-full relative'}`}
    >
      <div className="flex justify-between items-center p-4 bg-background/90 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <FaArrowLeft />
          </Button>
          <h2 className="text-2xl font-bold text-primary">Slot Machine</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-background/50 rounded-lg py-1 px-3 flex items-center">
            <span className="text-muted-foreground mr-2">Balance:</span>
            <span className="font-bold text-primary">{formatCurrency(balance)}</span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleSound}>
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={togglePaytable}>
            <FaCog />
          </Button>
          
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <AnimatePresence>
          {paytableVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4"
            >
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Paytable</span>
                    <Button variant="ghost" size="sm" onClick={togglePaytable}>Close</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {SYMBOLS.map(symbol => (
                      <div key={symbol.id} className="flex items-center space-x-4 p-2 border rounded-lg">
                        <img src={symbol.image} alt={symbol.name} className="w-10 h-10 object-contain" />
                        <div>
                          <h4 className="font-bold">{symbol.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Match 3: {symbol.value}x • Match 4: {symbol.value * 2}x • Match 5: {symbol.value * 3}x
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <h3 className="font-bold">Winning Lines</h3>
                    <p>- Top Row: Match 3 or more symbols from left to right</p>
                    <p>- Middle Row: Match 3 or more symbols from left to right</p>
                    <p>- Bottom Row: Match 3 or more symbols from left to right</p>
                    <p>- Diagonal Down: Match 3 or more symbols diagonally (top-left to bottom-right)</p>
                    <p>- Diagonal Up: Match 3 or more symbols diagonally (bottom-left to top-right)</p>
                    
                    <p className="mt-4 italic text-muted-foreground">Wild symbols can substitute for any other symbol</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div 
          ref={slotMachineRef}
          className="relative bg-gradient-to-b from-indigo-900 to-purple-900 rounded-xl border-4 border-yellow-500 shadow-2xl p-4 max-w-5xl w-full"
        >
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-3xl bg-black/70 rounded-lg p-4">
              <div className="flex space-x-2 overflow-hidden">
                {reels.map((reel, reelIndex) => (
                  <div 
                    key={reelIndex} 
                    className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg"
                    style={{ height: `${VISIBLE_SYMBOLS * 80}px` }}
                  >
                    <div 
                      className={`absolute inset-0 flex flex-col transition-transform duration-${REEL_SPIN_TIME} ${reel.spinning ? 'animate-spin-reel' : ''}`}
                      style={{
                        transform: reel.stoppedAt !== null ? `translateY(-${reel.stoppedAt * 80}px)` : 'translateY(0)'
                      }}
                    >
                      {reel.symbols.map((symbol, symbolIndex) => (
                        <div 
                          key={`${reelIndex}-${symbolIndex}`} 
                          className="h-20 flex items-center justify-center p-2"
                        >
                          <img 
                            src={symbol.image} 
                            alt={symbol.name} 
                            className="max-h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Winning lines overlay */}
              {winningLines.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {winningLines.map((line, index) => {
                    // Calculate line position based on lineNumber
                    let lineStyle = {};
                    
                    if (line.lineNumber === 0) {
                      // Top row
                      lineStyle = { top: '25%', height: '5px' };
                    } else if (line.lineNumber === 1) {
                      // Middle row
                      lineStyle = { top: '50%', height: '5px' };
                    } else if (line.lineNumber === 2) {
                      // Bottom row
                      lineStyle = { top: '75%', height: '5px' };
                    } else if (line.lineNumber === 3) {
                      // Diagonal down
                      lineStyle = { 
                        transform: 'rotate(45deg)', 
                        transformOrigin: 'left center',
                        width: '150%',
                        top: '50%',
                        left: '-10%',
                        height: '5px'
                      };
                    } else if (line.lineNumber === 4) {
                      // Diagonal up
                      lineStyle = { 
                        transform: 'rotate(-45deg)', 
                        transformOrigin: 'left center',
                        width: '150%',
                        top: '50%',
                        left: '-10%',
                        height: '5px'
                      };
                    }
                    
                    return (
                      <motion.div
                        key={index}
                        className="absolute inset-x-0 bg-yellow-500 opacity-70 z-10"
                        style={lineStyle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.7, 0, 0.7, 0, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            {totalWin > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-yellow-500 text-yellow-900 px-8 py-3 rounded-full font-bold text-xl"
              >
                Winner! {formatCurrency(totalWin)}
              </motion.div>
            )}
            
            <div className="flex items-end space-x-4">
              <div className="space-y-2">
                <Label htmlFor="betAmount">Bet Amount</Label>
                <Input
                  id="betAmount"
                  type="number"
                  min={10}
                  max={1000}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-32"
                  disabled={isSpinning}
                />
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={spin}
                  disabled={isSpinning}
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-8 py-6 rounded-xl"
                >
                  {isSpinning ? "Spinning..." : "SPIN"}
                </Button>
              </motion.div>
            </div>
          </div>
          
          {/* Hololive-themed decorations */}
          <div className="absolute -top-10 right-10 transform rotate-12">
            <img 
              src="https://pixabay.com/get/gf7ccd7df61b36ee7ccf4cc4c903f52ce1aca5ed52f20e0bb2e05c2aad6dbf723b1c7fab9deace022c46a47ad3edbf9b2bd9cd7ce7e2e4be40c6dcc4c35cd8243_1280.png" 
              alt="Cherry" 
              className="w-16 h-16 object-contain animate-bounce" 
              style={{ animationDuration: '2s' }}
            />
          </div>
          
          <div className="absolute -left-5 bottom-20 transform -rotate-12">
            <img 
              src="https://pixabay.com/get/g8b1f4e7608b6ce59304c70a85f0f7e0f0e4cc54b9ece5f5389c1ce9ed6bb7f7aaf7be59f7e81c5b0aa7aa1d8dd05c16d913c3dd3cc3e8c57c21bb96c4dd4a7d7_1280.png" 
              alt="Seven" 
              className="w-16 h-16 object-contain animate-pulse" 
              style={{ animationDuration: '3s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}