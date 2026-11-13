"use client";

import Link from "next/link";
import { animals, ageLabel, getOrg, sexLabels, statusLabels } from "@/data";
import type { Animal } from "@/data/types";
import { useComparison } from "@/components/comparison";
import { SafeImg } from "@/components/ui";

const rows: { title: string; value: (animal: Animal) => string }[] = [
  { title: "Возраст", value: animal => ageLabel(animal.age) },
  { title: "Пол", value: animal => sexLabels[animal.sex] },
  { title: "Город", value: animal => animal.city },
  { title: "Порода", value: animal => animal.breed },
  { title: "Характер", value: animal => animal.description },
  { title: "Подходящий дом", value: () => "Индивидуальные условия уточняются у организации." },
  { title: "Вакцинация", value: animal => animal.vaccinated ? "Отмечена в демо-анкете" : "Не отмечена" },
  { title: "Стерилизация", value: animal => animal.sterilized ? "Отмечена в демо-анкете" : "Не отмечена" },
  { title: "Статус", value: animal => statusLabels[animal.status] },
  { title: "Организация", value: animal => getOrg(animal.orgId)?.name ?? "Не указана" },
];

export function ComparisonPage() {
  const { ids, ready, toggle, clear } = useComparison();
  const selected = ids.map(id => animals.find(animal => animal.id === id)).filter((animal): animal is Animal => !!animal);
  return <div className="pet-page">
    <header className="pet-page-heading"><div><p className="pet-eyebrow">Решение без спешки</p><h1>Разные характеры.<br /><em>Один будущий дом.</em></h1></div><p>До трёх анкет рядом.<br />Без рейтингов «лучше» и «хуже» —<br />только то, что важно для вашей жизни.</p></header>
    <div className="pet-compare-toolbar"><Link href="/animals" className="pet-text-button">← Вернуться к выбору</Link>{selected.length > 0 && <button className="pet-text-button" onClick={clear}>Очистить сравнение</button>}</div>
    {!ready ? <p role="status" className="pet-muted">Загружаем ваш выбор…</p> : selected.length === 0 ? <div className="pet-empty"><p className="pet-eyebrow">Пока никого не выбрали</p><h2>Начните со знакомства.</h2><p>Нажмите «К сравнению» на двух или трёх карточках питомцев. Ваш выбор сохранится в этом браузере.</p><Link className="pet-primary-button" href="/animals">Открыть каталог ↗</Link></div> : <>
      <p className="pet-comparison-note" role="status">Выбрано: {selected.length} из 3. {selected.length === 1 ? "Можно добавить ещё двух питомцев." : "На узком экране таблицу можно прокрутить в сторону."} Все анкеты демонстрационные.</p>
      <div className="pet-comparison-scroll" role="region" aria-label="Таблица сравнения питомцев, горизонтальная прокрутка" tabIndex={0}>
        <table className="pet-comparison-table"><caption className="sr-only">Сравнение выбранных питомцев</caption><thead><tr><th scope="col"><span className="pet-eyebrow">Каждому — свой человек</span><p>Важны<br />детали.</p></th>{selected.map(animal => <th scope="col" key={animal.id}><Link href={`/animals/${animal.id}`}><SafeImg src={animal.image} alt={animal.name} emoji="Фото" className="pet-comparison-photo" /><span className="pet-comparison-name">{animal.name} ↗</span></Link><button onClick={() => toggle(animal.id)} aria-label={`Убрать из сравнения: ${animal.name}`} className="pet-text-button">Убрать ×</button></th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.title}><th scope="row">{row.title}</th>{selected.map(animal => <td key={animal.id}>{row.value(animal)}</td>)}</tr>)}<tr><th scope="row">Следующий шаг</th>{selected.map(animal => <td key={animal.id}><Link className="pet-text-button" href={`/animals/${animal.id}`}>Посмотреть анкету ↗</Link></td>)}</tr></tbody>
        </table>
      </div>
    </>}
  </div>;
}
