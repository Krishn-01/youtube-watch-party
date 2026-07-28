import Room from '../../models/Room.js';
import {
  ROLES,
  canControlPlayback,
  canManageRoles,
  canChangeVideo,
} from '../../constants/roles.js';

const formatParticipants = (participants) =>
  participants.map(({ odId, name, role, joinedAt }) => ({
    odId,
    name,
    role,
    joinedAt,
  }));

const getParticipantFromSocket = async (socket) => {
  const { roomId, odId } = socket.data;

  if (!roomId || !odId) return { room: null, participant: null };

  const room = await Room.findOne({ roomId, isActive: true });
  if (!room) return { room: null, participant: null };

  const participant = room.findParticipant(odId);
  return { room, participant };
};

const requirePermission = (checkFn) => async (socket, callback) => {
  const { room, participant } = await getParticipantFromSocket(socket);

  if (!room || !participant) {
    callback?.({ success: false, message: 'Not in a room' });
    return null;
  }

  if (!checkFn(participant.role)) {
    callback?.({
      success: false,
      message: 'Insufficient permissions for this action',
    });
    return null;
  }

  return { room, participant };
};

const broadcastSyncState = (io, roomId, payload, excludeSocketId) => {
  const emitter = excludeSocketId
    ? io.to(roomId).except(excludeSocketId)
    : io.to(roomId);

  emitter.emit('sync_state', payload);
};

