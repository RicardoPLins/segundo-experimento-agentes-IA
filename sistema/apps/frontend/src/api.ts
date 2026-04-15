const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export const api = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(await response.text());
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
      throw new Error(await response.text());
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
      throw new Error(await response.text());
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
      throw new Error(await response.text());
    }
  }
};
