import { Router } from 'express';
import { createVendor, getVendors, getVendorById, updateVendor, deleteVendor, addVendorRating } from '../controllers/vendor.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createVendorSchema, updateVendorSchema, addRatingSchema } from '../validators/vendor.validator';

const router = Router();

router.use(authMiddleware as any);

router.post('/', requireRole(['SuperAdmin', 'SocietyAdmin']) as any, validate({ body: createVendorSchema }), createVendor as any);
router.get('/', getVendors as any);
router.get('/:id', getVendorById as any);
router.patch('/:id', requireRole(['SuperAdmin', 'SocietyAdmin']) as any, validate({ body: updateVendorSchema }), updateVendor as any);
router.delete('/:id', requireRole(['SuperAdmin', 'SocietyAdmin']) as any, deleteVendor as any);
router.post('/:id/ratings', validate({ body: addRatingSchema }), addVendorRating as any);

export default router;
