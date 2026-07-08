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
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : `请求失败 (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}
