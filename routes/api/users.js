const express = require('express');
const { tokenValidator } = require('../../validation/tokenValidator');
const {
  userRegisterController,
  userLoginController,
  userLogoutController,
  userCurrentController,
} = require('../../controllers/users');

const router = express.Router();

router.post('/register', userRegisterController);

router.get('/login', userLoginController);

router.use(tokenValidator);

router.post('/logout', userLogoutController)

router.get('/current', userCurrentController)

module.exports = router;
