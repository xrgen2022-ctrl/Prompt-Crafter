import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type MathAnswerInput } from "@shared/routes";

export function useMathQuestion() {
  return useQuery({
    queryKey: [api.math.question.path],
    queryFn: async () => {
      const res = await fetch(api.math.question.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch question");
      return api.math.question.responses[200].parse(await res.json());
    },
    refetchOnWindowFocus: false, // Don't refetch on window focus to keep same question
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MathAnswerInput) => {
      const res = await fetch(api.math.answer.path, {
        method: api.math.answer.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.math.answer.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit answer");
      }
      
      return api.math.answer.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate user stats to update coin balance
      queryClient.invalidateQueries({ queryKey: [api.users.stats.path] });
      // Invalidate question to get a new one
      queryClient.invalidateQueries({ queryKey: [api.math.question.path] });
    },
  });
}
