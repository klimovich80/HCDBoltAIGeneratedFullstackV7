const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Пользователь обязателен для заполнения']
  },
  amount: {
    type: Number,
    required: [true, 'Сумма платежа обязательна для заполнения'],
    min: [0, 'Сумма платежа не может быть отрицательной']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Описание не может превышать 500 символов']
  },
  invoiceNumber: {
    type: String,
    unique: true,
    required: [true, 'Номер счета обязателен для заполнения'],
    match: [/^INV-\d+-[A-Z0-9]+$/, 'Неверный формат номера счета']
  },
  payment_date: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value <= new Date();
      },
      message: 'Дата платежа не может быть в будущем'
    }
  },
  due_date: {
    type: Date,
    required: [true, 'Срок оплаты обязателен для заполнения'],
    validate: {
      validator: function (value) {
        return value > new Date();
      },
      message: 'Срок оплаты должен быть в будущем'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'overdue', 'cancelled'],
      message: 'Неверный статус платежа'
    },
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: {
      values: ['cash', 'card', 'bank_transfer', 'online'],
      message: 'Неверный метод оплаты'
    },
    default: 'cash'
  },
  reference_number: {
    type: String,
    trim: true,
    maxlength: [100, 'Референсный номер не может превышать 100 символов']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware для автоматической проверки просроченных платежей
paymentSchema.pre('save', function (next) {
  if (this.due_date && this.due_date < new Date() && this.status === 'pending') {
    this.status = 'overdue';
  }
  next();
});

// Статический метод для поиска просроченных платежей
paymentSchema.statics.findOverduePayments = function () {
  return this.find({
    due_date: { $lt: new Date() },
    status: 'pending',
    isActive: true
  });
};

module.exports = mongoose.model('Payment', paymentSchema);