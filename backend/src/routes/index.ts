import { Router } from 'express';
import authRoutes from './auth.routes';
import complaintRoutes from './complaint.routes';
import residentRoutes from './resident.routes';
import paymentRoutes from './payment.routes';
import billRoutes from './bill.routes';
import noticeRoutes from './notice.routes';
import vendorRoutes from './vendor.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/complaints', complaintRoutes);
apiRouter.use('/residents', residentRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/bills', billRoutes);
apiRouter.use('/notices', noticeRoutes);
apiRouter.use('/vendors', vendorRoutes);

export default apiRouter;
