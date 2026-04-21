const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
export const api = {
    async parseError(response) {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
            try {
                const data = (await response.json());
                if (data?.message) {
                    return data.message;
                }
            }
            catch {
                // fall through
            }
        }
        try {
            const text = await response.text();
            return text || response.statusText;
        }
        catch {
            return response.statusText || "Request failed";
        }
    },
    async get(path) {
        const response = await fetch(`${baseUrl}${path}`);
        if (!response.ok) {
            throw new Error(await api.parseError(response));
        }
        return response.json();
    },
    async post(path, body) {
        const response = await fetch(`${baseUrl}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(await api.parseError(response));
        }
        if (response.status === 204) {
            return undefined;
        }
        const text = await response.text();
        if (!text) {
            return undefined;
        }
        return JSON.parse(text);
    },
    async put(path, body) {
        const response = await fetch(`${baseUrl}${path}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(await api.parseError(response));
        }
        if (response.status === 204) {
            return undefined;
        }
        const text = await response.text();
        if (!text) {
            return undefined;
        }
        return JSON.parse(text);
    },
    async del(path) {
        const response = await fetch(`${baseUrl}${path}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(await api.parseError(response));
        }
    }
};
