const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название урока обязательно'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Инструктор обязателен']
  },
  horse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Horse'
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Участник обязателен']
  },
  scheduled_date: {
    type: Date,
    required: [true, 'Дата урока обязательна']
  },
  duration_minutes: {
    type: Number,
    required: [true, 'Продолжительность обязательна'],
    default: 60,
    min: [15, 'Минимальная продолжительность 15 минут'],
    max: [240, 'Максимальная продолжительность 240 минут']
  },
  lesson_type: {
    type: String,
    required: [true, 'Тип урока обязателен'],
    enum: {
      values: ['private', 'group', 'training'],
      message: 'Тип урока должен быть private, group или training'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'completed', 'cancelled', 'no_show'],
      message: 'Статус должен быть scheduled, completed, cancelled или no_show'
    },
    default: 'scheduled'
  },
  cost: {
    type: Number,
    required: [true, 'Стоимость обязательна'],
    min: [0, 'Стоимость не может быть отрицательной'],
    default: 0
  },
  payment_status: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'overdue'],
      message: 'Статус оплаты должен быть pending, paid или overdue'
    },
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Автоматически добавляет createdAt и updatedAt
});

// Создание индексов для оптимизации запросов
lessonSchema.index({ scheduled_date: 1 });           // Поиск по дате
lessonSchema.index({ instructor: 1 });               // Поиск по инструктору
lessonSchema.index({ member: 1 });                   // Поиск по участнику
lessonSchema.index({ status: 1 });                   // Поиск по статусу
lessonSchema.index({ isActive: 1 });                 // Поиск по активности
lessonSchema.index({ lesson_type: 1 });              // Поиск по типу урока
lessonSchema.index({ payment_status: 1 });           // Поиск по статусу оплаты
lessonSchema.index({ createdAt: -1 });               // Сортировка по дате создания

// Составные индексы для часто используемых комбинаций
lessonSchema.index({ instructor: 1, scheduled_date: 1 }); // Уроки инструктора по дате
lessonSchema.index({ member: 1, scheduled_date: 1 });     // Уроки участника по дате
lessonSchema.index({ scheduled_date: 1, status: 1 });     // Уроки по дате и статусу

// Виртуальное поле для проверки, прошёл ли урок
lessonSchema.virtual('isPast').get(function () {
  return this.scheduled_date < new Date();
});

// Виртуальное поле для форматирования продолжительности
lessonSchema.virtual('duration_formatted').get(function () {
  return `${this.duration_minutes} минут`;
});

// Middleware для валидации перед сохранением
lessonSchema.pre('save', function (next) {
  // Проверка, что инструктор и участник не один и тот же пользователь
  if (this.instructor && this.member && this.instructor.toString() === this.member.toString()) {
    return next(new Error('Инструктор не может быть участником урока'));
  }

  // Проверка, что дата урока не в прошлом при создании
  if (this.isNew && this.scheduled_date < new Date()) {
    return next(new Error('Дата урока не может быть в прошлом'));
  }

  next();
});

// Метод для проверки конфликтов расписания
lessonSchema.methods.hasScheduleConflict = async function () {
  const conflictingLesson = await this.constructor.findOne({
    _id: { $ne: this._id }, // Исключаем текущий урок
    instructor: this.instructor,
    scheduled_date: {
      $lt: new Date(new Date(this.scheduled_date).getTime() + this.duration_minutes * 60000),
      $gte: this.scheduled_date
    },
    isActive: true
  });

  return !!conflictingLesson;
};

// Статический метод для получения уроков по диапазону дат
lessonSchema.statics.findByDateRange = function (startDate, endDate, instructorId = null) {
  const query = {
    scheduled_date: {
      $gte: startDate,
      $lte: endDate
    },
    isActive: true
  };

  if (instructorId) {
    query.instructor = instructorId;
  }

  return this.find(query).sort({ scheduled_date: 1 });
};

// Статический метод для получения предстоящих уроков
lessonSchema.statics.findUpcoming = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    scheduled_date: {
      $gte: new Date(),
      $lte: futureDate
    },
    status: 'scheduled',
    isActive: true
  }).sort({ scheduled_date: 1 });
};

module.exports = mongoose.model('Lesson', lessonSchema);