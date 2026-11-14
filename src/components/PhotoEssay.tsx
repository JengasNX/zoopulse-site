import { MeetingMark } from "./Brand";
export function PhotoEssay() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return <section className="photo-essay" aria-labelledby="photo-essay-title">
    <header><p className="pet-eyebrow">Визуальные заметки / 01</p><h2 id="photo-essay-title">Увидеть.<br /><em>Не пройти мимо.</em></h2><p>Здесь — лицензированные фотоиллюстрации, не репортаж из приюта и не фотографии подопечных проекта.</p><MeetingMark /></header>
    <figure><img src={`${base}/design-assets/dog.webp`} width="1200" height="1094" loading="lazy" alt="Немецкая овчарка на открытом воздухе" /><figcaption>01 / Внимание к большому.<br /><a href="https://commons.wikimedia.org/wiki/File:German_Shepherd_Dog.jpg">MrPanyGoff / Wikimedia Commons</a></figcaption></figure>
    <figure><img src={`${base}/design-assets/cat.webp`} width="1000" height="1335" loading="lazy" alt="Полосатый кот на светлом фоне" /><figcaption>02 / Место для малого.<br /><a href="https://commons.wikimedia.org/wiki/File:Cat_November_2010-1a.jpg">Alvesgaspar / Wikimedia Commons</a></figcaption></figure>
    <p className="photo-license">Оба снимка: <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>. Уменьшение, WebP и кадрирование; производные — на той же лицензии. Характер и история животных не заявляются.</p>
  </section>;
}
