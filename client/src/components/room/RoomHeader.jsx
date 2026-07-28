import { useState } from 'react';
import { copyToClipboard } from '../../utils/helpers';
import RoleBadge from './RoleBadge';

const RoomHeader = ({ roomName, roomId, userRole }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/room/${roomId}`;
    const success = await copyToClipboard(url);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(roomId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">{roomName}</h1>
        <div className="mt-1 flex items-center gap-2">
          <RoleBadge role={userRole} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="rounded-lg border border-surface-600 bg-surface-800 px-4 py-2">
          <span className="text-xs text-gray-500">Room Code</span>
          <p className="font-mono text-lg font-bold tracking-widest text-brand-400">
            {roomId}
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="btn-secondary px-3 py-2 text-xs"
          title="Copy room code"
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </button>

        <button
          onClick={handleCopy}
          className="btn-secondary px-3 py-2 text-xs"
          title="Copy invite link"
        >
          Share Link
        </button>
      </div>
    </div>
  );
};

export default RoomHeader;
