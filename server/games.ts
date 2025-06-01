import { getRandomNumber } from "../client/src/lib/utils";

interface RouletteResult {
  number: number;
  color: 'red' | 'black' | 'green';
  isWin: boolean;
  winAmount: number;
  multiplier: number;
}

interface BlackjackResult {
  playerCards: Card[];
  dealerCards: Card[];
  playerTotal: number;
  dealerTotal: number;
  isWin: boolean;
  isPush: boolean;
  winAmount: number;
}

interface PokerResult {
  playerHand: Card[];
  dealerHand: Card[];
  communityCards: Card[];
  playerHandRank: HandRank;
  dealerHandRank: HandRank;
  isWin: boolean;
  winAmount: number;
}

interface PlinkoResult {
  path: number[];
  finalPosition: number;
  multiplier: number;
  isWin: boolean;
  winAmount: number;
}

interface SlotResult {
  reels: Symbol[][];
  winningLines: WinningLine[];
  isJackpot: boolean;
  isWin: boolean;
  winAmount: number;
  multiplier: number;
}

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  numValue: number;
}

interface Symbol {
  id: number;
  name: string;
  value: number;
}

interface WinningLine {
  line: number;
  symbols: Symbol[];
  multiplier: number;
}

interface HandRank {
  name: string;
  rank: number;
}

class GameService {
  // Roulette game logic
  playRoulette(betAmount: number, betType: string, selectedNumbers: number[]): RouletteResult {
    const rouletteNumbers = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
    ];
    
    // Red numbers on a roulette wheel
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    
    // Randomly select a number
    const resultNumber = getRandomNumber(0, 36);
    const resultColor = resultNumber === 0 ? 'green' : (redNumbers.includes(resultNumber) ? 'red' : 'black');
    
    let isWin = false;
    let winAmount = 0;
    let multiplier = 0;
    
    // Check win conditions based on bet type
    switch (betType) {
      case 'single':
        isWin = selectedNumbers.includes(resultNumber);
        multiplier = isWin ? 35 : 0;
        break;
      case 'red-black':
        const bettingOnRed = selectedNumbers[0] === 1; // Assuming 1 means betting on red, 0 means black
        isWin = (bettingOnRed && resultColor === 'red') || (!bettingOnRed && resultColor === 'black');
        multiplier = isWin ? 1 : 0;
        break;
      case 'odd-even':
        const bettingOnOdd = selectedNumbers[0] === 1; // Assuming 1 means betting on odd, 0 means even
        isWin = resultNumber !== 0 && ((bettingOnOdd && resultNumber % 2 === 1) || (!bettingOnOdd && resultNumber % 2 === 0));
        multiplier = isWin ? 1 : 0;
        break;
      case 'high-low':
        const bettingOnHigh = selectedNumbers[0] === 1; // Assuming 1 means betting on 19-36, 0 means 1-18
        isWin = resultNumber !== 0 && ((bettingOnHigh && resultNumber >= 19) || (!bettingOnHigh && resultNumber <= 18));
        multiplier = isWin ? 1 : 0;
        break;
      case 'dozen':
        const dozen = selectedNumbers[0]; // 0 for 1-12, 1 for 13-24, 2 for 25-36
        isWin = resultNumber !== 0 && 
                ((dozen === 0 && resultNumber >= 1 && resultNumber <= 12) ||
                 (dozen === 1 && resultNumber >= 13 && resultNumber <= 24) ||
                 (dozen === 2 && resultNumber >= 25 && resultNumber <= 36));
        multiplier = isWin ? 2 : 0;
        break;
      case 'column':
        const column = selectedNumbers[0]; // 0 for 1st column, 1 for 2nd column, 2 for 3rd column
        isWin = resultNumber !== 0 && resultNumber % 3 === column;
        multiplier = isWin ? 2 : 0;
        break;
    }
    
    winAmount = betAmount * multiplier;
    
