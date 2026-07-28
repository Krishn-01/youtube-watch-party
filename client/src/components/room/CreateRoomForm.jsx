import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { api } from '../../services/api';
import { setStoredUsername, setStoredOdId } from '../../utils/helpers';

const CreateRoomForm = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [username, setUsername] = useState(
    () => localStorage.getItem('watchparty_username') || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!roomName.trim() || !username.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.createRoom(roomName.trim(), username.trim());
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
        id="create-username"
        label="Your Name"
        placeholder="Enter your display name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        maxLength={30}
        required
      />

      <Input
        id="create-room-name"
        label="Room Name"
        placeholder="Movie Night, Study Group..."
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        maxLength={50}
        required
      />

      {error && <Alert message={error} />}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Room'}
      </Button>
    </form>
  );
};

export default CreateRoomForm;
