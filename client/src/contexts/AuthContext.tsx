import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@time-management/shared-types";
import { authService } from "../data/services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser && storedUser !== "undefined"
        ? JSON.parse(storedUser)
        : null;
    } catch (e) {
      console.error("Failed to parse user data", e);
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);

  const tryFastLogin = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const { user, token } = await authService.fastLogin();
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", token);
        }
      }
    } catch (error) {
      console.error("Fast login failed:", error);
      logout(); // Очищаем невалидные данные
    }
  };

  // При монтировании компонента пробуем быстрый вход
  useEffect(() => {
    tryFastLogin();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { loadedUser, token } = await authService.login({
        email,
        password,
      });

      setUser(loadedUser);
      localStorage.setItem("user", JSON.stringify(loadedUser));
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
    } catch (err) {
      console.log("Error in login: " + err);
      setIsAuthenticated(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { user, token } = await authService.register({
        name,
        email,
        password,
      });

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
    } catch (err) {
      console.log("Error in register: " + err);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
