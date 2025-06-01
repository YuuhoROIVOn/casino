import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  GamepadIcon, 
  Clock, 
  PackageOpen 
} from "lucide-react";

export default function WalletPage() {
  const { balance, transactions, nfts, updateBalance } = useWallet();
  const [depositAmount, setDepositAmount] = useState(100);
  const [withdrawAmount, setWithdrawAmount] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleDeposit = () => {
    if (depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate deposit process
    setTimeout(() => {
      updateBalance(depositAmount);
      toast({
        title: "Deposit successful",
        description: `You have successfully deposited ${depositAmount} $HOLOCOIN`,
        variant: "success"
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleWithdraw = () => {
    if (withdrawAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (withdrawAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough $HOLOCOIN to withdraw",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate withdrawal process
    setTimeout(() => {
      updateBalance(-withdrawAmount);
      toast({
        title: "Withdrawal successful",
        description: `You have successfully withdrawn ${withdrawAmount} $HOLOCOIN`,
        variant: "success"
      });
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-8">My Wallet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none rounded-2xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-3">
                <Wallet className="text-accent-foreground" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-poppins font-bold">Wallet Balance</h2>
                <p className="text-foreground/70">Available for games and purchases</p>
              </div>
            </div>

            <div className="text-4xl font-bold mb-2">{balance.toLocaleString()} $HOLOCOIN</div>
            <div className="text-foreground/70 mb-6">= {balance.toLocaleString()} PHP</div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90">Deposit</Button>
              <Button size="lg" className="flex-1 bg-secondary hover:bg-secondary/90">Withdraw</Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
            <CardDescription>Your recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mr-3">
                    <ArrowDownCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Deposits</p>
                    <p className="text-sm text-foreground/70">Total incoming</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">+{transactions
                    .filter(t => t.amount > 0)
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}</p>
                  <p className="text-sm text-foreground/70">{transactions.filter(t => t.amount > 0).length} transactions</p>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center mr-3">
                    <GamepadIcon className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">Game Bets</p>
                    <p className="text-sm text-foreground/70">Total gaming activity</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-destructive">{transactions
                    .filter(t => t.amount < 0 && t.type === 'game')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}</p>
                  <p className="text-sm text-foreground/70">{transactions.filter(t => t.amount < 0 && t.type === 'game').length} transactions</p>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                    <PackageOpen className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Purchases</p>
                    <p className="text-sm text-foreground/70">NFTs & Items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-secondary">{transactions
                    .filter(t => t.amount < 0 && t.type === 'purchase')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}</p>
                  <p className="text-sm text-foreground/70">{transactions.filter(t => t.amount < 0 && t.type === 'purchase').length} transactions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit/Withdraw Card */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Manage Funds</CardTitle>
            <CardDescription>Deposit or withdraw $HOLOCOIN</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deposit">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>
              
              <TabsContent value="deposit">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Amount to Deposit</label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={depositAmount} 
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="bg-card/50"
                    />
                  </div>
                  
                  <div className="flex justify-between gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setDepositAmount(100)}
                    >
                      100
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setDepositAmount(500)}
                    >
                      500
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setDepositAmount(1000)}
                    >
                      1000
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full bg-primary" 
                    onClick={handleDeposit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Deposit Now"}
                  </Button>
                  
                  <p className="text-xs text-foreground/70 text-center">
                    1 $HOLOCOIN = 1 PHP (Philippine Peso)
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="withdraw">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Amount to Withdraw</label>
                    <Input 
                      type="number" 
                      min="1"
                      max={balance} 
                      value={withdrawAmount} 
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="bg-card/50"
                    />
                  </div>
                  
                  <div className="flex justify-between gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setWithdrawAmount(100)}
                      disabled={balance < 100}
                    >
                      100
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setWithdrawAmount(500)}
                      disabled={balance < 500}
                    >
                      500
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setWithdrawAmount(1000)}
                      disabled={balance < 1000}
                    >
                      1000
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full bg-secondary" 
                    onClick={handleWithdraw}
                    disabled={isProcessing || balance < withdrawAmount}
                  >
                    {isProcessing ? "Processing..." : "Withdraw Now"}
                  </Button>
                  
                  <p className="text-xs text-foreground/70 text-center">
                    Available balance: {balance} $HOLOCOIN
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="rounded-2xl shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Transaction History
          </CardTitle>
          <CardDescription>Complete record of all your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-right py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-foreground/70">No transactions yet</td>
                  </tr>
                ) : (
                  transactions.map((tx, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-card/50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">{tx.description}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.type === 'deposit' 
                            ? 'bg-success/20 text-success' 
                            : tx.type === 'game' 
                              ? 'bg-primary/20 text-primary'
                              : 'bg-secondary/20 text-secondary'
                        }`}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${tx.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} $HOLOCOIN
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Owned Items */}
      {nfts.length > 0 && (
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageOpen size={20} />
              Your Collection
            </CardTitle>
            <CardDescription>NFTs and items you own</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {nfts.map((nft) => (
                <Card key={nft.id} className="overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">{nft.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        nft.rarity === 'Legendary' 
                          ? 'bg-accent/20 text-accent' 
                          : nft.rarity === 'Epic' 
                            ? 'bg-secondary/20 text-secondary'
                            : nft.rarity === 'Rare'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted/20 text-muted-foreground'
                      }`}>
                        {nft.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/70">Purchased on {new Date(nft.purchaseDate).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
