const express = require('express');
const router = express.Router();
const c = require('../controllers/reminderController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createMedicineReminderSchema, updateMedicineReminderSchema, createFollowupReminderSchema, updateFollowupReminderSchema } = require('../validators/reminderValidators');

router.use(authenticate);
router.get('/upcoming', c.getUpcoming);
router.get('/medicine', c.listMedicine);
router.post('/medicine', validate(createMedicineReminderSchema), c.createMedicine);
router.get('/medicine/:id', c.getMedicine);
router.put('/medicine/:id', validate(updateMedicineReminderSchema), c.updateMedicine);
router.delete('/medicine/:id', c.deleteMedicine);
router.get('/followup', c.listFollowup);
router.post('/followup', validate(createFollowupReminderSchema), c.createFollowup);
router.get('/followup/:id', c.getFollowup);
router.put('/followup/:id', validate(updateFollowupReminderSchema), c.updateFollowup);
router.delete('/followup/:id', c.deleteFollowup);
router.put('/followup/:id/complete', c.completeFollowup);

module.exports = router;
