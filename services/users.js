const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const { rename } = require('fs/promises');
const { join } = require('path');
const sgMail = require('@sendgrid/mail');

const { User } = require('../schemas/users');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const registerUser = async ({ email, password }) => { 
  try {
    const user = await User.findOne({ email });

    if (user) return { resp: undefined, err: "Email in use" };

    const avatarURL = gravatar.url(email, { protocol: "http" });

    const verificationToken = uuidv4();
    
    const newUser = new User({ email, password: undefined, avatarURL, verificationToken });

    await newUser.codePassword(password);

    const msg = {
      to: email,
      from: process.env.OUR_SERVICE_MAIL,
      subject: 'Some service verification',
      text: `Please, verify your account. Let's go this path: http://localhost:${process.env.PORT}/api/users/verify/${verificationToken}`,
    };

    await sgMail.send(msg);

    const body = await User.create(newUser);

    return { resp: { user: { email: body.email, subscription: "starter", avatarURL }}, err: false };
  } catch {
    return { resp: undefined, err: true };
  };
};

const verificationUser = async (verificationToken) => { 
  try {
    const user = await User.findOne({ verificationToken });

    if (!user) return { err: true };
    
    await User.findOneAndUpdate({ email: user.email }, { verificationToken: null, verify: true });

    return { err: false };
  } catch {
    return { err: true };
  };
};

const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });
    let isValidPassword = false;
    let isUserVerify = false;

    if (user) {
      isValidPassword = await user.checkPassword(password);
      isUserVerify = await user.checkVerify();
    };
    if (!isValidPassword) return { resp: undefined, err: "Email or password is wrong" };
    if (!isUserVerify) return { resp: undefined, err: true };
    
    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    await User.findOneAndUpdate({ email }, { token: jwtToken });

    return {
      resp: {
        token: jwtToken,
        user: {
          email: user.email,
          subscription: user.subscription
        },
        avatarURL: user.avatarURL
      },
      err: false
    };
  } catch {
    return { resp: undefined, err: true };
  };
};

const logoutUser = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) return { err: "Not authorized" };
    
    await User.findByIdAndUpdate(userId, { token: null });

    return { err: false };
  } catch {
    return { err: true };
  };
};

const currentUser = async (userId) => {
  try {
    return await User.findById(userId);
  } catch {
    return false;
  };
};

const userAvatarUpdate = async (email, file) => {
  try {
    const image = await jimp.read(file.path);
    const newName = `${email + '-' + file.originalname}`;
    const newPath = join(__dirname, '../public/avatars', newName);
    const avatarURL = `http://localhost:${process.env.PORT}/api/avatars/${newName}`;

    image.resize(250, 250);
    image.write(file.path);

    await rename(file.path, newPath);

    await User.findOneAndUpdate({ email }, { avatarURL });

    return avatarURL;
  } catch {
    return false;
  };
};

module.exports = {
  registerUser,
  verificationUser,
  loginUser,
  logoutUser,
  currentUser,
  userAvatarUpdate,
};