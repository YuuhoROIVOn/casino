import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { User } from "@/types";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("holocasino_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    } else {
      // Initialize with default user if none exists
      const defaultUser: User = {
        id: "1",
        username: "HoloFan123",
        email: "user@example.com",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        createdAt: new Date().toISOString(),
      };
      setUser(defaultUser);
      setIsAuthenticated(true);
      localStorage.setItem("holocasino_user", JSON.stringify(defaultUser));
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("holocasino_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("holocasino_user");
    }
  }, [user]);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const login = async (username: string, password: string) => {
    // In a real app, this would call an API
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful login
        const loggedInUser: User = {
          id: "1",
          username,
          email: `${username}@example.com`,
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
          createdAt: new Date().toISOString(),
        };
        setUser(loggedInUser);
        setIsAuthenticated(true);
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("holocasino_user");
  };

  const value = {
    user,
    setUser,
    updateUser,
    isAuthenticated,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
