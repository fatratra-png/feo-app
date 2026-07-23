import { Router } from 'express';
import { libraryController } from '../controllers/libraryController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, libraryController.getLibrary);
router.get('/home', authenticate, libraryController.getHome);

export default router;