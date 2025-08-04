const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Участник обязателен']
  },
  amount: {
    type: Number,
    required: [true, 'Сумма обязательна'],
    min: 0
  },
  paymentType: {
    type: String,
    required: [true, 'Тип платежа обязателен'],
    enum: ['lesson', 'boarding', 'event', 'membership', 'equipment', 'other']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Способ оплаты обязателен'],
    enum: ['cash', 'card', 'transfer', 'check']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Срок оплаты обязателен']
  },
  paidDate: {
    type: Date
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    trim: true
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Lesson', 'Event', 'Equipment']
  }
}, {
  timestamps: true
});

// Индексы
paymentSchema.index({ member: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });

// Генерируем номер счета перед сохранением
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);