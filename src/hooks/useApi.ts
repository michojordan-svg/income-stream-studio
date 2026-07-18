import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  analyticsApi,
  contentApi,
  affiliateApi,
  productsApi,
  platformsApi,
  settingsApi,
  authApi,
} from "@/lib/api";

// ─── Keys ────────────────────────────────────────────────────────────────────
export const keys = {
  me:          () => ["me"]                  as const,
  dashboard:   (r: string) => ["dashboard", r] as const,
  summary:     () => ["summary"]             as const,
  content:     (p: object) => ["content", p] as const,
  links:       (p: object) => ["links", p]   as const,
  products:    (p: object) => ["products", p]as const,
  platforms:   () => ["platforms"]           as const,
  settings:    () => ["settings"]            as const,
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const useMe = () =>
  useQuery({ queryKey: keys.me(), queryFn: () => authApi.me(), retry: false });

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const useDashboard = (range = "30days") =>
  useQuery({ queryKey: keys.dashboard(range), queryFn: () => analyticsApi.dashboard(range), staleTime: 60_000 });

export const useAnalyticsSummary = () =>
  useQuery({ queryKey: keys.summary(), queryFn: analyticsApi.summary, staleTime: 60_000 });

// ─── Content ─────────────────────────────────────────────────────────────────
export const useContent = (params: { niche?: string; status?: string; limit?: number } = {}) =>
  useQuery({ queryKey: keys.content(params), queryFn: () => contentApi.list(params), staleTime: 30_000 });

export const useCreateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: contentApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["content"] }),
  });
};

// ─── Affiliate links ──────────────────────────────────────────────────────────
export const useLinks = (params: { niche?: string; sort_by?: string; limit?: number } = {}) =>
  useQuery({ queryKey: keys.links(params), queryFn: () => affiliateApi.list(params), staleTime: 30_000 });

export const useCreateLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: affiliateApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const useProducts = (params: { niche?: string; status?: string; limit?: number } = {}) =>
  useQuery({ queryKey: keys.products(params), queryFn: () => productsApi.list(params), staleTime: 30_000 });

// ─── Platforms ────────────────────────────────────────────────────────────────
export const usePlatformConnections = () =>
  useQuery({ queryKey: keys.platforms(), queryFn: platformsApi.connections, staleTime: 120_000 });

// ─── Settings ─────────────────────────────────────────────────────────────────
export const useSettings = () =>
  useQuery({ queryKey: keys.settings(), queryFn: settingsApi.get, staleTime: 120_000 });
