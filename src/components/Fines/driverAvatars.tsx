import React from 'react';

export interface PhotoAvatarPreset {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
}

export const AVATAR_BASE = `${import.meta.env.BASE_URL}avatars/`;

export const PHOTO_AVATARS: PhotoAvatarPreset[] = [
  {
    id: 'avatar_dog',
    title: 'Good Vibes ძაღლი',
    subtitle: 'Music Lover Dog',
    image: `${AVATAR_BASE}dog.png`,
    badge: 'GOOD VIBES'
  },
  {
    id: 'avatar_lion',
    title: 'ლომი კლდეზე',
    subtitle: 'Majestic Lion',
    image: `${AVATAR_BASE}lion.png`,
    badge: 'LION'
  },
  {
    id: 'avatar_shark',
    title: 'ოკეანის ზვიგენი',
    subtitle: 'Ocean Shark',
    image: `${AVATAR_BASE}shark.png`,
    badge: 'SHARK'
  },
  {
    id: 'avatar_sloth',
    title: 'ზენი ზარმაცა',
    subtitle: 'Zen Sloth',
    image: `${AVATAR_BASE}sloth.png`,
    badge: 'ZEN SLOTH'
  },
  {
    id: 'avatar_cat',
    title: 'ყავის კატა',
    subtitle: 'Chill Coffee Cat',
    image: `${AVATAR_BASE}cat.png`,
    badge: 'COFFEE CAT'
  }
];

export const renderDriverAvatar = (photoUrl?: string, className = "w-full h-full", showBadge = true) => {
  const matchedPreset = PHOTO_AVATARS.find(
    (p) =>
      p.id === photoUrl ||
      p.image === photoUrl ||
      (!!photoUrl?.startsWith('/avatars/') && p.image.endsWith(photoUrl.slice(1)))
  );

  const effectivePreset = matchedPreset || (!photoUrl || photoUrl === 'avatar_lion' ? PHOTO_AVATARS[0] : null);

  const imgSrc = effectivePreset
    ? effectivePreset.image
    : photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('data:') || photoUrl.startsWith('/'))
    ? photoUrl
    : `${AVATAR_BASE}dog.png`;

  const badgeText = effectivePreset
    ? effectivePreset.badge
    : photoUrl && (photoUrl.startsWith('data:') || photoUrl.startsWith('http'))
    ? 'PHOTO ID'
    : 'GOOD VIBES';

  return (
    <div className={`relative ${className} overflow-hidden bg-slate-950 flex items-center justify-center select-none group`}>
      <img
        src={imgSrc.startsWith('/avatars/') ? `${import.meta.env.BASE_URL}${imgSrc.slice(1)}` : imgSrc}
        alt={matchedPreset ? matchedPreset.title : "Driver Avatar"}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      {showBadge && (
        <span className="absolute bottom-1 right-1 text-[8px] font-mono font-black px-1.5 py-0.2 bg-navy/80 text-gold rounded border border-gold/40 shadow-xs pointer-events-none">
          {badgeText}
        </span>
      )}
    </div>
  );
};
