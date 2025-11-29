import { queryClient } from "@/utils/queryclient/queryClient";
import { useLogin, useValidateToken } from "../routes/login/-queries";
import { AuthContext } from "./AuthContext";
import { router } from "@/main";

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture: string | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useValidateToken();
  const loginMutation = useLogin();

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    const data = await loginMutation.mutateAsync({ email, password });
    localStorage.setItem("token", data.token);
    queryClient.setQueryData(["validate-token"], data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["validate-token"], null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (isError) {
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user: user || null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
