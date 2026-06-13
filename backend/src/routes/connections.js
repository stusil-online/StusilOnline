const express = require('express');
const { getConnections } = require('../controllers/connections');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, getConnections);

module.exports = router;
