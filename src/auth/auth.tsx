import { queryClient } from "@/utils/queryclient/queryClient";
import {
  type LoginCredentials,
  type LoginResponse,
} from "../routes/login/-queries";
import { AuthContext } from "./AuthContext";
import { useEffect, useState, type ReactNode } from "react";
import type { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios/axiosInstance";
import { router } from "@/main";

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture: string | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login mutation
  const loginMutation = useMutation<
    LoginResponse,
    AxiosError,
    LoginCredentials
  >({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await axiosInstance.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      queryClient.invalidateQueries(); // Refresh all queries
    },
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
    queryClient.clear();
    router.navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginMutation,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
