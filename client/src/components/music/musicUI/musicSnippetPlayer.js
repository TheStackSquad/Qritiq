// client/src/components/musicUI/musicSnippetPlayer.js
"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicSnippetPlayer({
  previewUrl,
  trackId,
  onPlayStart,
  compact = false,
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const animFrameRef = useRef(null);

  // Stop this player if another track starts globally
 useEffect(() => {
   const handleGlobalStop = (e) => {
     if (e.detail?.trackId !== trackId) {
       pauseAudio();
     }
   };
   window.addEventListener("kritiq:play", handleGlobalStop);
   return () => {
     window.removeEventListener("kritiq:play", handleGlobalStop);
     if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
     if (audioRef.current) {
       audioRef.current.pause();
       audioRef.current.src = "";
       audioRef.current = null;
     }
   };
 }, [trackId]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  function pauseAudio() {
    if (audioRef.current) audioRef.current.pause();
    setPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }

  function tick() {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setProgress(dur ? (cur / dur) * 100 : 0);
    if (!audioRef.current.paused) {
      animFrameRef.current = requestAnimationFrame(tick);
    }
  }

 async function togglePlay() {
   if (!previewUrl) return;

   // Fix: Reference window.Audio to satisfy linting/environment checks
   if (!audioRef.current) {
     const AudioConstructor = window.Audio;
     audioRef.current = new AudioConstructor();
     audioRef.current.preload = "none";
     audioRef.current.src = previewUrl;

     audioRef.current.onloadedmetadata = () => {
       setDuration(audioRef.current.duration);
       setLoaded(true);
     };

     audioRef.current.onended = () => {
       setPlaying(false);
       setProgress(0);
       if (audioRef.current) audioRef.current.currentTime = 0;
     };
   }

   if (playing) {
     pauseAudio();
   } else {
     window.dispatchEvent(
       new CustomEvent("kritiq:play", { detail: { trackId } }),
     );
     onPlayStart?.();
     try {
       await audioRef.current.play();
       setPlaying(true);
       animFrameRef.current = requestAnimationFrame(tick);
     } catch (err) {
       console.error("Autoplay blocked or load failed", err);
     }
   }
 }

  function handleSeek(e) {
    if (!audioRef.current || !loaded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
    setProgress(pct * 100);
  }

  function toggleMute() {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  }

  const currentTime = audioRef.current?.currentTime ?? 0;

  if (!previewUrl) return null;

  if (compact) {
    return (
      <button
        className="msp-compact-btn"
        onClick={togglePlay}
        aria-label={playing ? "Pause preview" : "Play 30s preview"}
      >
        {playing ? (
          <Pause size={14} strokeWidth={2.5} />
        ) : (
          <Play size={14} strokeWidth={2.5} />
        )}
        <style jsx>{`
          .msp-compact-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--color-kritiq-red);
            border: none;
            cursor: pointer;
            color: #fff;
            flex-shrink: 0;
            transition:
              transform 120ms ease,
              background 120ms ease;
            -webkit-tap-highlight-color: transparent;
          }
          .msp-compact-btn:hover {
            transform: scale(1.08);
            background: #e8001f;
          }
          .msp-compact-btn:active {
            transform: scale(0.95);
          }
        `}</style>
      </button>
    );
  }

  return (
    <div className="msp-root" role="region" aria-label="Track preview player">
      {/* Play / Pause */}
      <button
        className={`msp-play ${playing ? "msp-play--active" : ""}`}
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play 30s preview"}
      >
        {playing ? (
          <Pause size={16} strokeWidth={2.5} />
        ) : (
          <Play size={16} strokeWidth={2.5} />
        )}
      </button>

      {/* Progress bar */}
      <div className="msp-track-area">
        <div
          className="msp-bar"
          onClick={handleSeek}
          role="slider"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          <div className="msp-fill" style={{ width: `${progress}%` }} />
          {playing && (
            <div className="msp-thumb" style={{ left: `${progress}%` }} />
          )}
        </div>
        <div className="msp-times">
          <span>{formatTime(currentTime)}</span>
          <span className="msp-snippet-label">30s preview</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Mute */}
      <button
        className="msp-mute"
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>

      <style jsx>{`
        .msp-root {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--color-kritiq-dark-2, #1a1a1a);
          border-radius: 12px;
          border: 1px solid var(--color-kritiq-dark-3, #2a2a2a);
        }

        .msp-play {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-kritiq-red, #c0001a);
          border: none;
          cursor: pointer;
          color: #fff;
          flex-shrink: 0;
          transition: transform 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .msp-play:hover {
          transform: scale(1.06);
        }
        .msp-play:active {
          transform: scale(0.94);
        }
        .msp-play--active {
          background: #e8001f;
        }

        .msp-track-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .msp-bar {
          position: relative;
          height: 4px;
          background: var(--color-kritiq-dark-3, #2e2e2e);
          border-radius: 99px;
          cursor: pointer;
        }
        .msp-bar:hover {
          height: 5px;
        }

        .msp-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: var(--color-kritiq-red, #c0001a);
          border-radius: 99px;
          transition: width 80ms linear;
        }

        .msp-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 0 2px var(--color-kritiq-red, #c0001a);
          pointer-events: none;
        }

        .msp-times {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-lexend, monospace);
          font-size: 10px;
          color: var(--color-kritiq-ash, #888);
        }

        .msp-snippet-label {
          font-size: 9px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          opacity: 0.6;
        }

        .msp-mute {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-kritiq-ash, #888);
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 120ms ease;
          flex-shrink: 0;
        }
        .msp-mute:hover {
          color: var(--color-kritiq-white, #fff);
        }
      `}</style>
    </div>
  );
}
