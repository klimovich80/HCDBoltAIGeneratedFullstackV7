// frontend/src/config.js
import sharedConfig from '../../../shared/config.js';

// Для Vite используем импорт мета переменных
const frontendConfig = {
  ...sharedConfig,
  api: {
    ...sharedConfig.api,
    baseUrl: import.meta.env.VITE_API_URL || sharedConfig.api.baseUrl
  }
};

// Экспортируем константы для удобства использования
export const {
  frontend,
  api
} = frontendConfig;

// Примеры использования в компонентах React:
export const useApi = () => {
  const login = async (credentials) => {
    const response = await fetch(`${api.fullUrls.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  };

  return { login };
};

// Пример использования в роутинге
export const getFrontendPath = (pathName) => {
  return frontend.paths[pathName] || '/';
};