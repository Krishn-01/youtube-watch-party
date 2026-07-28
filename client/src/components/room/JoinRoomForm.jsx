import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { api } from '../../services/api';
import { setStoredUsername, setStoredOdId } from '../../utils/helpers';

const JoinRoomForm = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState(
    () => localStorage.getItem('watchparty_username') || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!roomId.trim() || !username.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.joinRoom(
        roomId.trim().toUpperCase(),
        username.trim()
      );
      setStoredUsername(username.trim());
      setStoredOdId(data.roomId, data.odId);
      navigate(`/room/${data.roomId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="join-username"
        label="Your Name"
        placeholder="Enter your display name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        maxLength={30}
        required
      />

      <Input
        id="join-room-id"
        label="Room Code"
        placeholder="Enter 8-character room code"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
        maxLength={8}
        required
      />

      {error && <Alert message={error} />}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Joining...' : 'Join Room'}
      </Button>
    </form>
  );
};

export default JoinRoomForm;
