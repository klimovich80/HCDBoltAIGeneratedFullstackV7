/**
 * Утилиты для экспорта данных в различные форматы
 * CSV, Excel (через создание CSV), JSON
 */

/**
 * Экспортирует данные в CSV файл
 * @param data Данные для экспорта
 * @param filename Название файла
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        `"${String(row[header] || '').replace(/"/g, '""')}"`
      ).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Экспортирует данные в JSON файл
 * @param data Данные для экспорта
 * @param filename Название файла
 */
export const exportToJSON = (data: any[], filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Преобразует данные таблицы в формат для экспорта
 * @param lessons Список уроков
 * @returns Данные в формате для экспорта
 */
export const prepareLessonsForExport = (lessons: any[]) => {
  return lessons.map(lesson => ({
    'Название': lesson.title,
    'Тип': lesson.lesson_type === 'private' ? 'индивидуальное' :
      lesson.lesson_type === 'group' ? 'групповое' : 'тренировка',
    'Дата': formatDate(lesson.scheduled_date),
    'Время': formatTime(lesson.scheduled_date),
    'Продолжительность': `${lesson.duration_minutes} мин`,
    'Участник': `${lesson.member.first_name} ${lesson.member.last_name}`,
    'Инструктор': `${lesson.instructor.first_name} ${lesson.instructor.last_name}`,
    'Лошадь': lesson.horse ? lesson.horse.name : 'Не назначена',
    'Статус': lesson.status === 'scheduled' ? 'запланировано' :
      lesson.status === 'completed' ? 'завершено' :
        lesson.status === 'cancelled' ? 'отменено' : 'не явился',
    'Стоимость': `${lesson.cost}₽`,
    'Статус оплаты': lesson.payment_status === 'paid' ? 'оплачено' : 
                    lesson.payment_status === 'pending' ? 'ожидает' : 'просрочено',
    'Архивировано': lesson.isActive === false ? 'Да' : 'Нет'
  }));
};

/**
 * Форматирует дату для отображения
 * @param dateString Строка с датой
 * @returns Отформатированная дата
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Форматирует время для отображения
 * @param dateString Строка с датой
 * @returns Отформатированное время
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
};