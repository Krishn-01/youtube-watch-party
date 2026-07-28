import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { extractVideoId } from '../../utils/helpers';
import { canChangeVideo } from '../../constants/roles';

const VideoControls = ({ videoId, userRole, onChangeVideo, disabled }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canChange = canChangeVideo(userRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedId = extractVideoId(url);
    if (!parsedId) {
      setError('Invalid YouTube URL or video ID');
      return;
    }

    setLoading(true);
    try {
      await onChangeVideo(parsedId);
      setUrl('');
    } catch (err) {
      setError(err.message || 'Failed to change video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold text-gray-200">
        Video Controls
      </h3>

      {videoId ? (
        <p className="mb-3 text-xs text-gray-500">
          Current: <span className="font-mono text-gray-400">{videoId}</span>
        </p>
      ) : (
        <p className="mb-3 text-xs text-gray-500">
          No video loaded. Paste a YouTube URL to start watching.
        </p>
      )}

      {canChange ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            id="video-url"
            placeholder="Paste YouTube URL or video ID"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={disabled || loading}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={disabled || loading || !url.trim()}
            className="w-full"
          >
            {loading ? 'Loading...' : videoId ? 'Change Video' : 'Load Video'}
          </Button>
        </form>
      ) : (
        <p className="text-xs text-gray-500 italic">
          Only Host and Moderators can change the video.
        </p>
      )}
    </div>
  );
};

export default VideoControls;
