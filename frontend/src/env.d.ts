// frontend/src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // добавьте другие переменные окружения здесь по мере необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}