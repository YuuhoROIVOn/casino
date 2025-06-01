import { useState, useEffect } from "react";
import { useUser } from "@/context/user-context";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import AdminLoginForm from "@/components/admin/login-form";
import CredentialsInfo from "@/components/admin/credentials-info";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { FaUsers, FaCoins, FaGamepad, FaImage, FaTrophy, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaComments, FaExchangeAlt, FaPercent } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminPage() {
  const { user, isAuthenticated, logout } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for modals and forms
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newNFT, setNewNFT] = useState({
    name: "",
    description: "",
    price: 1000,
    image: "",
    rarity: "common",
    category: "avatar",
    hasEffect: false,
    effectType: "none",
    effectConfig: {}
  });
  const [newTransaction, setNewTransaction] = useState({
    userId: "",
    amount: 0,
    description: "",
    type: "deposit"
  });

  // Get admin data
  const { data: games } = useQuery({
    queryKey: ["/api/games"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: adminUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.isAdmin,
  });
  
  const { data: nfts } = useQuery({
    queryKey: ["/api/nfts"],
    enabled: isAuthenticated && user?.isAdmin,
  });
  
  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated && user?.isAdmin,
  });
  
  const { data: supportTickets } = useQuery({
    queryKey: ["/api/support/tickets"],
    enabled: isAuthenticated && user?.isAdmin,
  });
  
  // Mutations
  const updateGameOddsMutation = useMutation({
    mutationFn: async (data: { gameId: number, houseEdge: number }) => {
      const response = await fetch(`/api/admin/games/${data.gameId}/odds`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseEdge: data.houseEdge }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update game odds');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Success",
        description: "Game odds updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update game odds",
        variant: "destructive",
      });
    },
  });
  
  const createNFTMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create NFT');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nfts"] });
      setNewNFT({
        name: "",
        description: "",
        price: 1000,
        image: "",
        rarity: "common",
        category: "avatar"
      });
      toast({
        title: "Success",
        description: "NFT created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create NFT",
        variant: "destructive",
      });
    },
  });
  
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/wallet/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setNewTransaction({
        userId: "",
        amount: 0,
        description: "",
        type: "deposit"
      });
      toast({
        title: "Success",
        description: "Transaction processed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process transaction",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel.",
    });
    setLocation("/");
  };

  // If user is not admin, redirect to home
  useEffect(() => {
    if (isAuthenticated && user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation, toast]);

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AdminLoginForm />
          <CredentialsInfo />
        </div>
      </div>
    );
  }

  // If authenticated but not admin, show loading (should redirect)
  if (!user?.isAdmin) {
    return <div className="container py-12">Loading...</div>;
  }

  // Admin dashboard
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <FaSignOutAlt className="mr-2" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <CardDescription className="text-3xl font-bold">
              {adminUsers?.length || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <FaUsers className="mr-1" /> Total registered users
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Games</CardTitle>
            <CardDescription className="text-3xl font-bold">
              {games?.length || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <FaGamepad className="mr-1" /> Active casino games
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">House Edge</CardTitle>
            <CardDescription className="text-3xl font-bold">
              75%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <FaCoins className="mr-1" /> Current house advantage
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="games" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        
        {/* GAMES TAB */}
        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Casino Games</CardTitle>
                <CardDescription>
                  Manage game settings and win rates (currently set to high-risk/high-reward)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th className="px-6 py-3">Game</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Min Bet</th>
                      <th className="px-6 py-3">Max Bet</th>
                      <th className="px-6 py-3">Win Chance</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games?.map((game: any) => (
                      <tr key={game.id} className="border-b">
                        <td className="px-6 py-4 font-medium">{game.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            game.status === 'HOT' 
                              ? 'bg-red-100 text-red-800' 
                              : game.status === 'POPULAR' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {game.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4">{formatCurrency(game.minBet)}</td>
                        <td className="px-6 py-4">{formatCurrency(game.maxBet)}</td>
                        <td className="px-6 py-4 text-red-500 font-bold">
                          {(100 - game.houseEdge * 100).toFixed(0)}%
                        </td>
                        <td className="px-6 py-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedGame(game)}
                              >
                                <FaEdit className="mr-2 h-4 w-4" /> Edit Odds
                              </Button>
                            </DialogTrigger>
                            {selectedGame && (
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Game Odds</DialogTitle>
                                  <DialogDescription>
                                    Update the win rate for {selectedGame.name}. Lower values make the game harder.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="win-rate">Win Rate (%)</Label>
                                    <div className="flex items-center gap-2">
                                      <FaPercent className="text-muted-foreground" />
                                      <Input
                                        id="win-rate"
                                        type="number"
                                        min="1"
                                        max="50"
                                        defaultValue={(100 - selectedGame.houseEdge * 100).toFixed(0)}
                                        className="w-full"
                                      />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Recommended: 10% for high-risk high-reward games
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Difficulty Level</Label>
                                    <Slider
                                      defaultValue={[100 - selectedGame.houseEdge * 100]}
                                      max={50}
                                      min={1}
                                      step={1}
                                      className="w-full"
                                    />
                                    <div className="flex justify-between">
                                      <span className="text-xs">High Risk</span>
                                      <span className="text-xs">Balanced</span>
                                      <span className="text-xs">Low Risk</span>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button 
                                    type="submit"
                                    onClick={() => {
                                      // Would capture actual value from form in a real implementation
                                      const newHouseEdge = 0.9; // 10% win rate (90% house edge)
                                      updateGameOddsMutation.mutate({
                                        gameId: selectedGame.id,
                                        houseEdge: newHouseEdge
                                      });
                                    }}
                                  >
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            )}
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage casino users and balances
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <FaExchangeAlt className="mr-2 h-4 w-4" /> New Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Transaction</DialogTitle>
                    <DialogDescription>
                      Add or remove $HOLOCOIN from a user's account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="user">Select User</Label>
                      <Select onValueChange={(value) => setNewTransaction({...newTransaction, userId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {adminUsers?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.username} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({
                          ...newTransaction, 
                          amount: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Transaction Type</Label>
                      <Select 
                        defaultValue="deposit" 
                        onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="withdrawal">Withdrawal</SelectItem>
                          <SelectItem value="bonus">Bonus</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Reason for transaction"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({
                          ...newTransaction, 
                          description: e.target.value
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit"
                      onClick={() => {
                        if (!newTransaction.userId || !newTransaction.amount || !newTransaction.description) {
                          toast({
                            title: "Error",
                            description: "Please fill in all fields",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        createTransactionMutation.mutate(newTransaction);
                      }}
                    >
                      Process Transaction
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th className="px-6 py-3">Username</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Balance</th>
                      <th className="px-6 py-3">Last Login</th>
                      <th className="px-6 py-3">Admin</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers?.map((user: any) => (
                      <tr key={user.id} className="border-b">
                        <td className="px-6 py-4 font-medium">{user.username}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">{formatCurrency(user.balance)}</td>
                        <td className="px-6 py-4">{new Date(user.lastLogin || Date.now()).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          {user.isAdmin ? (user.isOperator ? "Operator" : "Admin") : "No"}
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            <FaEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" 
                            onClick={() => setNewTransaction({
                              ...newTransaction,
                              userId: user.id.toString()
                            })}
                          >
                            <FaCoins className="h-4 w-4" />
                          </Button>
                          {!user.isAdmin && (
                            <Button 
                              variant={user.isBanned ? "default" : "destructive"} 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: user.isBanned ? "User Unbanned" : "User Banned",
                                  description: user.isBanned 
                                    ? `${user.username} has been unbanned.` 
                                    : `${user.username} has been banned from the platform.`,
                                });
                              }}
                            >
                              {user.isBanned ? "Unban" : "Ban"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* NFTs TAB */}
        <TabsContent value="nfts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>NFT Management</CardTitle>
                <CardDescription>
                  Manage Hololive NFTs in the marketplace
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <FaPlus className="mr-2 h-4 w-4" /> Add New NFT
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New NFT</DialogTitle>
                    <DialogDescription>
                      Add a new Hololive-themed NFT to the marketplace
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nft-name">NFT Name</Label>
                      <Input
                        id="nft-name"
                        placeholder="Hololive Special Edition"
                        value={newNFT.name}
                        onChange={(e) => setNewNFT({...newNFT, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nft-description">Description</Label>
                      <Textarea
                        id="nft-description"
                        placeholder="Limited edition NFT featuring..."
                        value={newNFT.description}
                        onChange={(e) => setNewNFT({...newNFT, description: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nft-image">Image URL</Label>
                      <Input
                        id="nft-image"
                        placeholder="https://example.com/nft-image.png"
                        value={newNFT.image}
                        onChange={(e) => setNewNFT({...newNFT, image: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nft-price">Price ($HOLOCOIN)</Label>
                        <Input
                          id="nft-price"
                          type="number"
                          value={newNFT.price}
                          onChange={(e) => setNewNFT({...newNFT, price: parseInt(e.target.value)})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="nft-rarity">Rarity</Label>
                        <Select 
                          defaultValue="common"
                          onValueChange={(value) => setNewNFT({...newNFT, rarity: value})}
                        >
                          <SelectTrigger id="nft-rarity">
                            <SelectValue placeholder="Select rarity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="common">Common</SelectItem>
                            <SelectItem value="rare">Rare</SelectItem>
                            <SelectItem value="epic">Epic</SelectItem>
                            <SelectItem value="legendary">Legendary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nft-category">Category</Label>
                      <Select 
                        defaultValue="avatar"
                        onValueChange={(value) => setNewNFT({...newNFT, category: value})}
                      >
                        <SelectTrigger id="nft-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="avatar">Avatar</SelectItem>
                          <SelectItem value="background">Background</SelectItem>
                          <SelectItem value="emote">Emote</SelectItem>
                          <SelectItem value="collectible">Collectible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 border-t pt-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has-effect"
                          checked={newNFT.hasEffect}
                          onChange={(e) => setNewNFT({...newNFT, hasEffect: e.target.checked})}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="has-effect">This NFT has visual effects</Label>
                      </div>
                      
                      {newNFT.hasEffect && (
                        <>
                          <div className="space-y-2 mt-2">
                            <Label htmlFor="effect-type">Effect Type</Label>
                            <Select 
                              defaultValue="none"
                              onValueChange={(value) => setNewNFT({...newNFT, effectType: value})}
                            >
                              <SelectTrigger id="effect-type">
                                <SelectValue placeholder="Select effect type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="background">Background Effect</SelectItem>
                                <SelectItem value="avatar_frame">Avatar Frame</SelectItem>
                                <SelectItem value="animation">Animation Effect</SelectItem>
                                <SelectItem value="particle">Particle Effect</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2 mt-2">
                            <Label htmlFor="effect-config">Effect Configuration (JSON)</Label>
                            <Textarea
                              id="effect-config"
                              placeholder='{"color": "#ff0000", "intensity": 5, "speed": 2}'
                              value={JSON.stringify(newNFT.effectConfig, null, 2)}
                              onChange={(e) => {
                                try {
                                  const config = JSON.parse(e.target.value);
                                  setNewNFT({...newNFT, effectConfig: config});
                                } catch (error) {
                                  // If JSON is invalid, just store as string
                                  console.log("Invalid JSON");
                                }
                              }}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Configure how this effect appears when used by a player
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit"
                      onClick={() => {
                        if (!newNFT.name || !newNFT.description || !newNFT.image) {
                          toast({
                            title: "Error",
                            description: "Please fill in all required fields",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        createNFTMutation.mutate(newNFT);
                      }}
                    >
                      Create NFT
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nfts?.nfts?.map((nft: any) => (
                  <Card key={nft.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          nft.rarity === 'legendary' 
                            ? 'bg-orange-100 text-orange-800' 
                            : nft.rarity === 'epic' 
                            ? 'bg-purple-100 text-purple-800'
                            : nft.rarity === 'rare'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {nft.rarity?.toUpperCase() || 'COMMON'}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg">{nft.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                        {nft.description}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="font-medium text-md">
                          {formatCurrency(nft.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {nft.category?.toUpperCase() || 'COLLECTIBLE'}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedNFT(nft)}
                      >
                        <FaEdit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                      >
                        <FaTrash className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {(!nfts?.nfts || nfts?.nfts.length === 0) && (
                  <div className="col-span-3 text-center p-8">
                    <p className="text-muted-foreground">No NFTs found. Create one to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View and manage all user transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.map((transaction: any) => (
                      <tr key={transaction.id} className="border-b">
                        <td className="px-6 py-4 font-medium">
                          {adminUsers?.find((u: any) => u.id === transaction.userId)?.username || transaction.userId}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.type === 'deposit' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.type === 'withdrawal' 
                              ? 'bg-red-100 text-red-800'
                              : transaction.type === 'game'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-bold ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4">{transaction.description}</td>
                        <td className="px-6 py-4">{new Date(transaction.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    
                    {(!transactions || transactions.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* SUPPORT TAB */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Support Tickets</CardTitle>
              <CardDescription>
                Manage user support requests and chat with users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Last Updated</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportTickets?.map((ticket: any) => (
                      <tr key={ticket.id} className="border-b">
                        <td className="px-6 py-4 font-medium">
                          {adminUsers?.find((u: any) => u.id === ticket.userId)?.username || ticket.userId}
                        </td>
                        <td className="px-6 py-4">{ticket.subject}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ticket.status === 'open' 
                              ? 'bg-green-100 text-green-800' 
                              : ticket.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(ticket.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4">{new Date(ticket.updatedAt).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FaComments className="mr-2 h-4 w-4" /> Respond
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Support Ticket #{ticket.id}</DialogTitle>
                                <DialogDescription>
                                  {ticket.subject}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="max-h-[400px] overflow-y-auto space-y-4 p-4 border rounded-md">
                                {ticket.messages?.map((message: any) => (
                                  <div key={message.id} className={`flex ${
                                    message.isAdmin ? 'justify-end' : 'justify-start'
                                  }`}>
                                    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                      message.isAdmin 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted'
                                    }`}>
                                      <p className="text-sm">{message.content}</p>
                                      <p className="text-xs opacity-70 mt-1">
                                        {new Date(message.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                
                                {(!ticket.messages || ticket.messages.length === 0) && (
                                  <p className="text-center text-muted-foreground py-4">
                                    No messages in this ticket yet
                                  </p>
                                )}
                              </div>
                              <div className="mt-4">
                                <Textarea
                                  placeholder="Type your response here..."
                                  className="min-h-[100px]"
                                />
                              </div>
                              <DialogFooter className="mt-4">
                                <Button variant="outline" onClick={() => {}}>
                                  Close Ticket
                                </Button>
                                <Button type="submit" onClick={() => {}}>
                                  Send Response
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                    
                    {(!supportTickets || supportTickets.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          No support tickets found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}