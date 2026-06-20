const express = require('express');
const router = express.Router();
const c = require('../controllers/symptomController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createSymptomSchema, updateSymptomSchema } = require('../validators/symptomValidators');

router.use(authenticate);
router.get('/ongoing', c.getOngoing);
router.get('/trends', c.getTrends);
router.get('/', c.list);
router.post('/', validate(createSymptomSchema), c.create);
router.get('/:id', c.getById);
router.put('/:id', validate(updateSymptomSchema), c.update);
router.delete('/:id', c.remove);
router.post('/:id/ai-insight', c.aiInsight);

module.exports = router;
