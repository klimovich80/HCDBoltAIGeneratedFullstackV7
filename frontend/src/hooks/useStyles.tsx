import { useMemo } from 'react';
import { classNames, cn } from '../styles/constants';

/**
 * Хук для доступа к централизованным стилям
 * @returns Объект с функциями для применения стилей
 */
export const useStyles = () => {
  return useMemo(() => ({
    // Входные поля
    input: (error?: boolean, className?: string) => 
      cn(classNames.input, error && classNames.inputError, className),
    
    // Кнопки
    button: (variant: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' = 'primary', size: 'sm' | 'md' | 'lg' = 'md', className?: string) => {
      const base = classNames.button;
      const variantClass = {
        primary: classNames.buttonPrimary,
        secondary: classNames.buttonSecondary,
        danger: classNames.buttonDanger,
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-indigo-500',
      }[variant];
      
      const sizeClass = {
        sm: classNames.buttonSm,
        md: classNames.buttonMd,
        lg: classNames.buttonLg,
      }[size];
      
      return cn(base, variantClass, sizeClass, className);
    },
    
    // Карточки
    card: (className?: string) => cn(classNames.card, className),
    cardHeader: (className?: string) => cn(classNames.cardHeader, className),
    cardBody: (className?: string) => cn(classNames.cardBody, className),
    cardFooter: (className?: string) => cn(classNames.cardFooter, className),
    
    // Таблицы
    table: (className?: string) => cn(classNames.table, className),
    tableHead: (className?: string) => cn(classNames.tableHead, className),
    tableHeader: (className?: string) => cn(classNames.tableHeader, className),
    tableRow: (className?: string) => cn(classNames.tableRow, className),
    tableCell: (className?: string) => cn(classNames.tableCell, className),
    
    // Бейджи
    badge: (type: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'neutral', className?: string) => 
      cn(
        classNames.badge, 
        {
          success: classNames.badgeSuccess,
          warning: classNames.badgeWarning,
          error: classNames.badgeError,
          info: classNames.badgeInfo,
          neutral: classNames.badgeNeutral,
        }[type],
        className
      ),
    
    // Уведомления
    alert: (type: 'success' | 'error' | 'warning' | 'info', className?: string) => 
      cn(
        classNames.alert, 
        {
          success: classNames.alertSuccess,
          error: classNames.alertError,
          warning: classNames.alertWarning,
          info: classNames.alertInfo,
        }[type],
        className
      ),
    
    // Утилиты
    cn,
  }), []);
};