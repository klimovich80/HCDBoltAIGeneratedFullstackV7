// tests/LessonForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LessonForm from '../src/components/LessonForm';
import { apiClient } from '../src/lib/api';

// Мокируем API клиент
jest.mock('../src/lib/api', () => ({
  apiClient: {
    getAll: jest.fn(),
    createLesson: jest.fn(),
    updateLesson: jest.fn()
  }
}));

// Мокируем утилиты безопасности
jest.mock('../src/utils/security', () => ({
  sanitizeInput: jest.fn((input) => input),
  validateFutureDate: jest.fn(() => true)
}));

/**
 * Мок данных для тестирования
 */
const mockInstructors = [
  { _id: '1', first_name: 'Иван', last_name: 'Иванов' },
  { _id: '2', first_name: 'Петр', last_name: 'Петров' }
];

const mockMembers = [
  { _id: '1', first_name: 'Анна', last_name: 'Сидорова' },
  { _id: '2', first_name: 'Мария', last_name: 'Кузнецова' }
];

const mockHorses = [
  { _id: '1', name: 'Буцефал', breed: 'Арабская' },
  { _id: '2', name: 'Звезда', breed: 'Ахалтекинская' }
];

const mockLesson = {
  _id: 'lesson1',
  title: 'Урок верховой езды',
  description: 'Базовые навыки верховой езды',
  instructor: { _id: '1', first_name: 'Иван', last_name: 'Иванов' },
  member: { _id: '1', first_name: 'Анна', last_name: 'Сидорова' },
  horse: { _id: '1', name: 'Буцефал', breed: 'Арабская' },
  scheduled_date: '2024-03-15T10:00:00',
  duration_minutes: 60,
  lesson_type: 'private',
  status: 'scheduled',
  cost: 2000,
  payment_status: 'pending',
  notes: 'Принести шлем',
  isActive: true
};

/**
 * Настройка моков перед каждым тестом
 */
beforeEach(() => {
  // Настраиваем моки API
  apiClient.getAll.mockImplementation((resource, params) => {
    if (resource === 'users') {
      if (params && params.role === 'trainer') {
        return Promise.resolve({
          success: true,
          data: mockInstructors
        });
      }
      return Promise.resolve({
        success: true,
        data: mockMembers
      });
    }
    if (resource === 'horses') {
      return Promise.resolve({ success: true, data: mockHorses });
    }
    return Promise.resolve({ success: true, data: [] });
  });

  apiClient.createLesson.mockResolvedValue({ success: true, data: mockLesson });
  apiClient.updateLesson.mockResolvedValue({ success: true, data: mockLesson });
});

/**
 * Очистка моков после каждого теста
 */
afterEach(() => {
  jest.clearAllMocks();
});

/**
 * Тесты для формы уроков
 */
