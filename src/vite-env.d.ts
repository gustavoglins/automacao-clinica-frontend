/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NRD_API_KEY?: string;
  readonly VITE_NRD_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
