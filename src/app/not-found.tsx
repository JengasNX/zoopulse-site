import Link from "next/link";

export default function NotFound() {
  return <section className="directory-page not-found-page">
    <p className="directory-overline">404 / Не тот адрес</p>
    <h1>Здесь пока<br /><em>никого нет.</em></h1>
    <p>Страница могла переехать или ссылка оказалась неточной.<br />Вернёмся туда, где начинаются знакомства.</p>
    <Link href="/animals" className="pet-primary-button">Найти питомца ↗</Link>
    <Link href="/" className="pet-text-button">На главную</Link>
  </section>;
}
