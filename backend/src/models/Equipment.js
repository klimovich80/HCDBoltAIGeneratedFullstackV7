const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название снаряжения обязательно'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Категория обязательна'],
    enum: ['saddle', 'bridle', 'halter', 'blanket', 'boot', 'grooming', 'other']
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  purchaseDate: {
    type: Date
  },
  cost: {
    type: Number,
    min: 0
  },
  currentValue: {
    type: Number,
    min: 0
  },
  assignedHorse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Horse'
  },
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  maintenanceNotes: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
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
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ assignedHorse: 1 });
equipmentSchema.index({ condition: 1 });
equipmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);