import { auth } from "./auth";

// All /api calls are proxied through Vite to localhost:3001 in dev,
// and should be served from the same origin in production.
// Set VITE_API_URL only if your backend lives on a separate domain.
const BASE = import.meta.env.VITE_API_URL ?? "";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = auth.getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    auth.removeToken();
    window.location.href = "/";
    throw new ApiError(401, "Session expired — please log in again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`);
  }

  return data as T;
}

const get  = <T>(path: string)              => request<T>("GET",    path);
const post = <T>(path: string, body: unknown) => request<T>("POST",   path, body);
const put  = <T>(path: string, body: unknown) => request<T>("PUT",    path, body);
const del  = <T>(path: string)              => request<T>("DELETE", path);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (email: string, password: string) =>
    post<{ user: User; token: string }>("/api/auth/login", { email, password }),
  signup:         (email: string, password: string, username?: string) =>
    post<{ user: User; token: string }>("/api/auth/signup", { email, password, username }),
  logout:         () => post<{ message: string }>("/api/auth/logout", {}),
  me:             () => get<{ user: User }>("/api/auth/me"),
  updateMe:       (data: Partial<User>) => put<{ user: User }>("/api/auth/me", data),
  changePassword: (current_password: string, new_password: string) =>
    put<{ message: string }>("/api/auth/change-password", { current_password, new_password }),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: (date_range = "30days") =>
    get<DashboardData>(`/api/analytics/dashboard?date_range=${date_range}`),
  summary: () => get<AnalyticsSummary>("/api/analytics/summary"),
  niche:   (niche: string, date_range = "30days") =>
    get<NicheData>(`/api/analytics/niche/${niche}?date_range=${date_range}`),
  trackEvent: (payload: EventPayload) =>
    post<{ event: unknown }>("/api/analytics/event", payload),
};

// ─── Content ─────────────────────────────────────────────────────────────────
export const contentApi = {
  list:         (params?: { niche?: string; status?: string; limit?: number; offset?: number }) =>
    get<ContentList>(`/api/content/list${toQuery(params)}`),
  get:          (id: string) => get<{ content: ContentItem }>(`/api/content/${id}`),
  create:       (data: Partial<ContentItem>) => post<{ content: ContentItem }>("/api/content/create", data),
  update:       (id: string, data: Partial<ContentItem>) => put<{ content: ContentItem }>(`/api/content/${id}`, data),
  remove:       (id: string) => del<{ message: string }>(`/api/content/${id}`),
  generateCopy: (product_name: string, niche: string, tone?: string, num_variations?: number) =>
    post<{ descriptions: string[] }>("/api/content/generate-copy", { product_name, niche, tone, num_variations }),
  schedule:     (content_id: string, platforms: string[], schedule: { date: string; time: string }[]) =>
    post<{ scheduledPosts: unknown[] }>("/api/content/schedule", { content_id, platforms, schedule }),
};

// ─── Affiliate ────────────────────────────────────────────────────────────────
export const affiliateApi = {
  list:        (params?: { niche?: string; sort_by?: string; limit?: number; offset?: number }) =>
    get<{ links: AffiliateLink[]; summary: AffiliateSummary }>(`/api/affiliate/links${toQuery(params)}`),
  get:         (id: string) => get<{ link: AffiliateLink }>(`/api/affiliate/links/${id}`),
  create:      (data: Partial<AffiliateLink> & { original_url: string; product_name: string; niche: string }) =>
    post<{ link: AffiliateLink }>("/api/affiliate/create-link", data),
  update:      (id: string, data: Partial<AffiliateLink>) => put<{ link: AffiliateLink }>(`/api/affiliate/links/${id}`, data),
  remove:      (id: string) => del<{ message: string }>(`/api/affiliate/links/${id}`),
  recordClick: (id: string, platform?: string) =>
    post<{ message: string }>(`/api/affiliate/links/${id}/click`, { platform }),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  list:   (params?: { niche?: string; status?: string; limit?: number }) =>
    get<{ data: Product[]; total: number }>(`/api/products/list${toQuery(params)}`),
  get:    (id: string) => get<{ product: Product }>(`/api/products/${id}`),
  create: (data: Partial<Product> & { name: string; price: number; niche: string }) =>
    post<{ product: Product }>("/api/products/create", data),
  update: (id: string, data: Partial<Product>) => put<{ product: Product }>(`/api/products/${id}`, data),
  remove: (id: string) => del<{ message: string }>(`/api/products/${id}`),
  sales:  (id: string) => get<{ sales: unknown }>(`/api/products/${id}/sales`),
};

