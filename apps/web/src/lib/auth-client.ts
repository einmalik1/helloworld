import { apiKeyClient } from "@better-auth/api-key/client";
import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

type AuthClientSurface = {
  apiKey: {
    create: (args: {
      name?: string;
    }) => Promise<{ data: { key?: string; id?: string } | null; error: { message?: string } | null }>;
    list: (
      args?: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message?: string } | null }>;
    delete: (args: {
      keyId: string;
    }) => Promise<{ data: unknown; error: { message?: string } | null }>;
  };
  signIn: {
    email: (args: {
      email: string;
      password: string;
    }) => Promise<{ error: { message?: string } | null }>;
  };
  signUp: {
    email: (args: {
      email: string;
      password: string;
      name: string;
    }) => Promise<{ error: { message?: string } | null }>;
  };
  signOut: () => Promise<unknown>;
  useSession: () => {
    data: { user?: { email?: string | null } } | null;
    isPending: boolean;
  };
};

// Hand-typed surface: Better Auth plugin client inference pulls non-portable Zod aliases under TS 7.
export const authClient: AuthClientSurface = createAuthClient({
  baseURL,
  plugins: [apiKeyClient()],
}) as unknown as AuthClientSurface;
