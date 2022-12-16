const jwt = require('jsonwebtoken');
const { User } = require('../schemas/users');

const registerUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (user) return { resp: undefined, err: "Email in use" };
  
  try {
    const newUser = new User({ email, password: undefined });

    await newUser.codePassword(password);

    const body = await User.create(newUser);

    return { resp: { user: { email: body.email, subscription: "starter" }}, err: false };
  } catch {
    return { resp: undefined, err: true };
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  let isValidPassword = false;

  if (user) isValidPassword = await user.checkPassword(password);
  if (!isValidPassword) return { resp: undefined, err: "Email or password is wrong" };

  try {
    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    await User.findOneAndUpdate({ email }, { token: jwtToken }, { new: true });

    return {
      resp: {
        token: jwtToken,
        user: {
          email: user.email,
          subscription: user.subscription
        }
      },
      err: false
    };
  } catch {
    return { resp: undefined, err: true };
  };
};

module.exports = {
  registerUser,
  loginUser,
};