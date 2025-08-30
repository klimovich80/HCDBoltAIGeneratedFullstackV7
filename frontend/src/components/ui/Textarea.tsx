import React from 'react';
import { cn } from '../../styles/constants';

/**
 * Текстовое поле с поддержкой label и ошибок
 * @param label - Текст подписи поля
 * @param error - Текст ошибки для отображения
 * @param className - Дополнительные CSS классы
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  // Базовые классы для текстового поля
  const textareaClasses = cn(
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
      <textarea
        id={id}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Textarea;