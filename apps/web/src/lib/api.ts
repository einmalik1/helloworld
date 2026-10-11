import { configureClient, fetchHealth } from "@helloworld/api-client";

const apiUrl = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

configureClient({
  apiUrl,
  credentials: "include",
});

export { fetchHealth };
export const publicApiUrl = apiUrl;
export const publicChatUrl = import.meta.env.PUBLIC_CHAT_URL || "http://localhost:3200";
