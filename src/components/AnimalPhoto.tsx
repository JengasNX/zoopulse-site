"use client";
import { useState } from "react";
import { Modal, SafeImg } from "./ui";
export function AnimalPhoto({ src, name }: { src: string; name: string }) {
  const [open, setOpen] = useState(false);
  return <><button className="animal-photo-open" onClick={() => setOpen(true)} aria-label={`Увеличить фото: ${name}`}><SafeImg src={src} alt={`${name} — фотоиллюстрация`} emoji="Фото" className="pet-detail-image" /><span>01 / 01 · Рассмотреть фото ↗</span></button><Modal open={open} onClose={() => setOpen(false)} title={`${name} / фотоиллюстрация`}><div className="animal-photo-large"><SafeImg src={src} alt={`${name} — увеличенное фото`} /><p>Один доступный снимок. Другие ракурсы пока не предоставлены. Фото не подтверждает историю демо-анкеты.</p></div></Modal></>;
}
