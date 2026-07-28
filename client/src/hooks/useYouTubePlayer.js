import { useCallback, useEffect, useRef, useState } from 'react';



const YOUTUBE_API_URL = 'https://www.youtube.com/iframe_api';



let apiLoadingPromise = null;



const loadYouTubeAPI = () => {

  if (window.YT?.Player) {

    return Promise.resolve(window.YT);

  }



  if (apiLoadingPromise) {

    return apiLoadingPromise;

  }



  apiLoadingPromise = new Promise((resolve) => {

    const existingCallback = window.onYouTubeIframeAPIReady;



    window.onYouTubeIframeAPIReady = () => {

      existingCallback?.();

      resolve(window.YT);

    };



    if (!document.querySelector(`script[src="${YOUTUBE_API_URL}"]`)) {

      const script = document.createElement('script');

      script.src = YOUTUBE_API_URL;

      script.async = true;

      document.head.appendChild(script);

    }

  });



  return apiLoadingPromise;

};



export const useYouTubePlayer = ({

  containerId,

  videoId,

  canControl,

  onPlay,

  onPause,

  onSeek,

  onReady,

}) => {

  const playerRef = useRef(null);

  const isSyncingRef = useRef(false);

  const isSeekingRef = useRef(false);

  const callbacksRef = useRef({ onPlay, onPause, onSeek, onReady });

  const [isReady, setIsReady] = useState(false);

  const [playerState, setPlayerState] = useState(-1);



  callbacksRef.current = { onPlay, onPause, onSeek, onReady };



  const syncFromRemote = useCallback((data) => {

    const player = playerRef.current;

    if (!player?.seekTo) return;



    const { action, currentTime, videoId: newVideoId } = data;



    isSyncingRef.current = true;



    try {

      if (action === 'change_video' && newVideoId) {

        player.loadVideoById(newVideoId);

        player.pauseVideo();

      } else {

        if (typeof currentTime === 'number') {

          player.seekTo(currentTime, true);

        }



        if (action === 'play') {

          player.playVideo();

        } else if (action === 'pause') {

          player.pauseVideo();

        }

      }

    } catch (error) {

      console.error('Sync error:', error);

    }



    setTimeout(() => {

      isSyncingRef.current = false;

    }, 500);

  }, []);



  useEffect(() => {

    let isMounted = true;



    const initPlayer = async () => {

      const YT = await loadYouTubeAPI();

      if (!isMounted) return;



      playerRef.current = new YT.Player(containerId, {

        height: '100%',

        width: '100%',

        videoId: videoId || undefined,

        playerVars: {

          autoplay: 0,

          controls: canControl ? 1 : 0,

          disablekb: canControl ? 0 : 1,

          modestbranding: 1,

          rel: 0,

          fs: 1,

          origin: window.location.origin,

        },

        events: {

          onReady: (event) => {

            if (!isMounted) return;

            setIsReady(true);

            callbacksRef.current.onReady?.(event.target);

          },

          onStateChange: (event) => {

            if (!isMounted) return;



            setPlayerState(event.data);



            if (isSyncingRef.current || !canControl) return;



            const currentTime = event.target.getCurrentTime?.() ?? 0;



            if (event.data === YT.PlayerState.BUFFERING) {

              isSeekingRef.current = true;

            }



            if (

              isSeekingRef.current &&

              (event.data === YT.PlayerState.PLAYING ||

                event.data === YT.PlayerState.PAUSED)

            ) {

              isSeekingRef.current = false;

              callbacksRef.current.onSeek?.(currentTime);

            }



            if (event.data === YT.PlayerState.PLAYING) {

              callbacksRef.current.onPlay?.(currentTime);

            } else if (event.data === YT.PlayerState.PAUSED) {

              callbacksRef.current.onPause?.(currentTime);

            }

          },

        },

      });

    };



    initPlayer();



    return () => {

      isMounted = false;

      playerRef.current?.destroy?.();

      playerRef.current = null;

      setIsReady(false);

    };

  }, [containerId, canControl]);



  return {

    player: playerRef.current,

    isReady,

    playerState,

    syncFromRemote,

    isSyncingRef,

  };

};

