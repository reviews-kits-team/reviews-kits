import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_AUTH_BASE_URL || (typeof window !== "undefined" ? window.location.origin + "/api/auth" : "http://localhost:3000/api/auth"),
    plugins: [
        organizationClient()
    ]
});
