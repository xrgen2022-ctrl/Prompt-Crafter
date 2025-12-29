import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type MathAnswerInput, type MathAnswerResponse, type MathQuestionResponse, type SettingsResponse, type WithdrawalResponse } from "@shared/routes";
import { type InsertWithdrawal } from "@shared/schema";

export function useWithdrawals() {
  return useQuery({
    queryKey: [api.withdrawals.list.path],
    queryFn: async () => {
      const res = await fetch(api.withdrawals.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      return api.withdrawals.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertWithdrawal) => {
      const validated = api.withdrawals.create.input.parse(data);
      const res = await fetch(api.withdrawals.create.path, {
        method: api.withdrawals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.withdrawals.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create withdrawal request");
      }
      
      return api.withdrawals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.withdrawals.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.users.stats.path] });
    },
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.withdrawals.approve.path, { id });
      const res = await fetch(url, { 
        method: api.withdrawals.approve.method, 
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to approve withdrawal");
      return api.withdrawals.approve.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.withdrawals.list.path] }),
  });
}

export function useDenyWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.withdrawals.deny.path, { id });
      const res = await fetch(url, { 
        method: api.withdrawals.deny.method, 
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to deny withdrawal");
      return api.withdrawals.deny.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.withdrawals.list.path] }),
  });
}
