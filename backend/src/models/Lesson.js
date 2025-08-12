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
    required: [true, 'Инструктор обязателен\n']
  },
  horse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Horse'
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Участник обязателен\n']
  },
  scheduled_date: {
    type: Date,
    required: [true, 'Дата урока обязательна']
  },
  duration_minutes: {
    type: Number,
    required: [true, 'Продолжительность обязательна'],
    default: 60,
    min: 15,
    max: 240
  },
  lesson_type: {
    type: String,
    required: [true, 'Тип урока обязателен\n'],
    enum: ['private', 'group', 'training']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  cost: {
    type: Number,
    required: [true, 'Стоимость обязательна'],
    min: 0,
    default: 0
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
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
  timestamps: true
});

// Индексы
lessonSchema.index({ scheduled_date: 1 });
lessonSchema.index({ instructor: 1 });
lessonSchema.index({ member: 1 });
lessonSchema.index({ status: 1 });
lessonSchema.index({ isActive: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);