import { Router } from 'express';
import { createBill, getBills, getBillById } from '../controllers/bill.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createBillSchema } from '../validators/bill.validator';

const router = Router();

router.use(authMiddleware as any);

router.post('/', requireRole(['SuperAdmin', 'SocietyAdmin']) as any, validate({ body: createBillSchema }), createBill as any);
router.get('/', getBills as any);
router.get('/:id', getBillById as any);

export default router;
