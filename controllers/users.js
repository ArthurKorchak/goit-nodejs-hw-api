const { userCredentialsValidation } = require('../validation/validations');
const {
  registerUser,
  loginUser,
} = require('../services/users');


const userRegisterController = async ({ body }, res) => {
  const { error } = userCredentialsValidation(body);

  if (error) {
    res.status(400).json({ message: 'Invalid data' });
  } else {
    const contact = await registerUser(body);

    if (!contact.err) {
      res.status(201).json(contact.resp);
    } else {
      contact.err === "Email in use"
        ? res.status(409).json({ message: "Email in use" })
        : res.status(400).json({ message: "Unexpected user creating error" });
    };
  };
};

const userLoginController = async ({ body }, res) => {
  const { error } = userCredentialsValidation(body);

  if (error) {
    res.status(400).json({ message: 'Invalid data' });
  } else {
    const contact = await loginUser(body);
    
    if (!contact.err) {
      res.status(200).json(contact.resp);
    } else {
      contact.err === "Email or password is wrong"
        ? res.status(401).json({ message: "Email or password is wrong" })
        : res.status(400).json({ message: "Unexpected user login error" });
    };
  };
};

module.exports = {
  userRegisterController,
  userLoginController,
};