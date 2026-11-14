"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Modal } from "./ui";

const key = "zp_privacy_v1";

export function PrivacySettings() {
  const [banner, setBanner] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null");
      if (!saved || saved.version !== 1) setBanner(true);
      else setAnalytics(saved.analytics === true);
    } catch { setBanner(true); }
  }, []);
  function save(value: boolean) {
    try {
      localStorage.setItem(key, JSON.stringify({ version: 1, analytics: value, updatedAt: new Date().toISOString() }));
      setAnalytics(value);
      setBanner(false);
      setSettings(false);
    } catch {
      // Никакие необязательные ресурсы не подключаются и при недоступном хранилище.
      setBanner(false);
      setSettings(false);
    }
  }
  return <>
    <button onClick={() => setSettings(true)} className="block mx-auto my-4 underline text-sm">
      Настройки хранения данных
    </button>
    {banner && <section aria-label="Настройки Cookie и локального хранилища" className="privacy-banner">
      <p className="text-sm">Сохраняем тему, избранное, сравнение и ваш выбор в браузере. Аналитика и рекламные Cookie не подключены. Внешние фото загружаются с других сайтов.</p>
      <Link href="/legal/cookies" className="text-sm underline">Подробнее</Link>
      <div className="mt-3 flex flex-wrap gap-3">
        <button onClick={() => save(true)} className="rounded-xl border px-3 py-2">Принять все</button>
        <button onClick={() => save(false)} className="rounded-xl border px-3 py-2">Отклонить необязательные</button>
        <button onClick={() => setSettings(true)} className="rounded-xl border px-3 py-2">Настроить</button>
      </div>
    </section>}
    <Modal open={settings} onClose={() => setSettings(false)} title="Настройки хранения данных">
      <p className="text-sm">Технические настройки необходимы для сохранения вашего выбора. Аналитическая система отсутствует: разрешение ниже само по себе ничего не подключает. При изменении состава сервисов потребуется новый запрос согласия.</p>
      <label className="my-4 flex items-center gap-3"><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> Разрешить необязательную аналитику (сейчас не используется)</label>
      <button onClick={() => save(analytics)} className="rounded-xl bg-sky-600 px-4 py-2 text-white">Сохранить выбор</button>
      <button className="mt-4 block underline" onClick={() => save(false)}>Отозвать необязательное согласие</button>
    </Modal>
  </>;
}
