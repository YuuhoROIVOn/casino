import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Wallet, ArrowDownCircle, ArrowUpCircle, GamepadIcon } from "lucide-react";

export default function WalletSection() {
  const { balance, transactions } = useWallet();

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-poppins font-bold">$HOLOCOIN Wallet</h2>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Deposit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-secondary p-0.5 shadow-xl">
          <Card className="rounded-2xl h-full">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-3">
                  <Wallet className="text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-xl">Wallet Balance</h3>
                  <p className="text-foreground/70 text-sm">Available for games</p>
                </div>
              </div>

              <div className="mt-6 mb-4">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {formatCurrency(balance)} $HOLOCOIN
                </div>
                <div className="text-foreground/70 text-sm">= {formatCurrency(balance)} PHP</div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-white">Deposit</Button>
                <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-white">Withdraw</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History Card */}
        <Card className="rounded-2xl shadow-xl">
          <CardContent className="p-6 h-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-poppins font-bold text-xl">Transaction History</h3>
                <p className="text-foreground/70 text-sm">Recent transactions</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {transactions.slice(0, 3).map((transaction, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${transaction.amount > 0 ? 'bg-success/20' : 'bg-destructive/20'} rounded-full flex items-center justify-center mr-3`}>
                      {transaction.amount > 0 ? (
                        <ArrowDownCircle className="h-4 w-4 text-success" />
                      ) : (
                        transaction.type === 'game' ? (
                          <GamepadIcon className="h-4 w-4 text-destructive" />
                        ) : (
                          <ArrowUpCircle className="h-4 w-4 text-destructive" />
                        )
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-foreground/70 text-xs">{new Date(transaction.date).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className={transaction.amount > 0 ? 'text-success font-bold' : 'text-destructive font-bold'}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} $HOLOCOIN
                  </div>
                </div>
              ))}
            </div>

            <Link href="/wallet">
              <Button variant="secondary" className="w-full mt-4 text-sm">
                View All Transactions
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Exchange & NFT Card */}
        <Card className="rounded-2xl shadow-xl">
          <CardContent className="p-6 h-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-secondary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <h3 className="font-poppins font-bold text-xl">NFT Marketplace</h3>
                <p className="text-foreground/70 text-sm">Exclusive Hololive items</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-card/50 rounded-lg text-center">
                <div className="w-full h-24 rounded-lg overflow-hidden mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1614680376739-414d95ff43df?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                    alt="Hololive NFT"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-medium text-sm">Hololive Avatar</div>
                <div className="text-accent font-bold text-sm">1,500 $HOLOCOIN</div>
              </div>

              <div className="p-3 bg-card/50 rounded-lg text-center">
                <div className="w-full h-24 rounded-lg overflow-hidden mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1541562232579-512a21360020?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                    alt="Hololive NFT"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-medium text-sm">Exclusive Emote</div>
                <div className="text-accent font-bold text-sm">800 $HOLOCOIN</div>
              </div>
            </div>

            <Link href="/marketplace">
              <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-white">
                Visit Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
