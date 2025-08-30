import React from 'react';
import { cn } from '../../styles/constants';

/**
 * Карточка для отображения контента с заголовком и футером
 * @param title - Заголовок карточки
 * @param footer - Футер карточки
 * @param children - Основное содержимое карточки
 * @param className - Дополнительные CSS классы
 */
interface CardProps {
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  footer,
  children,
  className = '',
}) => {
  // Базовые классы для карточки
  const cardClasses = cn('bg-white rounded-lg shadow', className);
  
  return (
    <div className={cardClasses}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;