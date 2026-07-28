import { useCallback, useEffect } from 'react';

import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';

import { canControlPlayback } from '../../constants/roles';

import LoadingSpinner from '../ui/LoadingSpinner';



const PLAYER_CONTAINER_ID = 'youtube-player';



const VideoPlayer = ({

  videoId,

  userRole,

  playback,

  onPlay,

  onPause,

  onSeek,

  onSyncEvent,

}) => {

  const canControl = canControlPlayback(userRole);



  const { isReady, syncFromRemote, isSyncingRef } = useYouTubePlayer({

    containerId: PLAYER_CONTAINER_ID,

    videoId,

    canControl,

    onPlay,

    onPause,

    onSeek,

    onReady: (player) => {

      if (!playback) return;



      isSyncingRef.current = true;



      if (playback.videoId && playback.videoId !== videoId) {

        player.loadVideoById(playback.videoId);

      }



      if (playback.currentTime) {

        player.seekTo(playback.currentTime, true);

      }



      if (playback.isPlaying) {

        player.playVideo();

      } else {

        player.pauseVideo();

      }



      setTimeout(() => {

        isSyncingRef.current = false;

      }, 600);

    },

  });



  const handleSync = useCallback(

    (data) => {

      if (data.action === 'sync') return;

      syncFromRemote(data);

    },

    [syncFromRemote]

  );



  useEffect(() => {

    if (!onSyncEvent) return;

    return onSyncEvent(handleSync);

  }, [onSyncEvent, handleSync]);



  return (

    <div className="card p-0 overflow-hidden">

      <div className="video-container">

        <div id={PLAYER_CONTAINER_ID} />

        {!isReady && (

          <div className="absolute inset-0 flex items-center justify-center bg-black">

            <LoadingSpinner size="lg" text="Loading player..." />

          </div>

        )}

      </div>



      {!canControl && (

        <div className="border-t border-surface-600 px-4 py-2 text-center text-xs text-gray-500">

          Playback is controlled by Host / Moderator

        </div>

      )}

    </div>

  );

};



export default VideoPlayer;