describe('LessonForm', () => {
  /**
   * Тест: должен корректно отображать форму создания урока
   */

  test('должен корректно отображать форму создания урока', async () => {
    await act(async () => {
      render(
        <LessonForm
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          lesson={mockLesson}
          mode="edit"
        />
      );
    });

    // Проверяем заголовок
    expect(screen.getByText('Создать занятие')).toBeInTheDocument();

    // Проверяем наличие основных полей формы
    expect(screen.getByLabelText(/название занятия \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/инструктор \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/участник \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/лошадь/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/тип занятия \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/дата и время \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/продолжительность \(минуты\) \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/стоимость \(₽\) \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/статус/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/статус оплаты/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/заметки/i)).toBeInTheDocument();

    // Проверяем кнопки
    expect(screen.getByRole('button', { name: /создать занятие/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument();
  });

  /**
   * Тест: должен корректно отображать форму редактирования урока
   */
  test('должен корректно отображать форму редактирования урока с заполненными данными', async () => {
    await act(async () => {
      render(
        <LessonForm
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          lesson={mockLesson}
          mode="edit"
        />
      );
    });

    // Проверяем заголовок
    expect(screen.getByText('Редактировать занятие')).toBeInTheDocument();

    // Проверяем заполнение полей
    expect(screen.getByLabelText(/название занятия \*/i)).toHaveValue(mockLesson.title);
    expect(screen.getByLabelText(/инструктор \*/i)).toHaveValue(mockLesson.instructor._id);
    expect(screen.getByLabelText(/участник \*/i)).toHaveValue(mockLesson.member._id);
    expect(screen.getByLabelText(/лошадь/i)).toHaveValue(mockLesson.horse._id);
    expect(screen.getByLabelText(/тип занятия \*/i)).toHaveValue(mockLesson.lesson_type);

    // Форматируем дату для сравнения с значением в input[type="datetime-local"]
    const expectedDate = new Date(mockLesson.scheduled_date);
    const formattedDate = expectedDate.toISOString().slice(0, 16);
    expect(screen.getByLabelText(/дата и время \*/i)).toHaveValue(formattedDate);

    expect(screen.getByLabelText(/продолжительность \(минуты\) \*/i)).toHaveValue(mockLesson.duration_minutes);
    expect(screen.getByLabelText(/стоимость \(₽\) \*/i)).toHaveValue(mockLesson.cost);
    expect(screen.getByLabelText(/статус/i)).toHaveValue(mockLesson.status);
    expect(screen.getByLabelText(/статус оплаты/i)).toHaveValue(mockLesson.payment_status);
    expect(screen.getByLabelText(/описание/i)).toHaveValue(mockLesson.description);
    expect(screen.getByLabelText(/заметки/i)).toHaveValue(mockLesson.notes);

    // Проверяем кнопки
    expect(screen.getByRole('button', { name: /сохранить изменения/i })).toBeInTheDocument();
  });

  /**
   * Тест: должен отображать ошибки валидации при пустых обязательных полях
   */
  test('должен отображать ошибки валидации при пустых обязательных полях', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <LessonForm
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          mode="create"
        />
      );
    });

    // Нажимаем кнопку отправки без заполнения полей
    const submitButton = screen.getByRole('button', { name: /создать занятие/i });
    await user.click(submitButton);

    // Проверяем отображение ошибок валидации
    await waitFor(() => {
      expect(screen.getByText('Название урока обязательно')).toBeInTheDocument();
      expect(screen.getByText('Инструктор обязателен')).toBeInTheDocument();
      expect(screen.getByText('Участник обязателен')).toBeInTheDocument();
      expect(screen.getByText('Дата урока обязательна')).toBeInTheDocument();
    });
  });

  /**
   * Тест: должен успешно отправлять форму при валидных данных
   */
  test('должен успешно отправлять форму при валидных данных', async () => {
    const user = userEvent.setup();
    const onSuccessMock = jest.fn();
    const onCloseMock = jest.fn();

    await act(async () => {
      render(
        <LessonForm
          isOpen={true}
          onClose={onCloseMock}
          onSuccess={onSuccessMock}
          mode="create"
        />
      );
    });

    // Заполняем форму валидными данными
    await user.type(screen.getByLabelText(/название занятия \*/i), 'Новый урок верховой езды');

    // Выбираем инструктора
    const instructorSelect = screen.getByLabelText(/инструктор \*/i);
    await user.selectOptions(instructorSelect, mockInstructors[0]._id);

    // Выбираем участника
    const memberSelect = screen.getByLabelText(/участник \*/i);
    await user.selectOptions(memberSelect, mockMembers[0]._id);

    // Выбираем лошадь
    const horseSelect = screen.getByLabelText(/лошадь/i);
    await user.selectOptions(horseSelect, mockHorses[0]._id);

    // Заполняем дату и время
    const dateInput = screen.getByLabelText(/дата и время \*/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2024-03-20T14:00');

    // Заполняем продолжительность
    const durationInput = screen.getByLabelText(/продолжительность \(минуты\) \*/i);
    await user.clear(durationInput);
    await user.type(durationInput, '90');

    // Заполняем стоимость
    const costInput = screen.getByLabelText(/стоимость \(₽\) \*/i);
    await user.clear(costInput);
    await user.type(costInput, '3000');

    // Выбираем тип занятия
    const typeSelect = screen.getByLabelText(/тип занятия \*/i);
    await user.selectOptions(typeSelect, 'private');

    // Выбираем статус
    const statusSelect = screen.getByLabelText(/статус/i);
    await user.selectOptions(statusSelect, 'scheduled');

    // Выбираем статус оплаты
    const paymentSelect = screen.getByLabelText(/статус оплаты/i);
    await user.selectOptions(paymentSelect, 'pending');

    // Заполняем описание
    await user.type(screen.getByLabelText(/описание/i), 'Описание нового урока');

    // Заполняем заметки
    await user.type(screen.getByLabelText(/заметки/i), 'Заметки к уроку');

    // Отправляем форму
    const submitButton = screen.getByRole('button', { name: /создать занятие/i });
    await user.click(submitButton);

    // Проверяем вызов API
    await waitFor(() => {
      expect(apiClient.createLesson).toHaveBeenCalledWith({
        title: 'Новый урок верховой езды',
        description: 'Описание нового урока',
        instructor: mockInstructors[0]._id,
        member: mockMembers[0]._id,
        horse: mockHorses[0]._id,
        scheduled_date: expect.any(String),
        duration_minutes: 90,
        lesson_type: 'private',
        cost: 3000,
        status: 'scheduled',
        payment_status: 'pending',
        notes: 'Заметки к уроку'
      });
    });

    // Проверяем вызов колбэков
    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  /**
   * Тест: должен обрабатывать ошибки при отправке формы
   */
  test('должен обрабатывать ошибки при отправке формы', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    // Мокируем ошибку API
    apiClient.createLesson.mockRejectedValueOnce(new Error('Ошибка сети'));

    await act(async () => {
      render(
        <LessonForm
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          mode="create"
        />
      );
    });

    // Заполняем обязательные поля
    await user.type(screen.getByLabelText(/название занятия \*/i), 'Новый урок');

    const instructorSelect = screen.getByLabelText(/инструктор \*/i);
    await user.selectOptions(instructorSelect, mockInstructors[0]._id);

    const memberSelect = screen.getByLabelText(/участник \*/i);
    await user.selectOptions(memberSelect, mockMembers[0]._id);

    const dateInput = screen.getByLabelText(/дата и время \*/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2024-03-20T14:00');

    // Отправляем форму
    const submitButton = screen.getByRole('button', { name: /создать занятие/i });
    await user.click(submitButton);

    // Проверяем отображение ошибки
    await waitFor(() => {
      expect(screen.getByText('Ошибка сети')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  /**
   * Тест: должен загружать данные инструкторов, участников и лошадей при открытии формы
   */
  test('должен загружать данные инструкторов, участников и лошадей при открытии формы', async () => {
    await act(async () => {
      render(
        <LessonForm
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          mode="create"
        />
      );
    });

    // Проверяем вызовы API для загрузки данных
    expect(apiClient.getAll).toHaveBeenCalledWith('users', { role: 'trainer' });
    expect(apiClient.getAll).toHaveBeenCalledWith('users', { role: 'member' });
    expect(apiClient.getAll).toHaveBeenCalledWith('horses');

    // Проверяем заполнение выпадающих списков
    await waitFor(() => {
      expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
      expect(screen.getByText('Петр Петров')).toBeInTheDocument();
      expect(screen.getByText('Анна Сидорова')).toBeInTheDocument();
      expect(screen.getByText('Мария Кузнецова')).toBeInTheDocument();
      expect(screen.getByText('Буцефал (Арабская)')).toBeInTheDocument();
      expect(screen.getByText('Звезда (Ахалтекинская)')).toBeInTheDocument();
    });
  });

  /**
   * Тест: должен закрывать форму при нажатии на кнопку отмены
   */
  test('должен закрывать форму при нажатии на кнопку отмены', async () => {
    const user = userEvent.setup();
    const onCloseMock = jest.fn();

    await act(async () => {
      render(
        <LessonForm
          isOpen={true}
          onClose={onCloseMock}
          onSuccess={jest.fn()}
          mode="create"
        />
      );
    });

    // Нажимаем кнопку отмены
    const cancelButton = screen.getByRole('button', { name: /отмена/i });
    await user.click(cancelButton);

    // Проверяем вызов колбэка закрытия
    expect(onCloseMock).toHaveBeenCalled();
  });

  /**
   * Тест: должен санитизировать ввод пользователя
   */
  test('должен санитизировать ввод пользователя', async () => {
    const user = userEvent.setup();
    const { sanitizeInput } = require('../src/utils/security');

    await act(async () => {
      render(
        <LessonForm
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          mode="create"
        />
      );
    });

    // Вводим потенциально опасные данные
    const dangerousInput = '<script>alert("xss")</script>';
    await user.type(screen.getByLabelText(/название занятия \*/i), dangerousInput);

    // Отправляем форму
    const submitButton = screen.getByRole('button', { name: /создать занятие/i });
    await user.click(submitButton);

    // Проверяем вызов функции санитизации
    expect(sanitizeInput).toHaveBeenCalledWith(dangerousInput);
  });
});