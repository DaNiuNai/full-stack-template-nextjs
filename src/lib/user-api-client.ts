type HelloData = {
  greeting: string;
};

export type LoginStatusData = {
  status: boolean;
};

export type UserByIdData = {
  id: string;
  name: string | null;
};

export type CurrentUserData = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
};

export type SecretMessageData = {
  message: string;
};

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly issues?: unknown;

  constructor(input: {
    code: string;
    message: string;
    status: number;
    issues?: unknown;
  }) {
    super(input.message);
    this.name = "ApiClientError";
    this.code = input.code;
    this.status = input.status;
    this.issues = input.issues;
  }
}

export function fetchHello(text: string) {
  const params = new URLSearchParams({ text });
  return fetchJson<HelloData>(`/api/user/hello?${params}`);
}

export function fetchLoginStatus() {
  return fetchJson<LoginStatusData>("/api/user/is-logged");
}

export function fetchUserById(id: string) {
  const params = new URLSearchParams({ id });
  return fetchJson<UserByIdData>(`/api/user/by-id?${params}`);
}

export function fetchCurrentUser() {
  return fetchJson<CurrentUserData>("/api/user/me");
}

export function fetchSecretMessage() {
  return fetchJson<SecretMessageData>("/api/user/secret-message");
}

export function updateCurrentUserName(name: string) {
  return fetchJson<CurrentUserData>("/api/user/update-name", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = getApiError(data, response.status);
    throw new ApiClientError({ ...error, status: response.status });
  }

  return data as T;
}

function getApiError(data: unknown, status: number) {
  const fallback = {
    code: "UNKNOWN",
    message: `请求失败 (${status})`,
    issues: undefined,
  };

  if (!data || typeof data !== "object" || !("error" in data)) {
    return fallback;
  }

  if (typeof data.error === "string") {
    return { ...fallback, message: data.error };
  }

  if (!data.error || typeof data.error !== "object") {
    return fallback;
  }

  const error = data.error as {
    code?: unknown;
    message?: unknown;
    issues?: unknown;
  };

  return {
    code: typeof error.code === "string" ? error.code : fallback.code,
    message:
      typeof error.message === "string" ? error.message : fallback.message,
    issues: error.issues,
  };
}
