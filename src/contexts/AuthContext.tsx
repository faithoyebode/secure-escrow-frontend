"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import authService, { LoginCredentials, RegisterData } from "@/services/authService";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Validate token by fetching current user
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const { token, user } = await authService.login(credentials);
      
      // Save token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Make sure we're using the user object directly from the response
      setUser(user);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const { token, user } = await authService.register(userData);
      
      // Save token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      setUser(user);
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${user.name}!`,
      });
      
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate.push("/login")

  };

  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(data);
      
      // Update stored user data
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
