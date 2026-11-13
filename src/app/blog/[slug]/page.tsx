import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPost } from "@/lib/blog";

export function generateStaticParams() { return getAllPosts().map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return post ? { title: post.title, description: post.excerpt } : { title: "Статья не найдена" };
}
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const body = post.body.replace(/^# .+\r?\n/m, "");
  const headings = body.split("\n").flatMap((line, index) => /^## /.test(line) ? [{ id: `section-${index + 1}`, title: line.slice(3).replace(/[*_`]/g, "") }] : []);
  const related = getAllPosts().filter(value => value.slug !== slug).slice(0, 2);
  return <div className="directory-page journal-article-page">
    <nav className="pet-breadcrumbs" aria-label="Хлебные крошки"><Link href="/blog">Журнал</Link><span aria-hidden="true">/</span><span>{post.kind}</span></nav>
    <header className="journal-article-header"><div className="journal-article-meta"><span>Редакция Зоопульса</span><span>{post.kind} / {post.minutes} мин</span></div><h1>{post.title}</h1><p>Чтение без спешки. Вопросы о знакомстве, участии и повседневной заботе.</p></header>
    <aside className="journal-draft-note"><span className="directory-overline">Редакционный черновик</span><p>Не проверенная публикация. Организации, кейсы и суммы вымышлены. Отзывы, модерация, платежи и отчёты не подключены. Материал требует фактчекинга; медицинские и юридические утверждения не заменяют консультацию специалиста.</p></aside>
    <div className="journal-reading-layout">
      <aside className="journal-toc"><h2 className="directory-overline">В этом материале</h2>{headings.length ? <nav aria-label="Содержание статьи">{headings.map(heading => <a key={heading.id} href={`#${heading.id}`}>{heading.title}</a>)}</nav> : <p>Одна тема. Один внимательный взгляд.</p>}<Link href="/blog" className="pet-text-button">← Вернуться в журнал</Link></aside>
      <article className="journal-prose" aria-label={post.title}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
          h1: ({ children }) => <h2>{children}</h2>,
          h2: ({ children, node }) => <h2 id={`section-${node?.position?.start.line ?? 0}`}>{children}</h2>,
          a: ({ href, children }) => href?.startsWith("/") && !href.startsWith("//") ? <Link href={href}>{children}</Link> : <a href={href}>{children}</a>,
          table: ({ children }) => <div className="journal-table-scroll" role="region" aria-label="Таблица в статье" tabIndex={0}><table>{children}</table></div>,
          img: ({ src, alt }) => typeof src === "string" ? <img src={src} alt={alt ?? ""} loading="lazy" /> : null,
        }}>{body}</ReactMarkdown>
      </article>
    </div>
    <section className="journal-related"><div className="journal-index-heading"><h2>Продолжить <em>чтение.</em></h2><Link href="/blog" className="pet-text-button">Весь журнал ↗</Link></div><div>{related.map(value => <Link key={value.slug} href={`/blog/${value.slug}`}><span className="directory-overline">{value.kind} / {value.minutes} мин</span><h3>{value.title}</h3><span aria-hidden="true">↗</span></Link>)}</div></section>
  </div>;
}
