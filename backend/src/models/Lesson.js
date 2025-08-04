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
  scheduledDate: {
    type: Date,
    required: [true, 'Дата урока обязательна']
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Продолжительность обязательна'],
    default: 60,
    min: 15,
    max: 240
  },
  lessonType: {
    type: String,
    required: [true, 'Тип урока обязателен'],
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
  paymentStatus: {
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
lessonSchema.index({ scheduledDate: 1 });
lessonSchema.index({ instructor: 1 });
lessonSchema.index({ member: 1 });
lessonSchema.index({ status: 1 });
lessonSchema.index({ isActive: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);