import { nanoid } from 'nanoid';
import Room from '../models/Room.js';
import { ROLES } from '../constants/roles.js';

const generateRoomId = () => nanoid(8).toUpperCase();
const generateOdId = () => nanoid(12);

export const createRoom = async (req, res, next) => {
  try {
    const { name, username } = req.body;

    const odId = generateOdId();
    let roomId = generateRoomId();

    let existing = await Room.findOne({ roomId });
    while (existing) {
      roomId = generateRoomId();
      existing = await Room.findOne({ roomId });
    }

    const room = await Room.create({
      roomId,
      name: name.trim(),
      hostOdId: odId,
      participants: [
        {
          odId,
          name: username.trim(),
          role: ROLES.HOST,
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: {
        roomId: room.roomId,
        name: room.name,
        odId,
        role: ROLES.HOST,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      roomId: roomId.toUpperCase(),
      isActive: true,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.json({
      success: true,
      data: {
        roomId: room.roomId,
        name: room.name,
        participantCount: room.participants.length,
        videoId: room.videoId,
        playback: room.getPlaybackState(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { username } = req.body;

    const room = await Room.findOne({
      roomId: roomId.toUpperCase(),
      isActive: true,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const odId = generateOdId();

    room.participants.push({
      odId,
      name: username.trim(),
      role: ROLES.PARTICIPANT,
    });

    await room.save();

    res.json({
      success: true,
      data: {
        roomId: room.roomId,
        name: room.name,
        odId,
        role: ROLES.PARTICIPANT,
        playback: room.getPlaybackState(),
      },
    });
  } catch (error) {
    next(error);
  }
};
