import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:3000/api/auth",
    plugins: [
        organizationClient()
    ]
});
