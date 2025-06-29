/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Add your environment variables here
  readonly VITE_API_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
