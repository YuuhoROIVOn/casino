import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProvider } from "@/context/user-context";
import { WalletProvider } from "@/context/wallet-context";
import { GamesProvider } from "@/context/games-context";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark">
    <UserProvider>
      <WalletProvider>
        <GamesProvider>
          <App />
        </GamesProvider>
      </WalletProvider>
    </UserProvider>
  </ThemeProvider>
);
