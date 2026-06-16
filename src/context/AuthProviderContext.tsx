/* eslint-disable react-refresh/only-export-components */
import { setAccessToken } from "../utils/authToken";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/api/axios";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (
    accessToken: string,
    email: string,
    firstName: string,
    lastName: string,
    publicId: string,
    onboardingCompleted: boolean,
  ) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  onboardingCompleted: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // add this

  const isAuthenticated = !!user;

  const login = (
    accessToken: string,
    email: string,
    firstName: string,
    lastName: string,
    publicId: string,
    onboardingCompleted: boolean,
  ) => {
    console.log(email, firstName, lastName, publicId, accessToken);

    setUser({
      id: publicId,
      email,
      firstName,
      lastName,
      onboardingCompleted,
    });
    setAccessToken(accessToken);
    console.log(onboardingCompleted);
  };

  const logout = () => {
    (async () => {
      try {
        if (user?.id) {
          console.log(user.id);
          await api.post(
            `/api/auth/logout/${user.id}`,
            {},
            { withCredentials: true },
          );
        }
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        setUser(null);
        setAccessToken(null);
      }
    })();
  };

  const refreshToken = useCallback(async () => {
    try {
      const res = await api.post(
        `/api/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const data = res.data;
      // inline instead of calling login()
      setUser({
        id: data.publicId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        onboardingCompleted: data.onboardingCompleted,
      });
      setAccessToken(data.access_token);
    } catch (error) {
      console.error("Refresh failed:", error);
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      await refreshToken();
      setIsLoading(false);
    };
    restoreSession();
  }, [refreshToken]);
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, refreshToken, user, setUser }}
    >
      {isLoading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
