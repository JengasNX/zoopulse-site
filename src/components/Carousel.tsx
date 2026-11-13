"use client";

import { useRef, type ReactNode } from "react";

export function Carousel({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <div className="group/car relative">
      <div
        ref={ref}
        aria-label={ariaLabel}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {children}
      </div>

      <button
        onClick={() => scroll(-1)}
        aria-label="Назад"
        className="absolute top-1/2 -left-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:bg-sky-50 opacity-0 group-hover/car:opacity-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 md:flex"
      >
        ‹
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Вперёд"
        className="absolute top-1/2 -right-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:bg-sky-50 opacity-0 group-hover/car:opacity-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 md:flex"
      >
        ›
      </button>
    </div>
  );
}

/* Обёртка для карточки внутри карусели — фиксированная ширина */
export function CarouselItem({ children }: { children: ReactNode }) {
  return (
    <div className="w-[270px] shrink-0 snap-start sm:w-[300px]">{children}</div>
  );
}
