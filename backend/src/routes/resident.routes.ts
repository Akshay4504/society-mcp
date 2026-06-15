import { Router } from 'express';
import { createResident, getResidents, getResidentById, updateResident, deleteResident } from '../controllers/resident.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createResidentSchema, updateResidentSchema } from '../validators/resident.validator';

const router = Router();

router.use(authMiddleware as any);

router.post('/', requireRole(['SuperAdmin', 'SocietyAdmin']) as any, validate({ body: createResidentSchema }), createResident as any);
router.get('/', getResidents as any);
router.get('/:id', getResidentById as any);
router.patch('/:id', validate({ body: updateResidentSchema }), updateResident as any);
router.delete('/:id', requireRole(['SuperAdmin', 'SocietyAdmin']) as any, deleteResident as any);

export default router;
