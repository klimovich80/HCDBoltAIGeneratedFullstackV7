const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    //unique: true, //TODO
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'trainer', 'member'],
    default: 'member'
  },
  phone: {
    type: String,
    trim: true
  },
  emergency_contact: {
    name: String,
    phone: String,
    relationship: String
  },
  membership_tier: {
    type: String,
    enum: ['basic', 'premium', 'elite'],
    default: 'basic'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Индексы
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Хешируем пароль перед сохранением
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  bcrypt.genSalt(10)
    .then(salt => bcrypt.hash(this.password, salt))
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => next(error));
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Удаляем пароль из JSON ответа
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);