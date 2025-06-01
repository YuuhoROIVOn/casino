import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWallet } from "@/hooks/use-wallet";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Settings,
  Trophy,
  Star,
  Package,
  CreditCard,
  Gamepad2
} from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useUser();
  const { balance, nfts } = useWallet();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [isSaving, setIsSaving] = useState(false);

  // Stats data
  const stats = [
    { name: "Games Played", value: 124 },
    { name: "Total Winnings", value: "12,500 $HOLOCOIN" },
    { name: "Win Rate", value: "58%" },
    { name: "NFTs Owned", value: nfts.length },
  ];

  // Achievements data (simulated)
  const achievements = [
    { 
      id: 1, 
      name: "Big Winner", 
      description: "Win more than 1,000 $HOLOCOIN in a single game", 
      progress: 100,
      icon: "🏆"
    },
    { 
      id: 2, 
      name: "High Roller", 
      description: "Place a bet of 500 $HOLOCOIN or more", 
      progress: 100,
      icon: "💰"
    },
    { 
      id: 3, 
      name: "Collector", 
      description: "Own 5 different NFTs", 
      progress: Math.min(100, (nfts.length / 5) * 100),
      icon: "🎨"
    },
    { 
      id: 4, 
      name: "Lucky Streak", 
      description: "Win 5 games in a row", 
      progress: 60,
      icon: "🔥"
    },
    { 
      id: 5, 
      name: "Jackpot Winner", 
      description: "Win the slot machine jackpot", 
      progress: 0,
      icon: "🎰"
    },
  ];

  const saveProfile = () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    // Simulate saving profile
    setTimeout(() => {
      updateUser({
        ...user!,
        username,
        avatar: avatarUrl
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
        variant: "success"
      });

      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <Card className="rounded-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
          <CardContent className="pt-0 relative">
            <div className="flex flex-col items-center -mt-12">
              <Avatar className="w-24 h-24 border-4 border-card">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mt-2">{user?.username}</h2>
              <p className="text-foreground/70">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
              
              <div className="mt-4 bg-card/50 px-4 py-2 rounded-full flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                <span className="font-semibold">{balance.toLocaleString()} $HOLOCOIN</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-card/50 p-3 rounded-lg text-center">
                    <div className="text-foreground/70 text-sm">{stat.name}</div>
                    <div className="font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
              
              {!isEditing ? (
                <Button 
                  className="mt-6 w-full" 
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="w-full mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input 
                      id="avatar"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setIsEditing(false);
                        setUsername(user?.username || "");
                        setAvatarUrl(user?.avatar || "");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={saveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="achievements">
            <TabsList className="mb-6">
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="collection" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Collection
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Game Stats
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Achievements
                  </CardTitle>
                  <CardDescription>Track your progress and unlock rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-card/50 flex items-center justify-center text-2xl">
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-bold">{achievement.name}</h3>
                              <span className="text-sm text-foreground/70">{achievement.progress}%</span>
                            </div>
                            <p className="text-sm text-foreground/70">{achievement.description}</p>
                            <div className="w-full bg-card/50 rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  achievement.progress === 100 
                                    ? 'bg-success' 
                                    : 'bg-primary'
                                }`} 
                                style={{width: `${achievement.progress}%`}}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="collection">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    NFT Collection
                  </CardTitle>
                  <CardDescription>Your owned NFTs and cosmetic items</CardDescription>
                </CardHeader>
                <CardContent>
                  {nfts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🖼️</div>
                      <h3 className="text-xl font-bold mb-2">No items yet</h3>
                      <p className="text-foreground/70 mb-4">Visit the marketplace to buy your first NFT!</p>
                      <Button>Go to Marketplace</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {nfts.map((nft) => (
                        <Card key={nft.id} className="overflow-hidden">
                          <div className="h-40 overflow-hidden">
                            <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-1">
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
                            <p className="text-xs text-foreground/70">{nft.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Gaming Statistics
                  </CardTitle>
                  <CardDescription>Detailed stats from your game sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Roulette Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Games Played</span>
                              <span className="font-medium">45</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Win Rate</span>
                              <span className="font-medium">52%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Total Winnings</span>
                              <span className="font-medium text-success">+4,230 $HOLOCOIN</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Blackjack Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Games Played</span>
                              <span className="font-medium">32</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Win Rate</span>
                              <span className="font-medium">47%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Total Winnings</span>
                              <span className="font-medium text-destructive">-850 $HOLOCOIN</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Slots Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Games Played</span>
                              <span className="font-medium">78</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Win Rate</span>
                              <span className="font-medium">38%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Total Winnings</span>
                              <span className="font-medium text-success">+8,750 $HOLOCOIN</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Other Games</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Games Played</span>
                              <span className="font-medium">24</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Win Rate</span>
                              <span className="font-medium">41%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-foreground/70">Total Winnings</span>
                              <span className="font-medium text-success">+370 $HOLOCOIN</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Recent Games</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-card/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs">🎰</span>
                              </div>
                              <div>
                                <div className="font-medium">Slots</div>
                                <div className="text-xs text-foreground/70">Today, 2:45 PM</div>
                              </div>
                            </div>
                            <span className="font-medium text-success">+250 $HOLOCOIN</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-2 rounded-lg bg-card/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs">🎲</span>
                              </div>
                              <div>
                                <div className="font-medium">Roulette</div>
                                <div className="text-xs text-foreground/70">Today, 1:30 PM</div>
                              </div>
                            </div>
                            <span className="font-medium text-destructive">-100 $HOLOCOIN</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-2 rounded-lg bg-card/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs">♠️</span>
                              </div>
                              <div>
                                <div className="font-medium">Blackjack</div>
                                <div className="text-xs text-foreground/70">Yesterday, 8:15 PM</div>
                              </div>
                            </div>
                            <span className="font-medium text-success">+300 $HOLOCOIN</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Notifications</h3>
                      <div className="flex justify-between items-center">
                        <span>Email Notifications</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Game Results</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>New NFT Listings</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Language</h3>
                      <select className="w-full bg-card/50 rounded-lg border border-input px-3 py-2">
                        <option value="en">English</option>
                        <option value="jp">Japanese</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Security</h3>
                      <Button variant="outline" className="w-full">Change Password</Button>
                      <Button variant="outline" className="w-full">Enable Two-Factor Authentication</Button>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
