import { queryClient } from "@/utils/queryclient/queryClient";
import {
  useValidateToken,
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
  email?: string;
  name: string;
  profilePicture?: string | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const isLoginPath = window.location.pathname.startsWith("/login");
  const urlToken = isLoginPath ? urlParams.get("token") : null;
  const storedToken = localStorage.getItem("auth_token");
  const token = urlToken || storedToken;

  if (urlToken) localStorage.setItem("auth_token", urlToken);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // If we have a URL token, skip restoring from localStorage —
    // wait for validation to complete instead
    if (!urlToken && storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      }
    }
    // Don't set isLoading false yet if we have a URL token to validate
    if (!urlToken) {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isError, isSuccess, isPending } = useValidateToken({
    enabled: !!token && (urlToken ? true : !isLoading),
  });

  useEffect(() => {
    if (!token) return;

    if (data) {
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      // Clean up the URL token param without a page reload
      if (urlToken) {
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }
      setIsLoading(false);
    }

    if (isError) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      // toast.error("Your login session has expired. Please log in again.", {
      //   duration: 8000,
      // });
      delete axiosInstance.defaults.headers.common["Authorization"];
      setUser(null);
      setIsLoading(false);
    }
  }, [data, isError]);

  // Login mutation
  const loginMutation = useMutation<
    LoginResponse,
    AxiosError,
    LoginCredentials & { redirectTo?: string }
  >({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await axiosInstance.post<LoginResponse>(
        "/auth/login",
        credentials,
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      axiosInstance.defaults.headers.common["Authorization"] =
        `Bearer ${data.token}`;
      setUser(data.user);
      queryClient.invalidateQueries();
      console.log(
        "Login successful, redirecting...",
        variables.redirectTo || "/my-plans",
      );

      router.history.push(variables.redirectTo || "/my-plans");
    },
  });

  const logout = () => {
    // Clear all plan role entries from localStorage
    const keysToRemove = Object.keys(localStorage).filter((key) =>
      key.startsWith("plan_role_"),
    );
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
    queryClient.clear();
    router.navigate({ to: "/" });
    queryClient.invalidateQueries();
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
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
        token,
        isAuthenticated: !!user,
        isLoading,
        loginMutation,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
