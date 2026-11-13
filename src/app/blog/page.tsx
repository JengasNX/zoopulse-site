import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { JournalIndex } from "@/components/JournalIndex";

export const metadata: Metadata = {
  title: "Журнал",
  description: "Журнал Зоопульса: знакомство с питомцами, участие в жизни приютов и повседневная забота.",
};
export default function BlogPage() {
  const posts = getAllPosts().map(({ slug, title, kind, excerpt, minutes }) => ({ slug, title, kind, excerpt, minutes }));
  return <div className="directory-page journal-page"><header className="directory-heading"><div><p className="directory-overline">Журнал Зоопульса / редакция</p><h1>Знать больше.<br /><em>Заботиться лучше.</em></h1></div><p>Практика, наблюдения и вопросы,<br />с которых начинается внимательное<br />отношение к животным.</p></header>
    <aside className="journal-draft-note"><span className="directory-overline">До публикации</span><p>Материалы — редакционные черновики для прототипа. Кейсы и суммы вымышлены, утверждения требуют фактчекинга. Это не медицинские или юридические рекомендации.</p></aside>
    <JournalIndex posts={posts} />
  </div>;
}
