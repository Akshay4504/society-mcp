import { Router } from 'express';
import { createPayment, getPayments, getPaymentById, updatePaymentStatus } from '../controllers/payment.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createPaymentSchema, updatePaymentStatusSchema } from '../validators/payment.validator';

const router = Router();

router.use(authMiddleware as any);

router.post('/', requireRole(['SuperAdmin', 'SocietyAdmin', 'ResidentOwner', 'ResidentTenant']) as any, validate({ body: createPaymentSchema }), createPayment as any);
router.get('/', getPayments as any);
router.get('/:id', getPaymentById as any);
router.patch('/:id/status', requireRole(['SuperAdmin', 'SocietyAdmin']) as any, validate({ body: updatePaymentStatusSchema }), updatePaymentStatus as any);

export default router;
