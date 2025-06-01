import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import NFTCard from "@/components/nft-card";
import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { NFTItem } from "@/types";

export default function Marketplace() {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NFTItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const { balance } = useWallet();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/nfts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/nfts", undefined);
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      setNfts(data.nfts);
      setFilteredNfts(data.nfts);
    }
  }, [data]);

  useEffect(() => {
    if (nfts.length > 0) {
      let filtered = [...nfts];
      
      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(nft => 
          nft.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          nft.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Filter by rarity
      if (selectedRarity !== "all") {
        filtered = filtered.filter(nft => 
          nft.rarity.toLowerCase() === selectedRarity.toLowerCase()
        );
      }
      
      setFilteredNfts(filtered);
    }
  }, [searchQuery, selectedRarity, nfts]);

  const rarityOptions = [
    { value: "all", label: "All Rarities" },
    { value: "common", label: "Common" },
    { value: "rare", label: "Rare" },
    { value: "epic", label: "Epic" },
    { value: "legendary", label: "Legendary" },
  ];

  const categories = [
    { id: "all", name: "All Items" },
    { id: "avatars", name: "Avatars" },
    { id: "emotes", name: "Emotes" },
    { id: "backgrounds", name: "Backgrounds" },
    { id: "effects", name: "Effects" },
  ];

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold">NFT Marketplace</h1>
          <p className="text-foreground/70">Exclusive Hololive collectibles and cosmetics</p>
        </div>
        
        <div className="flex items-center space-x-2 wallet-card px-4 py-2 rounded-full">
          <Wallet className="text-accent w-5 h-5" />
          <span className="font-medium">{balance.toLocaleString()} $HOLOCOIN</span>
        </div>
      </div>

      <Card className="mb-8 rounded-xl border-none bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <h2 className="text-2xl font-poppins font-bold mb-2">Limited Edition Collection</h2>
              <p className="text-foreground/70 mb-6">Get exclusive NFTs featuring your favorite Hololive characters and show them off in games!</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="py-1 px-3">Limited Time Only</Badge>
                <Badge variant="outline" className="py-1 px-3">Exclusive Items</Badge>
                <Badge variant="outline" className="py-1 px-3">Special Effects</Badge>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-accent rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
                  <span className="font-poppins font-bold text-accent-foreground text-xs">NEW!</span>
                </div>
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center shadow-lg">
                  <span className="font-poppins font-bold text-3xl bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">NFT</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input 
                  placeholder="Search NFTs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-card/50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Rarity</label>
                <select 
                  className="w-full bg-card/50 rounded-lg border border-input px-3 py-2 text-sm"
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                >
                  {rarityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Min" type="number" min="0" className="bg-card/50" />
                  <span>-</span>
                  <Input placeholder="Max" type="number" min="0" className="bg-card/50" />
                </div>
              </div>
              
              <Button className="w-full" variant="outline">
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="text-sm text-foreground/70">
                Showing {filteredNfts.length} of {nfts.length} items
              </div>
            </div>
            
            {categories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="game-card rounded-2xl overflow-hidden bg-card shadow-xl animate-pulse">
                        <div className="w-full h-48 bg-muted"></div>
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div className="h-6 bg-muted rounded w-1/2"></div>
                            <div className="h-5 bg-muted rounded-full w-16"></div>
                          </div>
                          <div className="h-4 bg-muted rounded mb-2 w-full"></div>
                          <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                          <div className="flex justify-between items-center">
                            <div className="h-6 bg-muted rounded w-1/3"></div>
                            <div className="h-10 bg-muted rounded-xl w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredNfts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold mb-2">No items found</h3>
                    <p className="text-foreground/70">Try adjusting your filters or search query</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredNfts
                      .filter(nft => category.id === "all" || nft.category === category.id)
                      .map(nft => (
                        <NFTCard key={nft.id} nft={nft} />
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
