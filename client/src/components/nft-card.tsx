import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NFTItem } from "@/types";
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

interface NFTCardProps {
  nft: NFTItem;
}

export default function NFTCard({ nft }: NFTCardProps) {
  const { id, name, description, image, price, rarity } = nft;
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { balance, updateBalance, addNFT } = useWallet();
  const { toast } = useToast();

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "bg-muted/20 text-muted-foreground";
      case "rare":
        return "bg-primary/20 text-primary";
      case "epic":
        return "bg-secondary/20 text-secondary";
      case "legendary":
        return "bg-accent/20 text-accent";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  const handlePurchase = () => {
    setIsPurchasing(true);

    // Check if user has enough balance
    if (balance < price) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough $HOLOCOIN to purchase this item",
        variant: "destructive"
      });
      setIsPurchasing(false);
      return;
    }

    // Simulate purchase process
    setTimeout(() => {
      updateBalance(-price);
      addNFT(nft);
      
      toast({
        title: "Purchase successful!",
        description: `You have successfully purchased ${name}`,
        variant: "success"
      });
      
      setIsPurchasing(false);
    }, 1000);
  };

  return (
    <div className="game-card rounded-2xl overflow-hidden bg-card shadow-xl">
      <div className="w-full h-48 overflow-hidden">
        <img 
          src={image} 
          alt={`${name} NFT`} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-poppins font-bold text-xl">{name}</h3>
          <Badge className={cn("text-xs px-2 py-1 rounded-full", getRarityColor(rarity))}>
            {rarity}
          </Badge>
        </div>
        <p className="text-sm text-foreground/70 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-accent font-bold">{price.toLocaleString()} $HOLOCOIN</span>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-xl transition"
            onClick={handlePurchase}
            disabled={isPurchasing || balance < price}
          >
            {isPurchasing ? "Processing..." : "Buy Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
