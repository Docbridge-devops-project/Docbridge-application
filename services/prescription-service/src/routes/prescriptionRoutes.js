const express = require('express');
const router = express.Router();
const c = require('../controllers/prescriptionController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createPrescriptionSchema, updatePrescriptionSchema, createSideEffectSchema, updateSideEffectSchema } = require('../validators/prescriptionValidators');

router.use(authenticate);
router.get('/active', c.getActive);
router.get('/', c.list);
router.post('/', validate(createPrescriptionSchema), c.create);
router.get('/:id', c.getById);
router.put('/:id', validate(updatePrescriptionSchema), c.update);
router.delete('/:id', c.remove);
router.post('/:id/ai-explain', c.aiExplain);
router.get('/:id/side-effects', c.getSideEffects);
router.post('/:id/side-effects', validate(createSideEffectSchema), c.createSideEffect);
router.put('/:id/side-effects/:sideEffectId', validate(updateSideEffectSchema), c.updateSideEffect);
router.delete('/:id/side-effects/:sideEffectId', c.deleteSideEffect);

module.exports = router;
