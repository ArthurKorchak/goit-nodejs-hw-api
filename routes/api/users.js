const express = require('express');
const {
  userRegisterController,
  userLoginController,
} = require('../../controllers/users');
const { tokenValidator } = require('../../validation/tokenValidator');

const router = express.Router();

router.post('/register', userRegisterController);

router.get('/login', userLoginController);

router.use(tokenValidator);

module.exports = router;
