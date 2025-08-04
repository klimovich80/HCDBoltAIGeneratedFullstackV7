const mongoose = require('mongoose');

const horseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Кличка лошади обязательна'],
    trim: true
  },
  breed: {
    type: String,
    required: [true, 'Порода обязательна'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Возраст обязателен'],
    min: 1,
    max: 50
  },
  gender: {
    type: String,
    required: [true, 'Пол обязателен'],
    enum: ['mare', 'stallion', 'gelding']
  },
  color: {
    type: String,
    required: [true, 'Масть обязательна'],
    trim: true
  },
  markings: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  boardingType: {
    type: String,
    required: [true, 'Тип содержания обязателен'],
    enum: ['full', 'partial', 'pasture'],
    default: 'full'
  },
  stallNumber: {
    type: String,
    trim: true
  },
  medicalNotes: {
    type: String,
    trim: true
  },
  dietaryRestrictions: {
    type: String,
    trim: true
  },
  lastVetVisit: {
    type: Date
  },
  nextVetVisit: {
    type: Date
  },
  vaccinationStatus: {
    type: String,
    enum: ['current', 'due', 'overdue'],
    default: 'current'
  },
  insuranceInfo: {
    type: String,
    trim: true
  },
  registrationNumber: {
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
horseSchema.index({ name: 1 });
horseSchema.index({ breed: 1 });
horseSchema.index({ owner: 1 });
horseSchema.index({ stallNumber: 1 });
horseSchema.index({ isActive: 1 });

module.exports = mongoose.model('Horse', horseSchema);