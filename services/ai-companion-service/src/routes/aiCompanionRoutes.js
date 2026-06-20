const express = require('express');
const router = express.Router();
const c = require('../controllers/aiCompanionController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { chatSchema, explainMedicineSchema, explainLabReportSchema, explainSymptomSchema } = require('../validators/aiCompanionValidators');

router.use(authenticate);
router.post('/chat', validate(chatSchema), c.chat);
router.get('/chat/history', c.getHistory);
router.get('/chat/history/:sessionId', c.getSessionHistory);
router.delete('/chat/history/:sessionId', c.deleteSession);
router.post('/explain/medicine', validate(explainMedicineSchema), c.explainMedicine);
router.post('/explain/lab-report', validate(explainLabReportSchema), c.explainLabReport);
router.post('/explain/symptom', validate(explainSymptomSchema), c.explainSymptom);
router.post('/questions', c.generateQuestions);
router.get('/suggested-questions', c.getSuggestedQuestions);

module.exports = router;
