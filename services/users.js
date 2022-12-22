const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const { User } = require('../schemas/users');

const registerUser = async ({ email, password }) => { 
  try {
    const user = await User.findOne({ email });

    if (user) return { resp: undefined, err: "Email in use" };

    const avatarURL = gravatar.url(email, { protocol: "http" });
    
    const newUser = new User({ email, password: undefined, avatarURL });

    await newUser.codePassword(password);

    const body = await User.create(newUser);

    return { resp: { user: { email: body.email, subscription: "starter", avatarURL }}, err: false };
  } catch {
    return { resp: undefined, err: true };
  };
};

const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });
    let isValidPassword = false;

    if (user) isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) return { resp: undefined, err: "Email or password is wrong" };
    
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  currentUser,
};