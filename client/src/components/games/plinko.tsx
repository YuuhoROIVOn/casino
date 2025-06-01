import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/context/wallet-context";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/user-context";
import { FaArrowLeft, FaExpand, FaCompress } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, delay, generateGameResult } from "@/lib/utils";
import { Transaction } from "@/types";
import confetti from "canvas-confetti";

// Plinko-specific types
interface PlinkoProps {
  onClose: () => void;
}

interface PlinkoPin {
  x: number;
  y: number;
  radius: number;
}

interface PlinkoBall {
  x: number;
  y: number;
  radius: number;
  velocity: { x: number; y: number };
  path: number[];
  finalPosition: number | null;
}

interface PlinkoMultiplier {
  value: number;
  color: string;
}

const ROWS = 12;
const COLS = 17;
const PIN_RADIUS = 5;
const BALL_RADIUS = 8;
const PIN_SPACING = 40;
const GRAVITY = 0.25;
const BOUNCE_DAMPING = 0.8;
const HORIZONTAL_DAMPING = 0.95;

// Multipliers with varying probabilities (weighted to lose 75% of the time)
const MULTIPLIERS: PlinkoMultiplier[] = [
  { value: 0, color: "#f87171" },     // Red - Lose
  { value: 0.5, color: "#fb923c" },   // Orange - Half back
  { value: 0, color: "#f87171" },     // Red - Lose
  { value: 1.5, color: "#facc15" },   // Yellow - Small win
  { value: 0, color: "#f87171" },     // Red - Lose
  { value: 3, color: "#4ade80" },     // Green - Medium win
  { value: 0, color: "#f87171" },     // Red - Lose
  { value: 10, color: "#60a5fa" },    // Blue - Big win
  { value: 0, color: "#f87171" },     // Red - Lose
  { value: 1.5, color: "#facc15" },   // Yellow - Small win
  { value: 0, color: "#f87171" },     // Red - Lose
  { value: 0.5, color: "#fb923c" },   // Orange - Half back
  { value: 0, color: "#f87171" },     // Red - Lose
  { value: 3, color: "#4ade80" },     // Green - Medium win
  { value: 0, color: "#f87171" },     // Red - Lose
  { value: 0.5, color: "#fb923c" },   // Orange - Half back
  { value: 0, color: "#f87171" },     // Red - Lose
];

