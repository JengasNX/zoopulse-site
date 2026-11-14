"use client";
import Link from "next/link";
import { MeetingMark } from "@/components/Brand";
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return <section className="directory-page interface-state" role="alert"><MeetingMark /><p className="pet-eyebrow">Неожиданная ошибка</p><h1>Сделаем ещё<br /><em>одну попытку.</em></h1><p>Страницу не удалось показать. Попробуйте снова или вернитесь в каталог. Повтор может не помочь, если проблема сохраняется.</p><div><button type="button" className="pet-primary-button" onClick={() => retry()}>Попробовать снова</button><Link href="/animals" className="pet-text-button">В каталог ↗</Link></div></section>;
}
