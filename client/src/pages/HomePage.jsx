import { useState } from 'react';
import CreateRoomForm from '../components/room/CreateRoomForm';
import JoinRoomForm from '../components/room/JoinRoomForm';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-12 text-center animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Watch YouTube{' '}
          <span className="text-brand-500">Together</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          Create a room, invite friends, and enjoy synchronized playback with
          real-time play, pause, and seek controls.
        </p>
      </div>

      <div className="mx-auto max-w-md animate-slide-up">
        <div className="card">
          <div className="mb-6 flex rounded-lg bg-surface-700 p-1">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-surface-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                activeTab === 'join'
                  ? 'bg-surface-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Join Room
            </button>
          </div>

          {activeTab === 'create' ? <CreateRoomForm /> : <JoinRoomForm />}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Sync Playback',
              desc: 'Play, pause, and seek stay in sync for everyone',
            },
            {
              title: 'Role-Based Access',
              desc: 'Host, Moderator, and Participant permissions',
            },
            {
              title: 'Real-Time',
              desc: 'Instant updates powered by Socket.IO',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-surface-600 bg-surface-800/50 p-4 text-center"
            >
              <h3 className="text-sm font-semibold text-gray-200">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