export default function Plinko({ onClose }: PlinkoProps) {
  const { balance, updateBalance, addTransaction } = useWalletContext();
  const { user } = useUser();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [lastBallPath, setLastBallPath] = useState<number[]>([]);
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [winnings, setWinnings] = useState<number | null>(null);
  const [startPosition, setStartPosition] = useState<number>(Math.floor(COLS / 2));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<PlinkoPin[]>([]);
  const ballRef = useRef<PlinkoBall | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Setup the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate pins in a triangular pattern
    const pins: PlinkoPin[] = [];
    for (let row = 0; row < ROWS; row++) {
      const offsetX = (row % 2 === 0) ? 0 : PIN_SPACING / 2;
      const pinsInRow = (row % 2 === 0) ? COLS : COLS - 1;
      
      for (let col = 0; col < pinsInRow; col++) {
        pins.push({
          x: offsetX + col * PIN_SPACING + PIN_SPACING,
          y: (row + 1) * PIN_SPACING + 50,
          radius: PIN_RADIUS
        });
      }
    }
    
    pinsRef.current = pins;
    
    // Initial render
    renderGame();
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  // Update canvas size on fullscreen change
  useEffect(() => {
    updateCanvasSize();
    renderGame();
  }, [isFullscreen]);
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      updateCanvasSize();
      renderGame();
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (isFullscreen) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      canvas.width = 800;
      canvas.height = 600;
    }
  };
  
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#111827");
    gradient.addColorStop(1, "#1f2937");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pins
    pinsRef.current.forEach(pin => {
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#d1d5db";
      ctx.fill();
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Draw multiplier buckets
    const bucketWidth = canvas.width / MULTIPLIERS.length;
    const bucketY = (ROWS + 2) * PIN_SPACING + 50;
    
    MULTIPLIERS.forEach((multiplier, index) => {
      // Draw bucket
      ctx.fillStyle = multiplier.color;
      ctx.fillRect(index * bucketWidth, bucketY - 20, bucketWidth, 60);
      
      // Draw multiplier text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${multiplier.value}x`, index * bucketWidth + bucketWidth / 2, bucketY + 10);
    });
    
    // Draw ball
    if (ballRef.current) {
      const ball = ballRef.current;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#f43f5e";
      ctx.fill();
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw start position indicator
    const indicatorY = 30;
    const indicatorX = startPosition * PIN_SPACING + PIN_SPACING;
    
    ctx.beginPath();
    ctx.moveTo(indicatorX, indicatorY);
    ctx.lineTo(indicatorX - 10, indicatorY - 10);
    ctx.lineTo(indicatorX + 10, indicatorY - 10);
    ctx.closePath();
    ctx.fillStyle = "#f43f5e";
    ctx.fill();
  };
  
  const animate = () => {
    if (!ballRef.current) return;
    
    const ball = ballRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Apply gravity
    ball.velocity.y += GRAVITY;
    
    // Update position
    ball.x += ball.velocity.x;
    ball.y += ball.velocity.y;
    
    // Check pin collisions
    pinsRef.current.forEach(pin => {
      const dx = ball.x - pin.x;
      const dy = ball.y - pin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < ball.radius + pin.radius) {
        // Collision detected
        const angle = Math.atan2(dy, dx);
        
        // Push ball away from pin
        ball.x = pin.x + (ball.radius + pin.radius) * Math.cos(angle);
        ball.y = pin.y + (ball.radius + pin.radius) * Math.sin(angle);
        
        // Reflect velocity
        const dot = ball.velocity.x * Math.cos(angle) + ball.velocity.y * Math.sin(angle);
        ball.velocity.x = BOUNCE_DAMPING * (ball.velocity.x - 2 * dot * Math.cos(angle));
        ball.velocity.y = BOUNCE_DAMPING * (ball.velocity.y - 2 * dot * Math.sin(angle));
        
        // Add some randomness
        ball.velocity.x += (Math.random() - 0.5) * 0.5;
        
        // Record path for animation replay
        if (lastBallPath.length < 100) {  // Limit path length
          const pathIndex = Math.floor(ball.x / canvas.width * MULTIPLIERS.length);
          setLastBallPath(prev => [...prev, pathIndex]);
        }
      }
    });
    
    // Apply horizontal damping
    ball.velocity.x *= HORIZONTAL_DAMPING;
    
    // Check wall collisions
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.velocity.x = -ball.velocity.x * BOUNCE_DAMPING;
    } else if (ball.x + ball.radius > canvas.width) {
      ball.x = canvas.width - ball.radius;
      ball.velocity.x = -ball.velocity.x * BOUNCE_DAMPING;
    }
    
    // Check if ball reached bottom
    const bucketY = (ROWS + 2) * PIN_SPACING + 50;
    if (ball.y > bucketY && !ball.finalPosition) {
      // Calculate which bucket the ball landed in
      const bucketWidth = canvas.width / MULTIPLIERS.length;
      const bucketIndex = Math.floor(ball.x / bucketWidth);
      
      // Ensure index is in bounds
      const safeIndex = Math.max(0, Math.min(bucketIndex, MULTIPLIERS.length - 1));
      ball.finalPosition = safeIndex;
      
      // Set multiplier and calculate winnings
      const multiplier = MULTIPLIERS[safeIndex].value;
      const winAmount = betAmount * multiplier;
      setWinnings(winAmount);
      
      // Update balance and add transaction
      updateBalance(balance + winAmount);
      
      // Record transaction
      const isWin = winAmount > betAmount;
      addTransaction({
        amount: winAmount - betAmount,
        description: `Plinko ${isWin ? 'Win' : 'Loss'}: ${multiplier}x multiplier`,
        type: isWin ? 'game' : 'game',
      });
      
      // Show toast notification
      if (winAmount > 0) {
        toast({
          title: "You Won!",
          description: `You won ${formatCurrency(winAmount)} with a ${multiplier}x multiplier!`,
          variant: "success",
        });
        
        // Trigger confetti if it's a big win
        if (multiplier >= 3) {
          triggerConfetti();
        }
      } else {
        toast({
          title: "Better Luck Next Time",
          description: "The ball landed on a 0x multiplier.",
          variant: "destructive",
        });
      }
      
      // Stop animation after a short delay to let the ball settle
      setTimeout(() => {
        setIsDropping(false);
        cancelAnimationFrame(animationFrameRef.current);
      }, 1000);
      
      return;
    }
    
    // Continue animation if not done
    renderGame();
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  const dropBall = () => {
    if (isDropping) return;
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
    
    // Update balance
    updateBalance(balance - betAmount);
    
    // Reset state
    setIsDropping(true);
    setWinnings(null);
    setLastBallPath([]);
    
    // Adjust starting velocity based on risk level
    let velocityX = 0;
    switch (risk) {
      case "low":
        velocityX = (Math.random() - 0.5) * 1;
        break;
      case "medium":
        velocityX = (Math.random() - 0.5) * 2;
        break;
      case "high":
        velocityX = (Math.random() - 0.5) * 4;
        break;
    }
    
    // Create new ball
    ballRef.current = {
      x: startPosition * PIN_SPACING + PIN_SPACING,
      y: 40,
      radius: BALL_RADIUS,
      velocity: { x: velocityX, y: 0 },
      path: [],
      finalPosition: null
    };
    
    // Bias the result based on the 75% house edge
    const shouldWin = generateGameResult(0.25); // 25% chance to win
    
    if (!shouldWin) {
      // If should lose, add a bias towards 0x multiplier slots
      // This is simplistic - in a real implementation, you'd want more sophisticated rigging
      ballRef.current.velocity.x += (startPosition < COLS / 2) ? 2 : -2;
    }
    
    // Start animation
    renderGame();
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const x = canvasRect.left + (ballRef.current?.x || canvas.width / 2);
    const y = canvasRect.top + (ballRef.current?.y || canvas.height / 2);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { 
        x: x / window.innerWidth, 
        y: y / window.innerHeight 
      },
    });
  };
  
  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    
    if (!isFullscreen) {
      if (gameContainerRef.current.requestFullscreen) {
        gameContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  return (
    <div 
      ref={gameContainerRef}
      className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'w-full relative'}`}
    >
      <div className="flex justify-between items-center p-4 bg-background/90 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <FaArrowLeft />
          </Button>
          <h2 className="text-2xl font-bold text-primary">Plinko</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-background/50 rounded-lg py-1 px-3 flex items-center">
            <span className="text-muted-foreground mr-2">Balance:</span>
            <span className="font-bold text-primary">{formatCurrency(balance)}</span>
          </div>
          
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative flex flex-col">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600}
          className="bg-background mx-auto"
        />
        
        <div className={`${isFullscreen ? 'absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm' : 'p-4'}`}>
          <div className="flex flex-wrap gap-4 justify-center items-end">
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
                disabled={isDropping}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select 
                value={risk} 
                onValueChange={(value) => setRisk(value as "low" | "medium" | "high")}
                disabled={isDropping}
              >
                <SelectTrigger id="riskLevel" className="w-32">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startPos">Start Position</Label>
              <Input
                id="startPos"
                type="range"
                min={0}
                max={COLS - 1}
                value={startPosition}
                onChange={(e) => setStartPosition(Number(e.target.value))}
                className="w-32"
                disabled={isDropping}
              />
            </div>
            
            <div className="ml-4">
              <AnimatePresence>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Button 
                    onClick={dropBall}
                    disabled={isDropping}
                    size="lg"
                    className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-bold"
                  >
                    {isDropping ? "Dropping..." : "Drop Ball"}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {winnings !== null && (
              <div className="ml-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-lg px-4 py-2 ${winnings > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                >
                  <span className="font-bold">
                    {winnings > 0 ? `Won ${formatCurrency(winnings)}!` : "Better luck next time!"}
                  </span>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}