/**
 * Утилиты для безопасности и санитизации данных
 * Защита от XSS, валидация ввода, очистка данных
 */

/**
 * Санитизирует строку для предотвращения XSS-атак
 * @param input Входная строка
 * @returns Санитизированная строка
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Санитизирует email адрес
 * @param email Email адрес
 * @returns Очищенный email в нижнем регистре
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Санитизирует номер телефона, оставляя только цифры
 * @param phone Номер телефона
 * @returns Номер телефона только с цифрами
 */
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Валидирует email адрес
 * @param email Email адрес
 * @returns true если email валиден
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Валидирует номер телефона
 * @param phone Номер телефона
 * @returns true если номер телефона валиден
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+7|8)[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Валидирует дату (не раньше текущего момента)
 * @param dateString Строка с датой
 * @returns true если дата валидна
 */
export const validateFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date >= new Date();
};

/**
 * Ограничивает длину строки
 * @param input Входная строка
 * @param maxLength Максимальная длина
 * @returns Обрезанная строка если превышена максимальная длина
 */
export const truncateString = (input: string, maxLength: number): string => {
  return input.length > maxLength ? input.substring(0, maxLength) + '...' : input;
};