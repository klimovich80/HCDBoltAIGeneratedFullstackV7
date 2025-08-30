import React from 'react';
import { cn } from '../../styles/constants';

/**
 * Поле ввода с поддержкой label и ошибок
 * @param label - Текст подписи поля
 * @param error - Текст ошибки для отображения
 * @param className - Дополнительные CSS классы
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  // Базовые классы для поля ввода
  const inputClasses = cn(
    'w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
    error ? 'border-red-300' : 'border-gray-300',
    className
  );
  
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;