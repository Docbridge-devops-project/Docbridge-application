const express = require('express');
const router = express.Router();
const c = require('../controllers/consultationController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createConsultationSchema, updateConsultationSchema } = require('../validators/consultationValidators');

router.use(authenticate);

router.get('/stats/summary', c.getStats);
router.get('/', c.list);
router.post('/', validate(createConsultationSchema), c.create);
router.get('/:id', c.getById);
router.put('/:id', validate(updateConsultationSchema), c.update);
router.delete('/:id', c.remove);
router.post('/:id/ai-explain', c.aiExplain);

module.exports = router;
