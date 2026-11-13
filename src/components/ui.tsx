"use client";

import { useEffect, useState, useRef, useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── Фото с fallback-заглушкой ── */
export function SafeImg({
  src,
  alt,
  emoji = "🐾",
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  emoji?: string;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  // Один повтор при ошибке: справляется с временными rate-limit фото-хостингов
  useEffect(() => {
    if (attempt === 0) return;
    if (attempt > 2) {
      setFailed(true);
      return;
    }
    const t = setTimeout(() => {
      const el = imageRef.current;
      if (el) el.src = `${src}${src.includes("?") ? "&" : "?"}r=${attempt}`;
    }, 1500);
    return () => clearTimeout(t);
  }, [attempt, src]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-sky-200 via-sky-100 to-indigo-200 text-6xl dark:from-slate-800 dark:via-slate-700 dark:to-sky-950 ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="drop-shadow">{emoji}</span>
      </div>
    );
  }
  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      loading="lazy"
      data-retry={src}
      onError={() => setAttempt((a) => a + 1)}
      className={`object-cover ${className} ${imgClassName}`}
    />
  );
}

/* ── Модальное окно ── */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab") return;
      const nodes = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select, textarea, [tabindex="0"]'
      ) ?? []).filter(el => el.getClientRects().length > 0);
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first) { e.preventDefault(); return; }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panelRef.current)) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(frame);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90dvh] overflow-y-auto w-full max-w-lg rounded-3xl bg-surface p-6 shadow-2xl sm:p-8 dark:bg-slate-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id={titleId} className="text-xl font-bold">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Закрыть"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Анимированная галочка успеха ── */
export function SuccessCheck({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 py-6 text-center"
    >
      <svg viewBox="0 0 52 52" className="h-20 w-20">
        <motion.circle
          cx="26"
          cy="26"
          r="24"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.path
          fill="none"
          stroke="#38bdf8"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l8 8 16-16"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
        />
      </svg>
      <p className="text-lg font-semibold">{message}</p>
    </motion.div>
  );
}

/* ── Прогресс-бар ── */
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500"
        />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-sky-600 dark:text-sky-400">
          {value.toLocaleString("ru-RU")} ₽
        </span>
        <span>{pct}% из {max.toLocaleString("ru-RU")} ₽</span>
      </div>
    </div>
  );
}

/* ── Бейдж с тултипом ── */
export function Badge({
  children,
  tooltip,
  tone = "sky",
}: {
  children: ReactNode;
  tooltip?: string;
  tone?: "sky" | "green" | "amber" | "slate";
}) {
  const tones = {
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <span className="group/badge relative inline-flex">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
      >
        {children}
      </span>
      {tooltip && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity delay-150 group-hover/badge:opacity-100 dark:bg-slate-700">
          {tooltip}
        </span>
      )}
    </span>
  );
}

/* ── Счётчик результатов ── */
export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-sky-500 text-white shadow-sm shadow-sky-300 dark:shadow-none"
          : "bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

/* ── Заголовок секции ── */
export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{children}</h2>
      {action}
    </div>
  );
}

/* ── Пустое состояние ── */
export function EmptyState({ emoji = "🔍", title, hint }: { emoji?: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface px-6 py-16 text-center dark:bg-slate-900">
      <span className="text-5xl">{emoji}</span>
      <p className="text-lg font-semibold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

/* ── Скелетон-карточка ── */
export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface dark:bg-slate-900">
      <div className="aspect-[4/3] animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2.5 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

/* ── Кнопка «Наверх» ── */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Наверх"
          className="fixed right-4 bottom-24 sm:bottom-4 z-[80] flex h-11 w-11 items-center justify-center rounded-md bg-sky-600 text-white transition hover:bg-sky-700"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}
