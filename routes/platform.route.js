const express = require('express');
const platformController = require('../controller/platform.controller');
const router = express.Router();

router.post('/register', platformController.register);
router.post('/signIn', platformController.signIn);

module.exports = router;