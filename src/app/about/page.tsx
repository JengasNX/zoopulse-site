import type { Metadata } from "next";
import Link from "next/link";
import { MeetingMark } from "@/components/Brand";
import { AboutFaq } from "./faq";

export const metadata: Metadata = { title: "О платформе", description: "Зоопульс — независимый проект для знакомства с питомцами, участия и повседневной заботы." };
export default function AboutPage() {
  return <div className="directory-page">
    <header className="directory-heading"><div><p className="directory-overline">Зоопульс / о платформе</p><h1>Быть рядом —<br /><em>уже начало.</em></h1></div><p>Независимая платформа заботы.<br />Из Калининграда — для всей России.<span>Сейчас — интерактивный прототип.</span></p></header>
    <section className="about-statement"><MeetingMark /><div><p className="directory-overline">Что мы строим</p><h2>Место встречи.<br />Неравнодушных.</h2><p>Человеку нужен понятный путь к помощи. Организации — возможность рассказать о питомцах, работе и текущих потребностях. Зоопульс готовится соединить эти задачи в одном пространстве.</p></div></section>
    <div className="about-paths"><section><p className="directory-overline">Для людей</p><h2>Найти своего.<br /><em>Выбрать участие.</em></h2><ol><li><strong>Присмотритесь</strong><p>Изучите анкеты, характер и условия будущего дома.</p></li><li><strong>Сохраните и сравните</strong><p>Избранное и сравнение помогают вернуться к выбору без спешки.</p></li><li><strong>Познакомьтесь с процессом</strong><p>Пока формы учебные. В рабочей версии следующий шаг — разговор с организацией.</p></li></ol><Link href="/animals" className="pet-primary-button">Открыть каталог ↗</Link></section><section><p className="directory-overline">Для организаций / план</p><h2>Показать работу.<br /><em>Встретить поддержку.</em></h2><ol><li><strong>Профиль и проверка</strong><p>В плане — регистрация представителя и модерация сведений.</p></li><li><strong>Питомцы и потребности</strong><p>После одобрения можно будет публиковать анкеты и обновлять информацию.</p></li><li><strong>Настоящие заявки</strong><p>Серверный MVP должен доставлять заявки в кабинет, а не только показывать анимацию успеха.</p></li></ol><Link href="/orgs" className="pet-text-button">Посмотреть устройство профилей ↗</Link></section></div>
    <AboutFaq />
    <aside className="directory-bottom-note"><span className="directory-overline">Прозрачность</span><p>Организации, истории, цены и сборы вымышлены. Реквизиты будущего оператора не утверждены. <Link href="/legal/privacy" className="pet-text-button">Обработка данных ↗</Link></p></aside>
  </div>;
}
