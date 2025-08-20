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
    unique: true,
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
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Индексы
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving (for both create and update operations)
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate salt with cost factor of 12 for strong security
    const salt = await bcrypt.genSalt(12);

    // Hash the password with the generated salt
    this.password = await bcrypt.hash(this.password, salt);

    console.log(`Password hashed for user: ${this.email}`);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Password comparison failed');
  }
};

// Remove password from JSON response for security
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to hash password manually if needed
userSchema.statics.hashPassword = async function (password) {
  try {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

module.exports = mongoose.model('User', userSchema);