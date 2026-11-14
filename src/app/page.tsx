import Link from "next/link";
import Image from "next/image";
import { animals, events, fundraisers, orgs, orgTypeLabels } from "@/data";
import { getAllPosts } from "@/lib/blog";
import { PetCard } from "@/components/PetCard";
import { SearchWithSuggestions } from "@/components/SearchWithSuggestions";
import { MeetingMark } from "@/components/Brand";
import { HomeFundraisers } from "@/components/HomeFundraisers";
import { MeetingSculpture } from "@/components/MeetingSculpture";
import { PhotoEssay } from "@/components/PhotoEssay";
import styles from "./home.module.css";

const directions = [
  { index: "01 / ЗНАКОМСТВО", title: <>Дом начинается<br />с человека.</>, description: "Смотрите анкеты, знакомьтесь с характером питомца и условиями будущего дома.", href: "/animals" },
  { index: "02 / УЧАСТИЕ", title: <>Помощь бывает<br />разной.</>, description: "Время, вещи, знания или пожертвование напрямую приюту. Найдите свой способ.", href: "/fundraisers" },
  { index: "03 / ПОВСЕДНЕВНОСТЬ", title: <>Для тех,<br />кто уже рядом.</>, description: "Ветеринарные клиники, полезные материалы и события вашего города.", href: "/clinics" },
];

