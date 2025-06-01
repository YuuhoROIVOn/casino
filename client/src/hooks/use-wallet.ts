import { useWalletContext } from "@/context/wallet-context";

export function useWallet() {
  return useWalletContext();
}
