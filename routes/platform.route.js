const express = require('express');
const platformController = require('../controller/platform.controller');
const router = express.Router();

router.post('/register', platformController.register);

module.exports = router;