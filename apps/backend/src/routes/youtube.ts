import { Router } from 'express';
import { youtubeController } from '../controllers/youtubeController';

const router = Router();

router.get('/search', youtubeController.search);
router.get('/trending', youtubeController.trending);
router.get('/categories', youtubeController.categories);
router.get('/play/:youtubeId', youtubeController.getAudioUrl);
router.get('/details/:youtubeId', youtubeController.getDetails);

export default router;