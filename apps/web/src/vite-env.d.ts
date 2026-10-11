/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_CHAT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
