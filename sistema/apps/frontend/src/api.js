const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
export const api = {
    async get(path) {
        const response = await fetch(`${baseUrl}${path}`);
        if (!response.ok) {
            throw new Error(await response.text());
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
            throw new Error(await response.text());
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
            throw new Error(await response.text());
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
            throw new Error(await response.text());
        }
    }
};
