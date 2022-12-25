const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, 'Set password for user'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
  token: String,
  avatarURL: String,
});

userSchema.methods.codePassword = async function (password) {
  this.password = await bcrypt.hash(
      password,
      parseInt(process.env.PASSWORD_SALT)
  );
};

userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.checkVerify = async function (password) {
  return this.verify;
};

const User = model('users', userSchema);

module.exports = { User };
