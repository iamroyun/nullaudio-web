import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  artist?: string;
  heroMode?: boolean; // when true (home page), player lifts on initial view and settles on scroll
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title, artist, heroMode = false }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const hoverLineRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isScrolled, setIsScrolled] = useState(!heroMode);
  const getInitialLift = () => {
    if (typeof window === 'undefined') return 0;
    // Distance to lift the player up from bottom so it sits comfortably below the hero title
    // Use a ratio of viewport height (45%) to avoid overlapping header on larger screens
    const bottomOffsetPx = 50; // bottom-6
    const targetFromBottom = Math.max(0, Math.round(window.innerHeight * 0.45));
    return Math.max(0, targetFromBottom - bottomOffsetPx + 64); // +64px to move up with hero content
  };
  const [heroLiftPx, setHeroLiftPx] = useState(getInitialLift);
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [waveHeight, setWaveHeight] = useState(60);

  const computeWaveHeightForWidth = (width: number) => {
    if (width < 640) return 36; // mobile
    if (width < 1024) return 48; // tablet
    return 60; // desktop
  };

  // Load persisted state from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('audioPlayer-volume');
    const savedCurrentTime = localStorage.getItem('audioPlayer-currentTime');
    const savedIsPlaying = localStorage.getItem('audioPlayer-isPlaying');
    
    if (savedVolume) setVolume(parseFloat(savedVolume));
    if (savedCurrentTime) setCurrentTime(parseFloat(savedCurrentTime));
    if (savedIsPlaying === 'true') setIsPlaying(true);
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('audioPlayer-volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('audioPlayer-currentTime', currentTime.toString());
  }, [currentTime]);

  useEffect(() => {
    localStorage.setItem('audioPlayer-isPlaying', isPlaying.toString());
  }, [isPlaying]);

  // Scroll detection for positioning (only when heroMode enabled)
  useEffect(() => {
    if (!heroMode) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Trigger transition after scrolling 150px for smoother feel
          setIsScrolled(scrollY > 150);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [heroMode]);

  // Compute initial lift (only meaningful in heroMode) and responsive waveform height
  useLayoutEffect(() => {
    const computeLiftAndSize = () => {
      const bottomOffsetPx = 100; // tailwind bottom-6
      const vh = window.innerHeight;
      const minLiftPx = 160; // comfortable distance below header/subtitle
      if (heroMode) {
        const targetFromBottom = Math.max(minLiftPx, Math.round(vh * 0.33));
        const lift = Math.max(minLiftPx, targetFromBottom - bottomOffsetPx + 64); // +64px to move up with hero content
        setHeroLiftPx(lift);
      } else {
        setHeroLiftPx(0);
      }
      // set initial waveform height responsively
      const width = window.innerWidth;
      setWaveHeight(computeWaveHeightForWidth(width));
      setIsReady(true);
    };
    computeLiftAndSize();
    const onResize = () => {
      computeLiftAndSize();
      const width = window.innerWidth;
      const newHeight = computeWaveHeightForWidth(width);
      setWaveHeight(newHeight);
      if (wavesurferRef.current) {
        wavesurferRef.current.setOptions({ height: newHeight });
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [heroMode]);

  // Enable transitions after first paint to avoid initial snap
  useEffect(() => {
    if (!isReady) return;
    // Slight delay ensures we don't animate the initial layout position
    const t = window.setTimeout(() => setTransitionsEnabled(true), 30);
    return () => window.clearTimeout(t);
  }, [isReady]);

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    // Always create a new WaveSurfer instance for each component mount
    // This ensures proper container binding
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#FFFFFF',
      progressColor: '#78DCE8',
      cursorColor: '#78DCE8',
      barWidth: 2,
      barRadius: 0,
      fillParent: true,
      height: waveHeight,
      normalize: true,
      backend: 'WebAudio',
      mediaControls: false,
    });

    wavesurferRef.current = wavesurfer;

    // Load audio
    wavesurfer.load(audioUrl);

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      wavesurfer.setVolume(volume);
      
      // Restore saved position
      const savedCurrentTime = localStorage.getItem('audioPlayer-currentTime');
      if (savedCurrentTime) {
        const time = parseFloat(savedCurrentTime);
        if (time > 0 && time < wavesurfer.getDuration()) {
          wavesurfer.seekTo(time / wavesurfer.getDuration());
        }
      }
      
      // Restore playing state
      const savedIsPlaying = localStorage.getItem('audioPlayer-isPlaying');
      if (savedIsPlaying === 'true') {
        wavesurfer.play();
        setIsPlaying(true);
      }
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('seeking', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });


    return () => {
      // Save current state before destroying
      if (wavesurfer) {
        localStorage.setItem('audioPlayer-currentTime', wavesurfer.getCurrentTime().toString());
        localStorage.setItem('audioPlayer-isPlaying', wavesurfer.isPlaying().toString());
        wavesurfer.destroy();
      }
    };
  }, [audioUrl, waveHeight]);

  // Handle volume changes without recreating WaveSurfer
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume);
    }
  }, [volume]);

  // Hover indicator over waveform
  useEffect(() => {
    const container = waveformContainerRef.current;
    const hoverLine = hoverLineRef.current;
    if (!container || !hoverLine) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
      hoverLine.style.opacity = '1';
      hoverLine.style.transform = `translateX(${x}px)`;
    };

    const onEnter = () => {
      hoverLine.style.opacity = '1';
    };

    const onLeave = () => {
      hoverLine.style.opacity = '0';
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const togglePlayPause = () => {
    if (!wavesurferRef.current) return;

    if (isPlaying) {
      wavesurferRef.current.pause();
      setIsPlaying(false);
    } else {
      wavesurferRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Don't render if no audio URL
  if (!audioUrl) {
    return null;
  }

  return (
    <>
    <div
      className={`fixed left-1/2 bottom-6 z-40 w-[90vw] sm:w-4/5 md:w-3/5 lg:w-2/5 ${
        transitionsEnabled ? 'transition duration-800 [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]' : 'transition-none'
      }`}
      style={{
        transform: `translate(-50%, ${isScrolled ? '0px' : `-${heroLiftPx}px`})`,
        opacity: isScrolled ? 1 : 0.92,
      }}
    >
      <div className="border border-stone-400 px-3 sm:px-4 md:px-6 py-3 md:py-4 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-brand-cyan text-black hover:bg-brand-cyan/80 transition duration-150 hover:scale-[1.04] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 rounded-none"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Track Info */}
          <div className="flex-shrink-0 min-w-0">
            <div className="text-sm font-medium text-white truncate max-w-[50vw] sm:max-w-none">
              {title || 'Unknown Track'}
            </div>
            <div className="text-xs text-muted truncate max-w-[50vw] sm:max-w-none">
              {artist || 'Unknown Artist'}
            </div>
          </div>

          {/* Waveform (shown on mobile; replaces time) */}
          <div className="flex-1 min-w-0">
            <div ref={waveformContainerRef} className="relative w-full group select-none">
              <div ref={waveformRef} className="w-full" />
              {/* Hover position indicator */}
              <div
                ref={hoverLineRef}
                className="pointer-events-none absolute top-0 bottom-0 w-px bg-brand-cyan opacity-0 transition-opacity duration-150"
                style={{ transform: 'translateX(0)' }}
              />
            </div>
          </div>

          {/* Time Display */}
          <div className="hidden sm:block flex-shrink-0 text-sm text-white/80 font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Volume Control (hidden on mobile) */}
          <div className="hidden sm:flex flex-shrink-0 items-center gap-2">
            <svg className="w-4 h-4 text-muted" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1 bg-dark-300 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #78DCE8 0%, #78DCE8 ${volume * 100}%, #2D2D2D ${volume * 100}%, #2D2D2D 100%)`,
                accentColor: '#78DCE8'
              }}
            />
          </div>
        </div>
      </div>
    </div>
    {/* Component-scoped styles for range slider interactions */}
    <style>{`
      .slider { outline: none; }
      .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 14px; width: 14px; border-radius: 9999px; background: #78DCE8; border: none;
        transition: transform 250ms ease, box-shadow 150ms ease;
        box-shadow: 0 0 0 0 rgba(120,220,232,0.35);
      }
      .slider:hover::-webkit-slider-thumb { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(120,220,232,0.15); }
      .slider:active::-webkit-slider-thumb { transform: scale(0.98); }
      .slider:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 6px rgba(120,220,232,0.25); }
      .slider::-moz-range-thumb {
        height: 14px; width: 14px; border-radius: 9999px; background: #78DCE8; border: none;
        transition: transform 250ms ease, box-shadow 150ms ease;
        box-shadow: 0 0 0 0 rgba(120,220,232,0.35);
      }
      .slider:hover::-moz-range-thumb { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(120,220,232,0.15); }
      .slider:active::-moz-range-thumb { transform: scale(0.98); }
      .slider:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 6px rgba(120,220,232,0.25); }
      /* Subtle track brighten on hover */
      .slider:hover { filter: brightness(1.05); }
    `}</style>
    </>
  );
};

export default AudioPlayer;
