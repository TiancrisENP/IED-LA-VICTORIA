export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/ied-api";

const ACCESS_KEY = "ied_access_token";
const REFRESH_KEY = "ied_refresh_token";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function parseError(response: Response) {
  const body = (await response.json().catch(() => ({}))) as {
    message?: string | string[];
  };
  const message = Array.isArray(body.message)
    ? body.message.join(", ")
    : body.message ?? `Error ${response.status}`;
  return new ApiError(response.status, message);
}

async function rawFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  const isForm = options.body instanceof FormData;
  if (!headers.has("Content-Type") && !isForm) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response = await rawFetch(path, options);

  const skipRefresh =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/logout") ||
    path.startsWith("/auth/bootstrap");
  if (response.status === 401 && !skipRefresh) {
    const refreshed = await rawFetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (refreshed.ok) {
      response = await rawFetch(path, options);
    } else {
      clearTokens();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
