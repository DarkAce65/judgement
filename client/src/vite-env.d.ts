/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;

  readonly VITE_APP_API_HOST?: string;
  readonly VITE_APP_API_ROOT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
