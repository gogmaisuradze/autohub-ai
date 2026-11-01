export const CAR_INTRO_DURATION = 7.2;

/** Shared with the recorded scene: arrive, settle, then lose the paint. */
export function getCarIntroFrame(seconds: number) {
  const time = Math.max(0, Math.min(CAR_INTRO_DURATION, seconds));
  const arrival = Math.min(1, time / 2.2);
  const drive = Math.min(1, arrival / .7);
  const turn = Math.max(0, Math.min(1, (arrival - .48) / .52));
  return {
    z: -13 * Math.pow(1 - drive, 3),
    yaw: -.3 * turn * turn * (3 - 2 * turn),
    fill: 1 - Math.max(0, Math.min(1, (time - 2.65) / 4)),
    done: time >= CAR_INTRO_DURATION,
  };
}

// MediaRecorder's first frame arrives after capture starts; account for that
// small offset when matching the recorded video to the live animation.
export const videoTimeToSceneTime = (time: number) => Math.min(CAR_INTRO_DURATION, .28 + Math.max(0, time) * (6.92 / 7.2));
