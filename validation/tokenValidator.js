const jwt = require('jsonwebtoken');
const { User } = require('../schemas/users');

const tokenValidator = async (req, res, next) => {
  const errorTemplate = res.status(401).json({ message: 'Not authorized' });

  if (!req.headers.authorization) return errorTemplate;
    
  const token = req.get("authorization").split(" ")[1];

  if (!token) return errorTemplate;

  try {
    const SECRET = process.env.JWT_SECRET;
    const checkUser = jwt.verify(token, SECRET);

    if (!checkUser) return errorTemplate;

    const user = await User.findById(checkUser._id);

    if (!user || !(token === user.token)) return errorTemplate;

    req.token = token;
    req.user = user;

    next();
  } catch (err) {
    next(err);
  };
};

module.exports = { tokenValidator };