    return {
      number: resultNumber,
      color: resultColor,
      isWin,
      winAmount,
      multiplier
    };
  }
  
  // Blackjack game logic
  playBlackjack(betAmount: number, playerAction: 'hit' | 'stand' | 'double' | 'split'): BlackjackResult {
    // Create and shuffle a deck
    const deck = this.createShuffledDeck();
    
    // Deal initial cards
    const playerCards = [deck.pop()!, deck.pop()!];
    const dealerCards = [deck.pop()!, deck.pop()!];
    
    let playerTotal = this.calculateHandTotal(playerCards);
    let dealerTotal = this.calculateHandTotal(dealerCards);
    
    // Handle player action
    if (playerAction === 'hit') {
      playerCards.push(deck.pop()!);
      playerTotal = this.calculateHandTotal(playerCards);
      
      // If player busts, dealer wins
      if (playerTotal > 21) {
        return {
          playerCards,
          dealerCards,
          playerTotal,
          dealerTotal,
          isWin: false,
          isPush: false,
          winAmount: 0
        };
      }
    } else if (playerAction === 'double') {
      playerCards.push(deck.pop()!);
      playerTotal = this.calculateHandTotal(playerCards);
      
      // If player busts, dealer wins
      if (playerTotal > 21) {
        return {
          playerCards,
          dealerCards,
          playerTotal,
          dealerTotal,
          isWin: false,
          isPush: false,
          winAmount: 0
        };
      }
    }
    
    // Dealer's turn (only if player didn't bust)
    if (playerTotal <= 21) {
      // Dealer hits until 17 or higher
      while (dealerTotal < 17) {
        dealerCards.push(deck.pop()!);
        dealerTotal = this.calculateHandTotal(dealerCards);
      }
    }
    
    // Determine winner
    let isWin = false;
    let isPush = false;
    let winAmount = 0;
    
    if (playerTotal > 21) {
      // Player busts, dealer wins
      isWin = false;
    } else if (dealerTotal > 21) {
      // Dealer busts, player wins
      isWin = true;
      winAmount = playerAction === 'double' ? betAmount * 4 : betAmount * 2;
    } else if (playerTotal > dealerTotal) {
      // Player has higher total, player wins
      isWin = true;
      winAmount = playerAction === 'double' ? betAmount * 4 : betAmount * 2;
    } else if (playerTotal < dealerTotal) {
      // Dealer has higher total, dealer wins
      isWin = false;
    } else {
      // Equal totals, push (tie)
      isPush = true;
      winAmount = playerAction === 'double' ? betAmount * 2 : betAmount;
    }
    
    return {
      playerCards,
      dealerCards,
      playerTotal,
      dealerTotal,
      isWin,
      isPush,
      winAmount
    };
  }
  
  // Poker game logic
  playPoker(betAmount: number, playerAction: 'fold' | 'check' | 'call' | 'raise'): PokerResult {
    // Create and shuffle a deck
    const deck = this.createShuffledDeck();
    
    // Deal initial cards
    const playerHand = [deck.pop()!, deck.pop()!];
    const dealerHand = [deck.pop()!, deck.pop()!];
    
    // Deal community cards
    const communityCards = [deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!];
    
    // If player folds, dealer wins automatically
    if (playerAction === 'fold') {
      return {
        playerHand,
        dealerHand,
        communityCards,
        playerHandRank: { name: 'Fold', rank: 0 },
        dealerHandRank: { name: 'Win by fold', rank: 1 },
        isWin: false,
        winAmount: 0
      };
    }
    
    // Evaluate hands
    const playerHandRank = this.evaluatePokerHand([...playerHand, ...communityCards]);
    const dealerHandRank = this.evaluatePokerHand([...dealerHand, ...communityCards]);
    
    // Determine winner
    const isWin = playerHandRank.rank > dealerHandRank.rank;
    
    // Calculate win amount
    let winAmount = 0;
    if (isWin) {
      winAmount = playerAction === 'raise' ? betAmount * 3 : betAmount * 2;
    }
    
    return {
      playerHand,
      dealerHand,
      communityCards,
      playerHandRank,
      dealerHandRank,
      isWin,
      winAmount
    };
  }
  
  // Plinko game logic
  playPlinko(betAmount: number, riskLevel: 'low' | 'medium' | 'high'): PlinkoResult {
    // Generate path through pegs
    const rows = 8;
    const path: number[] = [];
    let position = 4; // Start at middle position
    
    for (let i = 0; i < rows; i++) {
      // Ball goes left or right randomly
      const direction = Math.random() > 0.5 ? 1 : -1;
      position = Math.max(0, Math.min(8, position + direction));
      path.push(position);
    }
    
    const finalPosition = path[path.length - 1];
    
    // Multipliers based on risk level and position
    const multipliers = {
      low: [1.5, 1.2, 1.1, 1.0, 2.0, 1.0, 1.1, 1.2, 1.5],
      medium: [3, 1.5, 1.2, 1.0, 5, 1.0, 1.2, 1.5, 3],
      high: [5, 2, 1.5, 1.0, 10, 1.0, 1.5, 2, 5]
    };
    
    const multiplier = multipliers[riskLevel][finalPosition];
    const winAmount = Math.round(betAmount * multiplier);
    const isWin = winAmount > betAmount;
    
    return {
      path,
      finalPosition,
      multiplier,
      isWin,
      winAmount
    };
  }
  
  // Slot machine game logic
  playSlots(betAmount: number, lines: number): SlotResult {
    // Define symbols
    const symbols: Symbol[] = [
      { id: 1, name: "Marine", value: 5 },
      { id: 2, name: "Pekora", value: 10 },
      { id: 3, name: "Aqua", value: 25 },
      { id: 4, name: "Korone", value: 15 },
      { id: 5, name: "Fubuki", value: 20 },
    ];
    
    // Generate random reels
    const reels: Symbol[][] = [
      [this.getRandomSymbol(symbols), this.getRandomSymbol(symbols), this.getRandomSymbol(symbols)],
      [this.getRandomSymbol(symbols), this.getRandomSymbol(symbols), this.getRandomSymbol(symbols)],
      [this.getRandomSymbol(symbols), this.getRandomSymbol(symbols), this.getRandomSymbol(symbols)]
    ];
    
    // Check for winning lines
    const winningLines: WinningLine[] = [];
    let totalWinAmount = 0;
    let highestMultiplier = 0;
    
    // Check middle row (always active)
    const middleRow = [reels[0][1], reels[1][1], reels[2][1]];
    if (middleRow[0].id === middleRow[1].id && middleRow[1].id === middleRow[2].id) {
      const multiplier = middleRow[0].value;
      const lineWin = betAmount * multiplier;
      totalWinAmount += lineWin;
      
      winningLines.push({
        line: 1,
        symbols: middleRow,
        multiplier
      });
      
      if (multiplier > highestMultiplier) {
        highestMultiplier = multiplier;
      }
    }
    
    // If more than 1 line is bet, check top and bottom rows
    if (lines >= 3) {
      // Top row
      const topRow = [reels[0][0], reels[1][0], reels[2][0]];
      if (topRow[0].id === topRow[1].id && topRow[1].id === topRow[2].id) {
        const multiplier = topRow[0].value;
        const lineWin = betAmount * multiplier;
        totalWinAmount += lineWin;
        
        winningLines.push({
          line: 2,
          symbols: topRow,
          multiplier
        });
        
        if (multiplier > highestMultiplier) {
          highestMultiplier = multiplier;
        }
      }
      
      // Bottom row
      const bottomRow = [reels[0][2], reels[1][2], reels[2][2]];
      if (bottomRow[0].id === bottomRow[1].id && bottomRow[1].id === bottomRow[2].id) {
        const multiplier = bottomRow[0].value;
        const lineWin = betAmount * multiplier;
        totalWinAmount += lineWin;
        
        winningLines.push({
          line: 3,
          symbols: bottomRow,
          multiplier
        });
        
        if (multiplier > highestMultiplier) {
          highestMultiplier = multiplier;
        }
      }
    }
    
    // If 5 lines are bet, check diagonal patterns
    if (lines >= 5) {
      // Diagonal top-left to bottom-right
      const diag1 = [reels[0][0], reels[1][1], reels[2][2]];
      if (diag1[0].id === diag1[1].id && diag1[1].id === diag1[2].id) {
        const multiplier = diag1[0].value;
        const lineWin = betAmount * multiplier;
        totalWinAmount += lineWin;
        
        winningLines.push({
          line: 4,
          symbols: diag1,
          multiplier
        });
        
        if (multiplier > highestMultiplier) {
          highestMultiplier = multiplier;
        }
      }
      
      // Diagonal bottom-left to top-right
      const diag2 = [reels[0][2], reels[1][1], reels[2][0]];
      if (diag2[0].id === diag2[1].id && diag2[1].id === diag2[2].id) {
        const multiplier = diag2[0].value;
        const lineWin = betAmount * multiplier;
        totalWinAmount += lineWin;
        
        winningLines.push({
          line: 5,
          symbols: diag2,
          multiplier
        });
        
        if (multiplier > highestMultiplier) {
          highestMultiplier = multiplier;
        }
      }
    }
    
    // Check for jackpot - all symbols are Aqua (the highest value symbol)
    const allSymbols = reels.flat();
    const isJackpot = lines === 5 && allSymbols.every(s => s.id === 3);
    
    if (isJackpot) {
      totalWinAmount = 25000; // Jackpot amount
      highestMultiplier = 25;
    }
    
    return {
      reels,
      winningLines,
      isJackpot,
      isWin: totalWinAmount > 0,
      winAmount: totalWinAmount,
      multiplier: highestMultiplier
    };
  }
  
  // Helper methods
  private createShuffledDeck(): Card[] {
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const deck: Card[] = [];
    
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
        deck.push({ suit, value, numValue });
      }
    }
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  }
  
  private calculateHandTotal(hand: Card[]): number {
    let total = 0;
    let aces = 0;
    
    for (const card of hand) {
      total += card.numValue;
      if (card.value === "A") {
        aces++;
      }
    }
    
    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    
    return total;
  }
  
  private evaluatePokerHand(cards: Card[]): HandRank {
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
  }
  
  private getRandomSymbol(symbols: Symbol[]): Symbol {
    const index = Math.floor(Math.random() * symbols.length);
    return symbols[index];
  }
}

export const gameService = new GameService();
