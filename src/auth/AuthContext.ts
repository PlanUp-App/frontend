import { createContext } from "react";
import type { User } from "./auth";
import type { UseMutationResult } from "@tanstack/react-query";
import type { LoginCredentials, LoginResponse } from "@/routes/login/-queries";
import type { AxiosError } from "axios";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginMutation: UseMutationResult<LoginResponse, AxiosError, LoginCredentials>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
