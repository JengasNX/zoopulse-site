"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ComparisonProvider, ComparisonTray } from "./comparison";

/* ─────────────────────────── Тема ─────────────────────────── */

type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
    try { localStorage.setItem("zp_theme", next); } catch { /* Storage may be disabled. */ }
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
      className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

/* ─────────────────────────── Избранное ─────────────────────────── */

type FavKind = "animal" | "org";
const FavoritesCtx = createContext<{
  favorites: Record<FavKind, string[]>;
  toggle: (kind: FavKind, id: string) => void;
  isFav: (kind: FavKind, id: string) => boolean;
  count: number;
  ready: boolean;
}>({
  favorites: { animal: [], org: [] },
  toggle: () => {},
  isFav: () => false,
  count: 0,
  ready: false,
});

export const useFavorites = () => useContext(FavoritesCtx);

function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [favorites, setFavorites] = useState<Record<FavKind, string[]>>({
    animal: [],
    org: [],
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("zp_favorites");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && Array.isArray(saved.animal) && Array.isArray(saved.org)) {
          setFavorites({
            animal: saved.animal.filter((id: unknown): id is string => typeof id === "string"),
            org: saved.org.filter((id: unknown): id is string => typeof id === "string"),
          });
        }
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = (next: Record<FavKind, string[]>) => {
    setFavorites(next);
    try { localStorage.setItem("zp_favorites", JSON.stringify(next)); } catch { /* Keep in-memory state. */ }
  };

  const toggle = useCallback(
    (kind: FavKind, id: string) => {
      const has = favorites[kind].includes(id);
      const next = {
        ...favorites,
        [kind]: has
          ? favorites[kind].filter((x) => x !== id)
          : [...favorites[kind], id],
      };
      persist(next);
      window.dispatchEvent(
        new CustomEvent("zp-toast", {
          detail: has ? "Удалено из избранного" : "Добавлено в избранное 🐾",
        })
      );
    },
    [favorites]
  );

  const isFav = useCallback(
    (kind: FavKind, id: string) => favorites[kind].includes(id),
    [favorites]
  );

  const count = favorites.animal.length + favorites.org.length;

  return (
    <FavoritesCtx.Provider value={{ favorites, toggle, isFav, count, ready }}>
      {children}
    </FavoritesCtx.Provider>
  );
}

export function FavoriteButton({
  kind,
  id,
  className = "",
}: {
  kind: FavKind;
  id: string;
  className?: string;
}) {
  const { isFav, toggle } = useFavorites();
  const active = isFav(kind, id);
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      animate={active ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 0.3 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(kind, id);
      }}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      aria-pressed={active}
      type="button"
      className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition ${
        active
          ? "bg-white/95 text-rose-500 shadow"
          : "bg-white/70 text-slate-400 opacity-100 hover:text-rose-400 md:opacity-0 md:group-hover:opacity-100"
      } dark:bg-slate-800/80 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </motion.button>
  );
}

/* ─────────────────────────── Тосты ─────────────────────────── */

const ToastCtx = createContext<{ push: (msg: string) => void }>({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => push((e as CustomEvent<string>).detail);
    window.addEventListener("zp-toast", handler);
    return () => window.removeEventListener("zp-toast", handler);
  }, [push]);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div role="status" className="pointer-events-none fixed right-4 bottom-24 sm:bottom-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg dark:bg-sky-500 dark:text-slate-950"
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
      <FavoritesProvider>
        <ToastProvider><ComparisonProvider>{children}<ComparisonTray /></ComparisonProvider></ToastProvider>
      </FavoritesProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
