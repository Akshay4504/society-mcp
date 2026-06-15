import { Router } from 'express';
import { 
  createComplaint, 
  getComplaints, 
  getComplaintById, 
  assignComplaint, 
  updateComplaintStatus 
} from '../controllers/complaint.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createComplaintSchema, assignComplaintSchema, updateComplaintStatusSchema } from '../validators/complaint.validator';

const router = Router();

router.use(authMiddleware as any);

router.post('/', validate({ body: createComplaintSchema }), createComplaint as any);
router.get('/', getComplaints as any);
router.get('/:id', getComplaintById as any);

// Admins only can assign tickets
router.patch('/:id/assign', requireRole(['SuperAdmin', 'SocietyAdmin']) as any, validate({ body: assignComplaintSchema }), assignComplaint as any);

// Assignees, admins, or staff can update status
router.patch('/:id/status', requireRole(['SuperAdmin', 'SocietyAdmin', 'Staff', 'Vendor', 'ResidentOwner', 'ResidentTenant']) as any, validate({ body: updateComplaintStatusSchema }), updateComplaintStatus as any);

export default router;
