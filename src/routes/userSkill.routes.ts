import express from 'express';
import UserSkillController from '../controllers/userSkill.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { userSkillSchema, updateUserSkillSchema, idParamSchema } from '../validations/userSkill/schemas';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', UserSkillController.getUserSkills);

router.post('/', validateRequest({ body: userSkillSchema }), UserSkillController.addSkill);

router.put(
  '/:id',
  validateRequest({
    params: idParamSchema,
    body: updateUserSkillSchema,
  }),
  UserSkillController.updateSkill
);

router.delete('/:id', validateRequest({ params: idParamSchema }), UserSkillController.removeSkill);

export default router;
