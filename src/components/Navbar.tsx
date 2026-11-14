"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import { ThemeToggle, useFavorites } from "./providers";

const links = [
  { href: "/animals", label: "Найти питомца" },
  { href: "/orgs", label: "Организации" },
  { href: "/clinics", label: "Клиники" },
  { href: "/fundraisers", label: "Помочь" },
  { href: "/events", label: "События" },
  { href: "/listings", label: "Объявления" },
  { href: "/blog", label: "Журнал" },
  { href: "/compare", label: "Сравнение" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useFavorites();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, []);
  return <>
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" aria-label="Зоопульс — главная"><Brand /></Link>
        <nav className="desktop-navigation" aria-label="Основная навигация">
          {links.filter(link => !["/listings", "/events", "/clinics", "/compare"].includes(link.href)).map(link => <Link aria-current={pathname.startsWith(link.href) ? "page" : undefined} key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="header-actions"><Link href="/favorites" className="header-favorites" aria-label={`Избранное: ${count}`}><Icon name="heart" />{count > 0 && <span className="favorite-count">{count}</span>}</Link><button aria-expanded={open} aria-controls="site-menu" aria-label={open ? "Закрыть меню" : "Открыть меню"} onClick={() => setOpen(value => !value)} className="site-menu-button"><span>{open ? "Закрыть" : "Меню"}</span><Icon name={open ? "close" : "menu"} /></button></div>
      </div>
      {open && <nav id="site-menu" className="expanded-navigation" aria-label="Все разделы">
        {links.map((link, i) => <Link key={link.href} href={link.href} aria-current={pathname.startsWith(link.href) ? "page" : undefined} onClick={() => setOpen(false)}><span>0{i + 1}</span>{link.label}<span aria-hidden="true">↗</span></Link>)}
        <div className="menu-extra"><Link href="/about" onClick={() => setOpen(false)}>О платформе</Link><span>Настройки темы <ThemeToggle /></span></div>
      </nav>}
    </header>
    <nav className="mobile-bottom-navigation" aria-label="Быстрая навигация">
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}><Icon name="home" />Главная</Link>
      <Link href="/search" aria-current={pathname === "/search" ? "page" : undefined}><Icon name="search" />Поиск</Link>
      <Link href="/favorites" aria-current={pathname === "/favorites" ? "page" : undefined}><Icon name="heart" />Избранное{count > 0 ? ` (${count})` : ""}</Link>
      <button aria-expanded={open} aria-controls="site-menu" onClick={() => { setOpen(value => !value); window.scrollTo({ top: 0, behavior: "instant" }); }}><Icon name={open ? "close" : "menu"} />Меню</button>
    </nav>
  </>;
}
