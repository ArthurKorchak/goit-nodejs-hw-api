const { userCredentialsValidation } = require('../validation/validations');
const {
  registerUser,
  verificationUser,
  loginUser,
  logoutUser,
  currentUser,
  userAvatarUpdate,
} = require('../services/users');


const userRegisterController = async ({ body }, res) => {
  const { error } = userCredentialsValidation(body);

  if (error) {
    res.status(400).json({ message: 'Invalid data' });
  } else {
    const user = await registerUser(body);

    if (!user.err) {
      res.status(201).json(user.resp);
    } else {
      user.err === "Email in use"
        ? res.status(409).json({ message: "Email in use" })
        : res.status(400).json({ message: "Unexpected user creating error" });
    };
  };
};

const userVerificationController = async ({ params }, res) => {

  const { verificationToken } = params;
  
  const verify = await verificationUser(verificationToken);
  
  verify.err
    ? res.status(404).json({ message: "User not found" })
    : res.status(200).json({ message: "Verification successful" }); 
};

const userLoginController = async ({ body }, res) => {
  const { error } = userCredentialsValidation(body);

  if (error) {
    res.status(400).json({ message: 'Invalid data' });
  } else {
    const user = await loginUser(body);
    
    if (!user.err) {
      res.status(200).json(user.resp);
    } else {
      user.err === "Email or password is wrong"
        ? res.status(401).json({ message: "Email or password is wrong" })
        : res.status(400).json({ message: "Unexpected user login error" });
    };
  };
};

const userLogoutController = async ({ user }, res) => {
  const logoutRes = await logoutUser(user._id);

  if (!logoutRes.err) {
    res.status(204).json();
  } else {
    logoutRes.err === "Not authorized"
      ? res.status(401).json({ message: "Not authorized" })
      : res.status(400).json({ message: "Unexpected user logout error" });
  };
};

const userCurrentController = async ({ user }, res) => {
  const userData = await currentUser(user._id);

  userData
    ? res.status(200).json({ email: userData.email, subscription: userData.subscription, avatarURL: userData.avatarURL })
    : res.status(401).json({ message: "Not authorized" });
};

const userAvatarUpdateController = async ({ user, file }, res) => {
  const avatarURL = await userAvatarUpdate(user.email, file);

  avatarURL
    ? res.status(200).json({ avatarURL })
    : res.status(401).json({ message: "Not authorized" });
};

module.exports = {
  userRegisterController,
  userVerificationController,
  userLoginController,
  userLogoutController,
  userCurrentController,
  userAvatarUpdateController,
};