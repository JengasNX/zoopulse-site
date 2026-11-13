import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./chrome.css";
import "./pets.css";
import "./directory.css";
import "./journal.css";
import "./sculpture.css";
import "./information.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/ui";
import { PrivacySettings } from "@/components/PrivacySettings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  openGraph: {
    title: "ЗооПульс — демонстрационная площадка",
    description: "Прототип каталога животных и организаций. Реальные услуги и платежи пока недоступны.",
    locale: "ru_RU",
    type: "website",
  },
  title: {
    default: "ЗооПульс — приюты, зоопарки и ветклиники в одном месте",
    template: "%s · ЗооПульс",
  },
  description:
    "Единая площадка приютов, зоопарков и ветклиник: найдите питомца, помогите сбором, запишитесь к врачу.",
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('zp_theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>
          <a href="#main-content" className="skip-link">Перейти к содержимому</a>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="min-h-screen">
            <aside className="demo-notice">
              Демонстрационная версия · Организации, анкеты и сборы вымышлены. Платежи и отправка заявок не подключены.
            </aside>
            {children}
          </main>
          <Footer />
          <PrivacySettings />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
