const express = require('express');
const { getTrending, getLeaderboard, getStats } = require('../controllers/community');
const router = express.Router();

router.get('/trending', getTrending);
router.get('/leaderboard', getLeaderboard);
router.get('/stats', getStats);

module.exports = router;
