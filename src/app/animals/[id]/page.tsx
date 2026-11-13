import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ageLabel, animals, getAnimal, getOrg, sexLabels, speciesLabels, statusLabels } from "@/data";
import { AnimalDetailClient } from "./client";
import { SafeImg } from "@/components/ui";
import { CompareButton } from "@/components/comparison";
import { PetCard } from "@/components/PetCard";

export function generateStaticParams() { return animals.map(animal => ({ id: animal.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const animal = getAnimal(id);
  return animal ? { title: `${animal.name} — ${speciesLabels[animal.species]}`, description: animal.description } : { title: "Животное не найдено" };
}

export default async function AnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const animal = getAnimal(id);
  if (!animal) notFound();
  const org = getOrg(animal.orgId);
  const similar = animals.filter(value => value.id !== id && value.species === animal.species && value.status === "available").slice(0, 3);
  return <div className="pet-page">
    <nav className="pet-breadcrumbs" aria-label="Хлебные крошки"><Link href="/animals">Найти питомца</Link><span aria-hidden="true">/</span><span aria-current="page">{animal.name}</span></nav>
    <div className="pet-detail-layout">
      <div className="pet-detail-visual"><div className="pet-detail-image-wrap"><SafeImg src={animal.image} alt={`${animal.name} — ${animal.breed}`} emoji="Фото" className="pet-detail-image" /><span className="pet-status-label">{statusLabels[animal.status]}</span></div><p className="pet-photo-caption">Демо-анкета / фотоиллюстрация. Порода и история не подтверждены.</p><div className="pet-detail-quote"><span className="pet-eyebrow">Не торопитесь с решением</span><p>Знакомство начинается<br />с <em>внимания.</em></p></div></div>
      <div className="pet-detail-copy"><p className="pet-eyebrow">История знакомства / {id.toUpperCase()}</p><h1>{animal.name}<span>.</span></h1><p className="pet-detail-breed">{animal.breed}</p><dl className="pet-facts"><div><dt>Возраст</dt><dd>{ageLabel(animal.age)}</dd></div><div><dt>Пол</dt><dd>{sexLabels[animal.sex]}</dd></div><div><dt>Город</dt><dd>{animal.city}</dd></div><div><dt>Статус</dt><dd>{statusLabels[animal.status]}</dd></div></dl>
        <section className="pet-detail-section"><h2>01 / Характер</h2><p className="pet-detail-description">{animal.description}</p></section>
        <section className="pet-detail-section"><h2>02 / Подходящий дом</h2><p>Состав семьи, ваш график, опыт с животными и условия дома стоит обсудить с приютом до знакомства. Индивидуальные требования в этой демо-анкете не указаны.</p></section>
        <section className="pet-detail-section"><h2>03 / Здоровье</h2><dl className="pet-health"><div><dt>Вакцинация</dt><dd>{animal.vaccinated ? "Отмечена в демо-анкете" : "Не отмечена в анкете"}</dd></div><div><dt>Стерилизация</dt><dd>{animal.sterilized ? "Отмечена в демо-анкете" : "Не отмечена в анкете"}</dd></div></dl><p className="pet-muted">При реальной передаче уточняйте состояние здоровья и документы у организации. Эти отметки не заменяют заключение ветеринарного врача.</p></section>
        <section className="pet-detail-section"><h2>04 / Знакомство</h2><p>Сначала прочитайте анкету, затем обсудите условия с организацией и договоритесь о встрече. Сейчас можно только посмотреть, как устроена форма: настоящая заявка не отправляется.</p><AnimalDetailClient animalId={animal.id} animalName={animal.name} status={animal.status} /><div className="pet-detail-secondary"><CompareButton id={animal.id} name={animal.name} /><Link href="/favorites">Открыть избранное ↗</Link></div></section>
        {org && <Link className="pet-detail-org" href={`/orgs/${org.id}`}><span className="pet-eyebrow">Организация / демонстрация</span><strong>{org.name}</strong><span>{org.city} / Профиль организации ↗</span></Link>}
      </div>
    </div>
    {similar.length > 0 && <section className="pet-related"><div className="pet-subheading"><div><p className="pet-eyebrow">Другие истории</p><h2>Ещё не все <em>встречи.</em></h2></div><Link href="/animals">Весь каталог ↗</Link></div><div className="pet-related-grid">{similar.map(value => <PetCard key={value.id} animal={value} />)}</div></section>}
  </div>;
}