// ─── Platforms ────────────────────────────────────────────────────────────────
export const platformsApi = {
  connections:    () => get<{ connections: PlatformConnection[] }>("/api/platforms/connections"),
  connect:        (data: { platform_name: string; access_token: string; account_name?: string }) =>
    post<{ connection: PlatformConnection }>("/api/platforms/connect", data),
  disconnect:     (platform: string) => del<{ message: string }>(`/api/platforms/connections/${platform}`),
  scheduledPosts: (params?: { platform?: string; status?: string }) =>
    get<{ posts: unknown[] }>(`/api/platforms/scheduled-posts${toQuery(params)}`),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  get:               () => get<{ preferences: Record<string, unknown>; connected_services: string[] }>("/api/settings"),
  updatePreferences: (preferences: Record<string, unknown>) =>
    put<{ preferences: Record<string, unknown> }>("/api/settings/preferences", { preferences }),
  niches:            () => get<{ niches: NicheConfig[] }>("/api/settings/niches"),
  createNiche:       (data: Partial<NicheConfig> & { niche_name: string }) =>
    post<{ niche: NicheConfig }>("/api/settings/niches", data),
};

// ─── Utility ─────────────────────────────────────────────────────────────────
function toQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return q ? `?${q}` : "";
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  username: string;
  preferences?: Record<string, unknown>;
  created_at?: string;
}

export interface ContentItem {
  id: string;
  content_type: string;
  niche: string;
  title: string;
  description?: string;
  image_url?: string;
  status: string;
  affiliate_link?: string;
  tags?: string[];
  performance_metrics?: { views: number; clicks: number; conversions: number; revenue: number };
  created_at: string;
  published_at?: string;
}

export interface ContentList {
  data: ContentItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface AffiliateLink {
  id: string;
  product_name: string;
  shortened_url: string;
  niche: string;
  affiliate_network: string;
  commission_rate: number;
  clicks: number;
  conversions: number;
  revenue: number;
  status: string;
  created_at: string;
}

export interface AffiliateSummary {
  total_links: string;
  total_clicks: string;
  total_conversions: string;
  total_revenue: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  niche: string;
  product_type?: string;
  sales_count: number;
  revenue: number;
  status: string;
  gumroad_url?: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface PlatformConnection {
  id: string;
  platform_name: string;
  account_name?: string;
  account_id?: string;
  connection_status: string;
  connected_at: string;
}

export interface NicheConfig {
  id: string;
  niche_name: string;
  description?: string;
  posting_frequency: number;
  status: string;
}

export interface DashboardData {
  summary: {
    total_revenue: number;
    total_clicks: number;
    total_conversions: number;
    conversion_rate: string;
  };
  by_niche: Array<{ niche: string; revenue: string; clicks: string; conversions: string }>;
  by_platform: Array<{ platform: string; revenue: string; clicks: string; conversions: string }>;
  top_performers: Array<{ id: string; title: string; content_type: string; clicks: string; conversions: string }>;
  trends: Array<{ date: string; revenue: string; events: string }>;
}

export interface AnalyticsSummary {
  affiliate: { affiliate_revenue: string; affiliate_clicks: string; affiliate_conversions: string };
  content:   { published: string; scheduled: string; draft: string };
  products:  { product_revenue: string; product_sales: string };
}

export interface NicheData {
  niche: string;
  metrics: { revenue: string; clicks: string; conversions: string };
  content: ContentItem[];
}

export interface EventPayload {
  event_type: string;
  content_id?: string;
  affiliate_link_id?: string;
  platform?: string;
  metric_value?: number;
  metadata?: Record<string, unknown>;
}