export default function Home() {
  const pets = animals.filter(a => a.status === "available").slice(0, 4);
  const posts = getAllPosts().slice(0, 3);
  return <div className={styles.home}>
    <section className={styles.hero}>
      <div className={styles.kicker}><span>Платформа заботы о животных</span><span>Из Калининграда — для всей России</span></div>
      <div className={styles.heroScene}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}><span>Рядом с теми,</span><span>кому нужен</span><em>человек.</em></h1>
          <p className={styles.intro}>Найти своего питомца. Поддержать приют.<br />Позаботиться о том, кто уже рядом.<br />Одна платформа — разные способы участия.</p>
          <div className={styles.heroActions}><Link className={styles.button} href="/animals">Найти питомца <span aria-hidden="true">↗</span></Link><Link className={styles.underlined} href="/fundraisers">Я хочу помочь</Link></div>
        </div>
        <figure className={styles.portrait}>
          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/design-assets/portrait.jpg`} alt="Щенок золотистого ретривера. Фотоиллюстрация, не объявление." width={800} height={965} sizes="(max-width: 700px) 75vw, 32vw" preload />
          <span className={styles.verticalLabel}>ИСТОРИЯ ЗНАКОМСТВА / 001</span>
          <figcaption><strong>У каждого — свой человек.</strong><Link href="/animals">Найти своего ↗</Link></figcaption>
          <p className={styles.photoNote}>Фотоиллюстрация. Не реальный подопечный.</p>
        </figure>
      </div>
      <div className={styles.search}>
        <p className={styles.overline}>С чего начнём?</p>
        <SearchWithSuggestions />
        <div className={styles.quickLinks}>{[
          ["/animals", "Все питомцы"], ["/animals?species=dog", "Собаки"], ["/animals?species=cat", "Кошки"], ["/clinics", "Клиники"], ["/orgs", "Организации"], ["/events", "События"],
        ].map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</div>
      </div>
    </section>

    <div className={styles.poster}><span>Быть рядом.</span><MeetingMark /><span>Делать больше.</span></div>
    <nav className={styles.directions} aria-label="Направления платформы">{directions.map(d => <Link href={d.href} key={d.index}><span className={styles.overline}>{d.index}</span><h2>{d.title}<span aria-hidden="true">↗</span></h2><p>{d.description}</p></Link>)}</nav>

    <section className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.overline}>01 / Найти друг друга</p><h2>У каждого свой <em>характер.</em></h2></div><Link href="/animals" className={styles.underlined}>Все питомцы ↗</Link></div>
      <p className={styles.sectionNote}>Демонстрационные анкеты. Реальные приюты и подопечные пока не подключены.</p>
      <div className={styles.pets}>{pets.map(pet => <PetCard key={pet.id} animal={pet} />)}</div>
    </section>

    <section className={styles.manifesto}><div><p className={styles.overline}>Забота не измеряется только деньгами</p><h2>Ваше время.<br />Чей-то <em>целый мир.</em></h2><p>Погулять с собакой. Привезти корм. Помочь приюту с фотографиями. Участие начинается с того, что вы можете сделать.</p><Link href="/orgs" className={styles.underlined}>Найти организацию и узнать, что нужно ↗</Link></div><MeetingSculpture /></section>

    <section className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.overline}>02 / Поддержать</p><h2>У помощи есть <em>адрес.</em></h2></div><Link href="/fundraisers" className={styles.underlined}>Все сборы ↗</Link></div>
      <p className={styles.sectionNote}>В будущем пожертвования будут поступать напрямую приютам. Сейчас суммы и сборы — учебные примеры; оплаты нет.</p>
      <HomeFundraisers fundraisers={fundraisers.slice(0, 3)} />
    </section>

    <section className={`${styles.section} ${styles.organizations}`}>
      <div><p className={styles.overline}>03 / Люди и места</p><h2>Те, кто<br /><em>рядом.</em></h2><p className={styles.sectionNote}>Приюты, клиники и зоопарки.<br />Пока — примеры устройства каталога.</p><Link href="/orgs" className={styles.underlined}>Каталог организаций ↗</Link></div>
      <div className={styles.orgList}>{orgs.slice(0, 5).map((org, index) => <Link key={org.id} href={`/orgs/${org.id}`}><span className={styles.orgIndex}>0{index + 1}</span><div><h3>{org.name}</h3><p>{org.city} / {orgTypeLabels[org.type]} / демо</p></div><span aria-hidden="true">↗</span></Link>)}</div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.overline}>04 / Журнал</p><h2>Знать больше.<br /><em>Заботиться лучше.</em></h2></div><Link href="/blog" className={styles.underlined}>Все материалы ↗</Link></div>
      <p className={styles.sectionNote}>Редакционные черновики: требуют фактчекинга перед публикацией.</p>
      <div className={styles.journal}>{posts.map((post, i) => <Link href={`/blog/${post.slug}`} key={post.slug} className={i === 0 ? styles.leadArticle : ""}><div className={styles.articleTop}><span>{post.kind}</span><span>{post.minutes} мин</span></div><span className={styles.articleNumber}>0{i + 1}</span><h3>{post.title}</h3><p>{post.excerpt}</p><span className={styles.articleArrow} aria-hidden="true">↗</span></Link>)}</div>
    </section>

    <section className={styles.section}><div className={styles.sectionHeading}><div><p className={styles.overline}>05 / Встретиться</p><h2>Повод выйти <em>из дома.</em></h2></div><Link href="/events" className={styles.underlined}>Все события ↗</Link></div><div className={styles.eventList}>{events.slice(0, 3).map(event => <Link key={event.id} href={`/orgs/${event.orgId}`}><time dateTime={event.date}>{new Date(event.date + "T12:00:00Z").toLocaleDateString("ru-RU", { day: "numeric", month: "short", timeZone: "UTC" })}</time><div><h3>{event.title}</h3><p>{event.city} · Демо-событие</p></div><span>{event.price === null ? "Бесплатно" : `${event.price} ₽`} ↗</span></Link>)}</div></section>

    <section className={styles.join}><p className={styles.overline}>Для организаций</p><h2>Больше видимости.<br /><em>Больше участия.</em></h2><div><p>Готовим площадку, где приюты, клиники и зоопарки смогут рассказывать о своей работе. Посмотрите, как устроен проект.</p><Link className={styles.button} href="/about">О платформе ↗</Link></div></section>
    <p className={styles.credits}>Фото на первом экране: <a href="https://commons.wikimedia.org/wiki/File:Golde33443.jpg">Golden Trvs Gol twister</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>. Кадрирование и цветовая обработка — на той же лицензии. Остальные фото из учебных карточек требуют отдельной проверки перед запуском.</p>
    <PhotoEssay />
  </div>;
}
