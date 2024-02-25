/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * The executor backend URL.
   */
  readonly VITE_BACKEND: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
