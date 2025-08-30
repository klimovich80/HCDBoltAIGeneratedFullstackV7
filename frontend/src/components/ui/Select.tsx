import React from 'react';
import { cn } from '../../styles/constants';

/**
 * Выпадающий список с поддержкой label и ошибок
 * @param label - Текст подписи поля
 * @param error - Текст ошибки для отображения
 * @param options - Опции для выбора
 * @param className - Дополнительные CSS классы
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  className = '',
  id,
  options,
  ...props
}) => {
  // Базовые классы для выпадающего списка
  const selectClasses = cn(
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
      <select
        id={id}
        className={selectClasses}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;