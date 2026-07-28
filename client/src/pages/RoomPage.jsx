import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import RoomHeader from '../components/room/RoomHeader';
import VideoPlayer from '../components/room/VideoPlayer';
import VideoControls from '../components/room/VideoControls';
import ParticipantList from '../components/room/ParticipantList';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import { getStoredOdId, clearStoredOdId } from '../utils/helpers';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [roomState, setRoomState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const syncListenersRef = useRef([]);

  const odId = getStoredOdId(roomId?.toUpperCase());

  const updateParticipants = useCallback((participants) => {
    setRoomState((prev) => {
      if (!prev) return prev;
      const self = participants.find((p) => p.odId === odId);
      return {
        ...prev,
        participants,
        role: self?.role ?? prev.role,
        hostOdId: participants.find((p) => p.role === 'host')?.odId ?? prev.hostOdId,
      };
    });
  }, [odId]);

  const emitWithCallback = useCallback(
    (event, payload) =>
      new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error('Not connected'));
          return;
        }

        socket.emit(event, payload, (response) => {
          if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.message || 'Action failed'));
          }
        });
      }),
    [socket]
  );

  useEffect(() => {
    if (!socket || !isConnected || !roomId || !odId) {
      if (!odId && roomId) {
        setError('Session expired. Please join the room again.');
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError('');

    socket.emit(
      'join_room',
      { roomId: roomId.toUpperCase(), odId },
      (response) => {
        if (response?.success) {
          setRoomState(response.data);
          setLoading(false);
        } else {
          setError(response?.message || 'Failed to join room');
          setLoading(false);
        }
      }
    );

    const handleSyncState = (data) => {
      syncListenersRef.current.forEach((listener) => listener(data));

      if (data.action === 'change_video') {
        setRoomState((prev) => ({
          ...prev,
          playback: {
            ...prev?.playback,
            videoId: data.videoId,
            isPlaying: false,
            currentTime: 0,
          },
        }));
      }
    };

    const handleUserJoined = ({ participants }) => {
      updateParticipants(participants);
    };

    const handleUserLeft = ({ participants }) => {
      updateParticipants(participants);
    };

    const handleRoleAssigned = ({ participants, hostOdId, previousHostOdId }) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        const self = participants.find((p) => p.odId === odId);
        let role = self?.role ?? prev.role;

        if (hostOdId) {
          if (odId === hostOdId) role = 'host';
          else if (odId === previousHostOdId) role = 'participant';
        }

        return {
          ...prev,
          participants,
          role,
          hostOdId: hostOdId ?? participants.find((p) => p.role === 'host')?.odId ?? prev.hostOdId,
        };
      });
    };

    const handleParticipantRemoved = ({ removed, message, participants }) => {
      if (removed) {
        clearStoredOdId(roomId?.toUpperCase());
        setError(message || 'You were removed from the room');
        return;
      }
      updateParticipants(participants);
    };

    socket.on('sync_state', handleSyncState);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('role_assigned', handleRoleAssigned);
    socket.on('participant_removed', handleParticipantRemoved);

    return () => {
      socket.emit('leave_room', {});
      socket.off('sync_state', handleSyncState);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('role_assigned', handleRoleAssigned);
      socket.off('participant_removed', handleParticipantRemoved);
    };
  }, [socket, isConnected, roomId, odId, updateParticipants]);

  const onSyncEvent = useCallback((listener) => {
    syncListenersRef.current.push(listener);
    return () => {
      syncListenersRef.current = syncListenersRef.current.filter((l) => l !== listener);
    };
  }, []);

  const handlePlay = useCallback(
    (currentTime) => emitWithCallback('play', { currentTime }),
    [emitWithCallback]
  );

  const handlePause = useCallback(
    (currentTime) => emitWithCallback('pause', { currentTime }),
    [emitWithCallback]
  );

  const handleSeek = useCallback(
    (currentTime) => emitWithCallback('seek', { currentTime }),
    [emitWithCallback]
  );

  const handleChangeVideo = useCallback(
    (videoId) => emitWithCallback('change_video', { videoId }),
    [emitWithCallback]
  );

  const handleAssignRole = useCallback(
    (targetOdId, role) => emitWithCallback('assign_role', { targetOdId, role }),
    [emitWithCallback]
  );

  const handleTransferHost = useCallback(
    (targetOdId) => emitWithCallback('transfer_host', { targetOdId }),
    [emitWithCallback]
  );

  const handleRemoveParticipant = useCallback(
    (targetOdId) => emitWithCallback('remove_participant', { targetOdId }),
    [emitWithCallback]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Joining room..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Alert message={error} />
        <button onClick={() => navigate('/')} className="btn-primary mt-4 w-full">
          Back to Home
        </button>
      </div>
    );
  }

  if (!roomState) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <RoomHeader
        roomName={roomState.name}
        roomId={roomState.roomId}
        userRole={roomState.role}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <VideoPlayer
            videoId={roomState.playback?.videoId}
            userRole={roomState.role}
            playback={roomState.playback}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onSyncEvent={onSyncEvent}
          />

          <VideoControls
            videoId={roomState.playback?.videoId}
            userRole={roomState.role}
            onChangeVideo={handleChangeVideo}
            disabled={!isConnected}
          />
        </div>

        <div>
          <ParticipantList
            participants={roomState.participants || []}
            currentOdId={odId}
            hostOdId={roomState.hostOdId}
            userRole={roomState.role}
            onAssignRole={handleAssignRole}
            onTransferHost={handleTransferHost}
            onRemove={handleRemoveParticipant}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
