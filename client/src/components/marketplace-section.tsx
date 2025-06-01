import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import NFTCard from "@/components/nft-card";
import { NFTItem } from "@/types";

export default function MarketplaceSection() {
  const [nfts, setNfts] = useState<NFTItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/nfts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/nfts", undefined);
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      setNfts(data.nfts.slice(0, 4));
    }
  }, [data]);

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-poppins font-bold">Marketplace</h2>
        <Link href="/marketplace">
          <Button 
            variant="ghost"
            className="rounded-full text-white hover:text-white flex items-center gap-2"
          >
            View All Items
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
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      )}
    </section>
  );
}
