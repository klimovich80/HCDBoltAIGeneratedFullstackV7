import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../styles/constants';

/**
 * Кнопка с различными вариантами стилей и размерами
 * @param variant - Вариант стиля кнопки
 * @param size - Размер кнопки
 * @param icon - Иконка для отображения на кнопке
 * @param iconPosition - Позиция иконки относительно текста
 * @param children - Содержимое кнопки
 * @param className - Дополнительные CSS классы
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  // Базовые классы для кнопки
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  // Варианты стилей кнопки
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-red-600 text-white hover:red-700 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-indigo-500',
  };
  
  // Размеры кнопки
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  // Размеры иконки в зависимости от размера кнопки
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  // Комбинируем все классы
  const classes = cn(baseClasses, variants[variant], sizes[size], className);
  
  return (
    <button className={classes} disabled={disabled} {...props}>
      {Icon && iconPosition === 'left' && <Icon className={cn(iconSizes[size], children ? 'mr-2' : '')} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className={cn(iconSizes[size], children ? 'ml-2' : '')} />}
    </button>
  );
};

export default Button;