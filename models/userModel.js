const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// name , email , photo , password , passwordConfirm , passwordChangedAt , role
let userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'please tell us your name'] },
  email: {
    type: String,
    required: [true, 'please tell us your email'],
    unique: [true, 'email must be unique'],
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      // this function will only works when we create a new object or on save
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// instance method that will be available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword, // password that user provide to login
  userPassword // password in the database
) {
  return await bcrypt.compare(candidatePassword, userPassword); // return true or false by comparing the two passwords
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //JWTTimestamp is the time when the token was issued in seconds come from authController
  if (this.passwordChangedAt) {
    let changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); // convert to seconds and base 10 and integer value getTime() returns milliseconds
    return changedTimestamp > JWTTimestamp; // true means password changed after token issued so token is invalid and redirect to login and if they are equal or changedTimestamp < JWTTimestamp then return false means not changed
  }
  // If passwordChangedAt is not set, it means password was not changed
  return false;
};

// instance method to create a reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // crypto is a built-in module in nodejs
  // we will send this resetToken to the user via email and store the encrypted version of it in the database
  // so that if someone gets access to our database he will not be able to see the reset token
  // randomBytes generates a buffer so we convert it to hex string
  // now we need to encrypt this token before saving it to the database for security reasons
  // because if someone gets access to our database he will be able to see the reset token and use it to reset the password
  this.passwordResetToken = crypto
    .createHash('sha256') // create a sha256 hash is a one-way encryption algorithm so we cannot decrypt it
    .update(resetToken) // update the hash with the resetToken to be encrypted so we can compare it later
    .digest('hex'); // encrypt the token before saving it to the database for security reasons
  return resetToken; // this resetToken will be sent to the user via email so he can use it to reset the password then we will encrypt it and compare it with the encrypted version in the database
};

let User = mongoose.model('User', userSchema);

module.exports = User;
