import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CAR_INTRO_DURATION, videoTimeToSceneTime } from '../services/carIntroTimeline';

interface Props {
  ready: boolean;
  error: boolean;
  onProgress: (seconds: number) => void;
  onHandoff: (seconds: number) => void;
}

/** A lightweight movie until the live scene has actually rendered a frame. */
export function CarLoadingIntro({ ready, error, onProgress, onHandoff }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handedOff = useRef(false);
  const callbacks = useRef({ onProgress, onHandoff });
  callbacks.current = { onProgress, onHandoff };
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [playBlocked, setPlayBlocked] = useState(false);
  const base = `${import.meta.env.BASE_URL}models/`;
  const [mobile] = useState(() => window.matchMedia('(max-width: 639px)').matches);
  const poster = `${base}bmw-loading-${mobile ? 'mobile' : 'desktop'}-end.jpg`;

  const handoff = useCallback(() => {
    if (!ready || handedOff.current || error) return;
    const video = videoRef.current;
    if (!videoFailed && !playBlocked && (!video || video.readyState < 2)) return;
    const time = videoFailed || playBlocked ? CAR_INTRO_DURATION : videoTimeToSceneTime(video!.currentTime);
    // Update the scene clock before fading, so the live model continues the
    // same movement rather than replaying its entrance animation.
    callbacks.current.onProgress(time);
    callbacks.current.onHandoff(time);
    handedOff.current = true;
    setFading(true);
  }, [ready, error, videoFailed, playBlocked]);

  useEffect(() => { handoff(); }, [handoff]);
  useEffect(() => {
    if (!fading) return;
    const timeout = window.setTimeout(() => setRemoved(true), 450);
    return () => window.clearTimeout(timeout);
  }, [fading]);
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.play().catch(() => setPlayBlocked(true));
    return () => { video?.pause(); };
  }, []);

  if (removed) return null;
  return (
    <div data-car-loading-intro="" aria-hidden={fading}
      className={`absolute inset-0 z-10 overflow-hidden rounded-[inherit] bg-[#08090a] transition-opacity duration-[400ms] motion-reduce:transition-none ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {videoFailed ? <img src={poster} alt="მანქანის წინასწარი ხედი" className="h-full w-full object-cover" /> : (
        <video ref={videoRef} autoPlay muted playsInline preload="auto" poster={playBlocked ? poster : `${base}bmw-loading-${mobile ? 'mobile' : 'desktop'}-start.jpg`}
          className="h-full w-full object-cover" aria-label="მანქანის შემოსვლის წინასწარი ვიდეო"
          onLoadedData={handoff} onError={() => setVideoFailed(true)}
          onTimeUpdate={event => callbacks.current.onProgress(videoTimeToSceneTime(event.currentTarget.currentTime))}
          onEnded={() => { callbacks.current.onProgress(CAR_INTRO_DURATION); handoff(); }}>
          <source src={`${base}bmw-loading-${mobile ? 'mobile' : 'desktop'}.mp4`} type="video/mp4" />
        </video>
      )}
      {!fading && <div role="status" aria-live="polite" className="absolute bottom-5 inset-x-0 flex justify-center px-3">
        <span className="rounded-full bg-slate-950/80 px-4 py-2 text-xs text-white border border-white/15">
          {error ? '3D ვერ ჩაიტვირთა — განაახლეთ გვერდი' : '3D მოდელი მზადდება…'}
        </span>
      </div>}
    </div>
  );
}