export const registerRoomHandlers = (io, socket) => {
  socket.on('join_room', async ({ roomId, odId }, callback) => {
    try {
      const room = await Room.findOne({
        roomId: roomId?.toUpperCase(),
        isActive: true,
      });

      if (!room) {
        return callback?.({ success: false, message: 'Room not found' });
      }

      const participant = room.findParticipant(odId);
      if (!participant) {
        return callback?.({ success: false, message: 'Participant not found' });
      }

      participant.socketId = socket.id;
      await room.save();

      socket.data.roomId = room.roomId;
      socket.data.odId = odId;
      socket.join(room.roomId);

      const participants = formatParticipants(room.participants);
      const playback = room.getPlaybackState();

      callback?.({
        success: true,
        data: {
          roomId: room.roomId,
          name: room.name,
          role: participant.role,
          hostOdId: room.hostOdId,
          participants,
          playback,
        },
      });

      socket.to(room.roomId).emit('user_joined', {
        participant: {
          odId: participant.odId,
          name: participant.name,
          role: participant.role,
          joinedAt: participant.joinedAt,
        },
        participants,
      });

      socket.emit('sync_state', {
        action: 'sync',
        ...playback,
      });
    } catch (error) {
      console.error('join_room error:', error);
      callback?.({ success: false, message: 'Failed to join room' });
    }
  });

  socket.on('leave_room', async (_payload, callback) => {
    try {
      const { room, participant } = await getParticipantFromSocket(socket);

      if (!room || !participant) {
        return callback?.({ success: true });
      }

      participant.socketId = null;
      await room.save();

      const participants = formatParticipants(room.participants);

      socket.leave(room.roomId);
      socket.data.roomId = null;
      socket.data.odId = null;

      socket.to(room.roomId).emit('user_left', {
        odId: participant.odId,
        name: participant.name,
        participants,
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('leave_room error:', error);
      callback?.({ success: false, message: 'Failed to leave room' });
    }
  });

  socket.on('play', async (payload, callback) => {
    try {
      const result = await requirePermission(canControlPlayback)(socket, callback);
      if (!result) return;

      const { room, participant } = result;
      const currentTime = payload?.currentTime ?? room.currentTime;

      room.isPlaying = true;
      room.currentTime = currentTime;
      room.lastUpdatedAt = new Date();
      await room.save();

      broadcastSyncState(io, room.roomId, {
        action: 'play',
        videoId: room.videoId,
        isPlaying: true,
        currentTime,
        triggeredBy: participant.name,
      }, socket.id);

      callback?.({ success: true });
    } catch (error) {
      console.error('play error:', error);
      callback?.({ success: false, message: 'Failed to sync play' });
    }
  });

  socket.on('pause', async (payload, callback) => {
    try {
      const result = await requirePermission(canControlPlayback)(socket, callback);
      if (!result) return;

      const { room, participant } = result;
      const currentTime = payload?.currentTime ?? room.currentTime;

      room.isPlaying = false;
      room.currentTime = currentTime;
      room.lastUpdatedAt = new Date();
      await room.save();

      broadcastSyncState(io, room.roomId, {
        action: 'pause',
        videoId: room.videoId,
        isPlaying: false,
        currentTime,
        triggeredBy: participant.name,
      }, socket.id);

      callback?.({ success: true });
    } catch (error) {
      console.error('pause error:', error);
      callback?.({ success: false, message: 'Failed to sync pause' });
    }
  });

  socket.on('seek', async (payload, callback) => {
    try {
      const result = await requirePermission(canControlPlayback)(socket, callback);
      if (!result) return;

      const { room, participant } = result;
      const currentTime = payload?.currentTime ?? 0;

      room.currentTime = currentTime;
      room.lastUpdatedAt = new Date();
      await room.save();

      broadcastSyncState(io, room.roomId, {
        action: 'seek',
        videoId: room.videoId,
        isPlaying: room.isPlaying,
        currentTime,
        triggeredBy: participant.name,
      }, socket.id);

      callback?.({ success: true });
    } catch (error) {
      console.error('seek error:', error);
      callback?.({ success: false, message: 'Failed to sync seek' });
    }
  });

  socket.on('change_video', async (payload, callback) => {
    try {
      const result = await requirePermission(canChangeVideo)(socket, callback);
      if (!result) return;

      const { room, participant } = result;
      const videoId = payload?.videoId?.trim();

      if (!videoId) {
        return callback?.({ success: false, message: 'Video ID is required' });
      }

      room.videoId = videoId;
      room.isPlaying = false;
      room.currentTime = 0;
      room.lastUpdatedAt = new Date();
      await room.save();

      io.to(room.roomId).emit('sync_state', {
        action: 'change_video',
        videoId,
        isPlaying: false,
        currentTime: 0,
        triggeredBy: participant.name,
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('change_video error:', error);
      callback?.({ success: false, message: 'Failed to change video' });
    }
  });

  socket.on('assign_role', async ({ targetOdId, role }, callback) => {
    try {
      const result = await requirePermission(canManageRoles)(socket, callback);
      if (!result) return;

      const { room, participant: host } = result;

      if (![ROLES.MODERATOR, ROLES.PARTICIPANT].includes(role)) {
        return callback?.({ success: false, message: 'Invalid role' });
      }

      const target = room.findParticipant(targetOdId);
      if (!target) {
        return callback?.({ success: false, message: 'Participant not found' });
      }

      if (target.odId === host.odId) {
        return callback?.({ success: false, message: 'Cannot change your own role' });
      }

      target.role = role;
      await room.save();

      const participants = formatParticipants(room.participants);

      io.to(room.roomId).emit('role_assigned', {
        odId: target.odId,
        role,
        participants,
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('assign_role error:', error);
      callback?.({ success: false, message: 'Failed to update role' });
    }
  });

  socket.on('remove_participant', async ({ targetOdId }, callback) => {
    try {
      const result = await requirePermission(canManageRoles)(socket, callback);
      if (!result) return;

      const { room, participant: host } = result;

      const target = room.findParticipant(targetOdId);
      if (!target) {
        return callback?.({ success: false, message: 'Participant not found' });
      }

      if (target.odId === host.odId) {
        return callback?.({ success: false, message: 'Cannot remove yourself' });
      }

      if (target.odId === room.hostOdId) {
        return callback?.({ success: false, message: 'Cannot remove the host' });
      }

      const targetSocketId = target.socketId;
      room.participants = room.participants.filter((p) => p.odId !== targetOdId);
      await room.save();

      const participants = formatParticipants(room.participants);

      io.to(room.roomId).emit('participant_removed', {
        odId: targetOdId,
        name: target.name,
        participants,
      });

      if (targetSocketId) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit('participant_removed', {
            odId: targetOdId,
            removed: true,
            message: 'You were removed from the room',
            participants,
          });
          targetSocket.leave(room.roomId);
          targetSocket.data.roomId = null;
          targetSocket.data.odId = null;
        }
      }

      callback?.({ success: true });
    } catch (error) {
      console.error('remove_participant error:', error);
      callback?.({ success: false, message: 'Failed to remove participant' });
    }
  });

  socket.on('transfer_host', async ({ targetOdId }, callback) => {
    try {
      const result = await requirePermission(canManageRoles)(socket, callback);
      if (!result) return;

      const { room, participant: currentHost } = result;

      const target = room.findParticipant(targetOdId);
      if (!target) {
        return callback?.({ success: false, message: 'Participant not found' });
      }

      if (target.odId === currentHost.odId) {
        return callback?.({ success: false, message: 'Already the host' });
      }

      currentHost.role = ROLES.PARTICIPANT;
      target.role = ROLES.HOST;
      room.hostOdId = target.odId;

      await room.save();

      const participants = formatParticipants(room.participants);

      io.to(room.roomId).emit('role_assigned', {
        odId: target.odId,
        role: ROLES.HOST,
        previousHostOdId: currentHost.odId,
        hostOdId: room.hostOdId,
        participants,
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('transfer_host error:', error);
      callback?.({ success: false, message: 'Failed to transfer host' });
    }
  });

  socket.on('disconnect', async () => {
    try {
      const { room, participant } = await getParticipantFromSocket(socket);

      if (!room || !participant) return;

      participant.socketId = null;
      await room.save();

      socket.to(room.roomId).emit('user_left', {
        odId: participant.odId,
        name: participant.name,
        participants: formatParticipants(room.participants),
      });
    } catch (error) {
      console.error('disconnect error:', error);
    }
  });
};
