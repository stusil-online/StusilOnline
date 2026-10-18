const express = require('express');
const { getOpenOpportunities } = require('../controllers/opportunities');

const router = express.Router();

router.get('/', getOpenOpportunities);

module.exports = router;