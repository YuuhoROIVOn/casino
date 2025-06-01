import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { useUser } from "@/context/user-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useUser();
  const { balance } = useWallet();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Games", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Wallet", path: "/wallet" },
    { name: "Profile", path: "/profile" },
  ];
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-card/90 backdrop-blur-md px-6 py-4 fixed w-full z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2" onClick={() => setLocation("/")} role="button">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">H</span>
          </div>
          <span className="text-2xl font-poppins font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            HoloCasino
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <span className="text-white hover:text-primary transition cursor-pointer">{link.name}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
{isAuthenticated && (
            <div className="wallet-card px-4 py-2 rounded-full flex items-center">
              <svg
                className="w-4 h-4 text-accent mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 17V12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 7H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-medium">{balance.toLocaleString()} $HOLOCOIN</span>
            </div>
          )}

{isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 hover:bg-transparent">
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.username} />
                    <AvatarFallback className="bg-primary text-white">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                {user?.isAdmin && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="text-white border-primary hover:bg-primary/20"
                onClick={() => setLocation("/login")}
              >
                Login
              </Button>
              <Button 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white"
                onClick={() => setLocation("/signup")}
              >
                Sign Up
              </Button>
            </div>
          )}

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.path} href={link.path}>
                    <span
                      className="text-xl py-4 border-b border-white/10 w-full text-center block cursor-pointer"
                      onClick={closeMenu}
                    >
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
