import { Router } from 'express';
import { register, login, refresh, logout, getProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate({ body: registerSchema }), register as any);
router.post('/login', validate({ body: loginSchema }), login as any);
router.post('/refresh', validate({ body: refreshSchema }), refresh as any);
router.post('/logout', validate({ body: refreshSchema }), logout as any);
router.get('/profile', authMiddleware as any, getProfile as any);

export default router;
