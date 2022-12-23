const express = require('express');
const multer = require('multer');
const { tokenValidator } = require('../../validation/tokenValidator');
const {
  userRegisterController,
  userLoginController,
  userLogoutController,
  userCurrentController,
  userAvatarUpdateController,
} = require('../../controllers/users');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, 'tmp/');
  },
  filename: function (_, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/register', userRegisterController);

router.get('/login', userLoginController);

router.use(tokenValidator);

router.post('/logout', userLogoutController);

router.get('/current', userCurrentController);

router.patch('/avatars', upload.single('image'), userAvatarUpdateController)

module.exports = router;
