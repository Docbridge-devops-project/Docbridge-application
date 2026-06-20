const express = require('express');
const router = express.Router();
const c = require('../controllers/familyController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createFamilyMemberSchema, updateFamilyMemberSchema } = require('../validators/familyValidators');

router.use(authenticate);
router.get('/', c.list);
router.post('/', validate(createFamilyMemberSchema), c.create);
router.get('/:id', c.getById);
router.put('/:id', validate(updateFamilyMemberSchema), c.update);
router.delete('/:id', c.remove);

module.exports = router;
