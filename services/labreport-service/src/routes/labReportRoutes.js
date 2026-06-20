const express = require('express');
const router = express.Router();
const c = require('../controllers/labReportController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createLabReportSchema, updateLabReportSchema } = require('../validators/labReportValidators');

router.use(authenticate);
router.get('/flagged', c.getFlagged);
router.get('/trends/:testName', c.getTrends);
router.get('/', c.list);
router.post('/', validate(createLabReportSchema), c.create);
router.get('/:id', c.getById);
router.put('/:id', validate(updateLabReportSchema), c.update);
router.delete('/:id', c.remove);
router.post('/:id/ai-explain', c.aiExplain);

module.exports = router;
