const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export const api = {
  async parseError(response: Response): Promise<string> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const data = (await response.json()) as { message?: string };
        if (data?.message) {
          return data.message;
        }
      } catch {
        // fall through
      }
    }
    try {
      const text = await response.text();
      return text || response.statusText;
    } catch {
      return response.statusText || "Request failed";
    }
  },
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(await api.parseError(response));
    }
    return response.json() as Promise<T>;
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(await api.parseError(response));
    }
    if (response.status === 204) {
      return undefined as T;
    }
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  },
  async put<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(await api.parseError(response));
    }
    if (response.status === 204) {
      return undefined as T;
    }
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  },
  async del(path: string): Promise<void> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      throw new Error(await api.parseError(response));
    }
  }
};
