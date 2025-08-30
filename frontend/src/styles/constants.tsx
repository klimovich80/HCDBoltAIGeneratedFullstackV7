/**
 * Константы для централизованного управления стилями
 * Содержит цвета, размеры, тени, закругления и классы для часто используемых стилей
 */

// Цвета
export const colors = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
};

// Размеры
export const sizes = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
  '2xl': '2rem',
};

// Тени
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Закругления
export const radii = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  full: '9999px',
};

// Анимации
export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
};

// Классы для часто используемых стилей
export const classNames = {
  // Inputs
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
  inputError: 'border-red-300 focus:ring-red-500 focus:border-red-500',
  
  // Buttons
  button: 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
  buttonPrimary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
  buttonSecondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
  buttonDanger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Sizes
  buttonSm: 'px-3 py-1.5 text-sm',
  buttonMd: 'px-4 py-2 text-sm',
  buttonLg: 'px-6 py-3 text-base',
  
  // Cards
  card: 'bg-white rounded-lg shadow',
  cardHeader: 'px-6 py-4 border-b border-gray-200',
  cardBody: 'p-6',
  cardFooter: 'px-6 py-4 border-t border-gray-200 bg-gray-50',
  
  // Tables
  table: 'min-w-full divide-y divide-gray-200',
  tableHead: 'bg-gray-50',
  tableHeader: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableRow: 'hover:bg-gray-50',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  
  // Badges
  badge: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
  badgeSuccess: 'bg-green-100 text-green-800',
  badgeWarning: 'bg-yellow-100 text-yellow-800',
  badgeError: 'bg-red-100 text-red-800',
  badgeInfo: 'bg-blue-100 text-blue-800',
  badgeNeutral: 'bg-gray-100 text-gray-800',
  
  // Alerts
  alert: 'p-4 rounded-md',
  alertSuccess: 'bg-green-50 text-green-800 border border-green-200',
  alertError: 'bg-red-50 text-red-800 border border-red-200',
  alertWarning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  alertInfo: 'bg-blue-50 text-blue-800 border border-blue-200',
};

/**
 * Утилита для объединения классов CSS
 * @param classes Классы для объединения
 * @returns Объединенная строка классов
 */
export const cn = (...classes: (string | undefined | false)[]): string => 
  classes.filter(Boolean).join(' ');