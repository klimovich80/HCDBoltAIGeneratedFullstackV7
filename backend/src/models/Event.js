const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название мероприятия обязательно'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    required: [true, 'Тип мероприятия обязателен'],
    enum: ['competition', 'clinic', 'social', 'maintenance', 'show']
  },
  startDate: {
    type: Date,
    required: [true, 'Дата начала обязательна']
  },
  endDate: {
    type: Date,
    required: [true, 'Дата окончания обязательна']
  },
  location: {
    type: String,
    trim: true
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  registrationFee: {
    type: Number,
    min: 0,
    default: 0
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Организатор обязателен']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  requirements: {
    type: String,
    trim: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    }
  }],
  waitlist: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Индексы
eventSchema.index({ startDate: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);