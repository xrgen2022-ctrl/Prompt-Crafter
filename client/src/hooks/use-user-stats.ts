import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useUserStats() {
  return useQuery({
    queryKey: [api.users.stats.path],
    queryFn: async () => {
      const res = await fetch(api.users.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user stats");
      return api.users.stats.responses[200].parse(await res.json());
    },
  });
}
