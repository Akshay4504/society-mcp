import { Router } from 'express';
import { createNotice, getNotices, getNoticeById, updateNotice, deleteNotice } from '../controllers/notice.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createNoticeSchema, updateNoticeSchema } from '../validators/notice.validator';

const router = Router();

router.use(authMiddleware as any);

router.post('/', requireRole(['SuperAdmin', 'SocietyAdmin', 'Staff']) as any, validate({ body: createNoticeSchema }), createNotice as any);
router.get('/', getNotices as any);
router.get('/:id', getNoticeById as any);
router.patch('/:id', requireRole(['SuperAdmin', 'SocietyAdmin', 'Staff']) as any, validate({ body: updateNoticeSchema }), updateNotice as any);
router.delete('/:id', requireRole(['SuperAdmin', 'SocietyAdmin', 'Staff']) as any, deleteNotice as any);

export default router;
