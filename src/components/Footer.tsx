import Link from "next/link";
import { Brand } from "./Brand";

const columns = [
  { title: "Платформа", items: [
    ["/animals", "Найти питомца"], ["/orgs", "Организации"], ["/clinics", "Клиники"],
    ["/fundraisers", "Помочь"], ["/events", "События"], ["/listings", "Объявления"],
    ["/blog", "Журнал"], ["/favorites", "Избранное"], ["/compare", "Сравнение питомцев"],
  ] },
  { title: "Информация", items: [
    ["/about", "О проекте"], ["/about#faq", "Вопросы и ответы"],
    ["/legal/privacy", "Конфиденциальность"], ["/legal/terms", "Пользовательское соглашение"],
    ["/legal/refunds", "Отмена и возврат"], ["/legal/cookies", "Cookie и хранилище"],
  ] },
];

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-top"><div className="footer-intro"><Link href="/" aria-label="Зоопульс — главная"><Brand /></Link><p>Рядом с теми, кому нужен человек.<br />Платформа для знакомства, участия<br />и повседневной заботы.</p></div>
      {columns.map(column => <section className="footer-column" key={column.title}><h2>{column.title}</h2><ul>{column.items.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></section>)}
    </div>
    <div className="footer-signature" aria-hidden="true">быть рядом.</div>
    <div className="footer-bottom"><span>Калининград → вся Россия</span><span>Демонстрационный проект. Все анкеты и сборы вымышлены. © 2026</span></div>
  </footer>;
}
