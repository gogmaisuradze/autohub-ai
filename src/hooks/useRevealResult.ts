import { useEffect, useRef } from 'react';

/** Show the result of a user action below the sticky navigation. */
export function revealResult(element: HTMLElement) {
  const header = document.getElementById('sticky-header');
  const headerHeight = header?.getBoundingClientRect().height || 0;
  const top = Math.max(0, window.scrollY + element.getBoundingClientRect().top - headerHeight - 16);
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

/** Runs on changes only; initial renders and background telemetry do not move the page. */
export function useRevealResult(trigger: string | number | boolean | null, targetId: string, enabled = true) {
  const previous = useRef(trigger);
  useEffect(() => {
    if (Object.is(previous.current, trigger)) return;
    previous.current = trigger;
    if (!enabled) return;
    let frame = 0;
    let observer: MutationObserver | undefined;
    let timeout = 0;
    const show = () => {
      const element = document.getElementById(targetId);
      if (!element || !element.getClientRects().length) return false;
      observer?.disconnect();
      window.clearTimeout(timeout);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => revealResult(element));
      });
      return true;
    };
    if (!show()) {
      observer = new MutationObserver(show);
      observer.observe(document.getElementById('main-content') || document.body, { childList: true, subtree: true });
      timeout = window.setTimeout(() => observer?.disconnect(), 2500);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.clearTimeout(timeout);
    };
  }, [trigger, targetId, enabled]);
}
