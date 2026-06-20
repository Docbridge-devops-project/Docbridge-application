const express = require('express');
const router = express.Router();
const c = require('../controllers/healthSummaryController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);
router.get('/dashboard', c.getDashboard);
router.get('/timeline', c.getTimeline);

module.exports = router;
