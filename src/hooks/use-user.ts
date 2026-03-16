import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUser() {
  const user = useQuery(api.users.viewer);
  
  return {
    user,
    userId: user?._id,
    isLoading: user === undefined,
    isAuthenticated: user !== null && user !== undefined,
  };
}
