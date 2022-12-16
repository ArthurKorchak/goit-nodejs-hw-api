const express = require('express');
const {
  userRegisterController,
  userLoginController,
} = require('../../controllers/users');

const router = express.Router();

router.post('/register', userRegisterController)

router.get('/login', userLoginController)

module.exports = router;
