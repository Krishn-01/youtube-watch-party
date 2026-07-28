import { Router } from 'express';
import { createRoom, getRoom, joinRoom } from '../controllers/roomController.js';
import {
  validateCreateRoom,
  validateJoinRoom,
  validateRoomId,
} from '../validators/roomValidator.js';

const router = Router();

router.post('/', validateCreateRoom, createRoom);
router.get('/:roomId', validateRoomId, getRoom);
router.post('/:roomId/join', validateRoomId, validateJoinRoom, joinRoom);

export default router;
