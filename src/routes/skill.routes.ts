import express from 'express';
import SkillController from '../controllers/skill.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { skillSchema, updateSkillSchema, skillIdSchema } from '../validations/skill/schemas';
import { isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', SkillController.getAll);
router.get('/:id', validateRequest({ params: skillIdSchema }), SkillController.getOne);

// Admin only routes
router.post('/', isAdmin, validateRequest({ body: skillSchema }), SkillController.create);
router.put(
  '/:id',
  isAdmin,
  validateRequest({
    params: skillIdSchema,
    body: updateSkillSchema,
  }),
  SkillController.update
);
router.delete('/:id', isAdmin, validateRequest({ params: skillIdSchema }), SkillController.delete);

export default router;
