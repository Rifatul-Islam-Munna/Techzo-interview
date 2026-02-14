import { Router } from 'express';
import * as userController from '@/controllers/user.controller';

const router = Router();

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.post('/login', userController.login);
router.post('/get-my-profile', userController.getMyProfile);

export default router;
