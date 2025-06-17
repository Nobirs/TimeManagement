import {Router} from 'express';
import { syncEvents } from '../controllers/events';

const router = Router();
router.post('/', syncEvents);
export default router;