import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upNext, skip, aiSuggestions } from '../controllers/recommendationController';

const router = Router();

router.get('/up-next', authenticate, upNext);
router.post('/skip', authenticate, skip);
router.get('/suggestions', authenticate, aiSuggestions);

export default router;
