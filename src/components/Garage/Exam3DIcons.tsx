import React from 'react';

/**
 * Exam3DIcons — საგამოცდო / საპატრულო მოდულების 3D იკონები.
 * ახლა იყენებს წინასწარ დარენდერებულ 3D PNG-ებს (გამჭვირვალე ფონით),
 * იგივე `size`/`className` API-ით, რომ ყველა არსებული გამოყენება უცვლელად მუშაობდეს.
 */

type IconProps = { size?: number; className?: string };

const BASE = import.meta.env.BASE_URL;

const Icon3D: React.FC<IconProps & { src: string; label: string }> = ({ size, className, src, label }) => (
  <img
    src={src}
    width={size}
    height={size}
    style={size ? { width: size, height: size, objectFit: 'contain' } : { objectFit: 'contain' }}
    className={className}
    alt={label}
    draggable={false}
    loading="lazy"
    decoding="async"
  />
);

export const GraduationCap3D: React.FC<IconProps> = (props) => (
  <Icon3D {...props} src={`${BASE}images/icons/cap-3d.png`} label="ბილეთები" />
);

export const ShieldAlert3D: React.FC<IconProps> = (props) => (
  <Icon3D {...props} src={`${BASE}images/icons/shield-3d.png`} label="ჯარიმები" />
);
