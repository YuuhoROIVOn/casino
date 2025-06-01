import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="mb-16">
      <div className="relative rounded-3xl overflow-hidden h-64 md:h-96 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80"></div>
        <div className="absolute inset-0 w-full h-full bg-[url('https://pixabay.com/get/g82169e1a2efb19e073e163a64d032f8de63b8af58d56472277eac6f96bc00af46af107c028adaa482a828a2bfa31fe8345196c6794e9d2767ce8842adaa4ad17_1280.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10 px-8 md:px-16">
          <h1 className="text-3xl md:text-5xl font-poppins font-bold text-white mb-4">
            Welcome to <span className="text-accent">HoloCasino</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-6">
            Play with your favorite Hololive characters and win $HOLOCOIN tokens that can be exchanged for exclusive NFTs and in-game cosmetics
          </p>
          <Button
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' })}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2"
            size="lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4l4.3 12h.7l.5-1.8 4.5-1.8.5 1.8h.7L20 4h-4l-2 6-2-6H8l-2 6-2-6H4zM15 19h-6v-2l3-3 3 3v2z" />
            </svg>
            Play Now
          </Button>
        </div>
        
        <div className="absolute right-16 top-1/4 coin-animation hidden md:block">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <span className="font-poppins font-bold text-accent-foreground text-sm">$HOLO</span>
          </div>
        </div>
      </div>
    </section>
  );
}
