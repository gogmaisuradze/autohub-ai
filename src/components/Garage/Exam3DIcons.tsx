import React from 'react';

/**
 * Exam3DIcons — საგამოცდო / საპატრულო მოდულების 3D-სტილის იკონები.
 * navy/gold პალიტრა, გრადიენტული „მოცულობითი“ იერი, `size`/`className` props.
 * თითო ინსტანსი იყენებს React.useId()-ს უნიკალური gradient id-ებისთვის,
 * რომ ერთ გვერდზე მრავალი იკონის defs ერთმანეთს არ გადაეფაროს.
 */

type IconProps = { size?: number; className?: string };

export const GraduationCap3D: React.FC<IconProps> = ({ size, className }) => {
  const uid = React.useId();
  const board = `grad-board-${uid}`;
  const base = `grad-base-${uid}`;
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      width={size}
      height={size}
      aria-label="მართვის მოწმობის ბილეთები"
      role="img"
    >
      <defs>
        <linearGradient id={board} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2b4274" />
          <stop offset="55%" stopColor="#14213D" />
          <stop offset="100%" stopColor="#0c1527" />
        </linearGradient>
        <linearGradient id={base} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="45%" stopColor="#FCA311" />
          <stop offset="100%" stopColor="#e58e07" />
        </linearGradient>
      </defs>
      {/* ჩრდილი */}
      <ellipse cx="32" cy="55" rx="18" ry="3.2" fill="#14213D" opacity="0.14" />
      {/* მოცულობითი რბოლა (cap base) */}
      <path
        d="M18 30 L32 36 L46 30 L46 40 Q46 47 32 47 Q18 47 18 40 Z"
        fill={`url(#${base})`}
        stroke="#e58e07"
        strokeWidth="0.5"
      />
      <path d="M18 30 L32 36 L46 30 L46 33 L32 39 L18 33 Z" fill="#0c1527" opacity="0.18" />
      {/* მორტარბორდი (დაფა) */}
      <path d="M32 18 L58 28 L32 38 L6 28 Z" fill={`url(#${board})`} />
      <path d="M32 18 L58 28 L32 38 Z" fill="#000" opacity="0.12" />
      {/* ტასელი */}
      <path d="M50 29 L50 41" stroke="#FCA311" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="50" cy="42.5" r="2.2" fill="#FDE047" stroke="#e58e07" strokeWidth="0.5" />
      {/* ბზინვარება */}
      <path d="M32 20 L40 24 L32 28 L24 24 Z" fill="#fff" opacity="0.14" />
    </svg>
  );
};

export const ShieldAlert3D: React.FC<IconProps> = ({ size, className }) => {
  const uid = React.useId();
  const body = `shield-body-${uid}`;
  const rim = `shield-rim-${uid}`;
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      width={size}
      height={size}
      aria-label="საპატრულო ჯარიმები"
      role="img"
    >
      <defs>
        <linearGradient id={rim} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#FCA311" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>
        <radialGradient id={body} cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#2b4274" />
          <stop offset="60%" stopColor="#14213D" />
          <stop offset="100%" stopColor="#0c1527" />
        </radialGradient>
      </defs>
      {/* ჩრდილი */}
      <ellipse cx="32" cy="58" rx="15" ry="2.6" fill="#14213D" opacity="0.14" />
      {/* ფარის ოქროს კიდე */}
      <path
        d="M32 4 L54 12 V30 Q54 48 32 60 Q10 48 10 30 V12 Z"
        fill={`url(#${rim})`}
      />
      {/* ფარის სხეული */}
      <path
        d="M32 8.5 L50 15 V30 Q50 45.5 32 55.5 Q14 45.5 14 30 V15 Z"
        fill={`url(#${body})`}
      />
      {/* ბზინვარება */}
      <path d="M32 8.5 L50 15 V24 Q41 17 32 15.5 Z" fill="#fff" opacity="0.1" />
      {/* ძახილის ნიშანი */}
      <rect x="29.6" y="20" width="4.8" height="18" rx="2.4" fill="#FDE047" />
      <circle cx="32" cy="45" r="3" fill="#FDE047" />
    </svg>
  );
};
