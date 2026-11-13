"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal, SuccessCheck } from "./ui";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-xs text-rose-500">{error}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-sky-500 dark:focus:ring-sky-950";

/* ── Заявка на усыновление ── */
export function AdoptionFormModal({
  open,
  onClose,
  animalName,
}: {
  open: boolean;
  onClose: () => void;
  animalName: string;
}) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  useEffect(() => { if (open) { setSent(false); setErrors({}); } }, [open, animalName]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errs: typeof errors = {};
    if (!String(data.get("name")).trim()) errs.name = "Укажите имя";
    if (!/^\+?[\d\s()-]+$/.test(String(data.get("phone")).trim()) ||
        !/^\d{7,15}$/.test(String(data.get("phone")).replace(/\D/g, "")))
      errs.phone = "Укажите корректный телефон";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSent(true);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Заявка на усыновление · ${animalName}`}>
      {sent ? (
        <SuccessCheck message="Демонстрация завершена. Данные никуда не отправлены, приют не получит заявку." />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm">Демо-форма: не вводите настоящие персональные данные. Ничего не отправляется и не сохраняется.</p>
          <Field label="Ваше имя" error={errors.name}>
            <input name="name" maxLength={100} aria-invalid={Boolean(errors.name)} className={inputCls} placeholder="Анна" />
          </Field>
          <Field label="Телефон" error={errors.phone}>
            <input name="phone" type="tel" maxLength={30} aria-invalid={Boolean(errors.phone)} className={inputCls} placeholder="+7 (___) ___-__-__" />
          </Field>
          <Field label="Пара слов о себе (необязательно)">
            <textarea
              name="message"
              rows={3}
              maxLength={2000}
              className={inputCls}
              placeholder="Расскажите о ваших условиях, опыте с животными…"
            />
          </Field>
          <button className="w-full rounded-full bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">
            Отправить заявку
          </button>
        </form>
      )}
    </Modal>
  );
}

/* ── Запись в клинику ── */
export function BookModal({
  open,
  onClose,
  clinicName,
  serviceName,
}: {
  open: boolean;
  onClose: () => void;
  clinicName: string;
  serviceName?: string;
}) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  useEffect(() => { if (open) { setSent(false); setErrors({}); } }, [open, clinicName, serviceName]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errs: typeof errors = {};
    if (!String(data.get("name")).trim()) errs.name = "Укажите имя";
    if (!/^\+?[\d\s()-]+$/.test(String(data.get("phone")).trim()) ||
        !/^\d{7,15}$/.test(String(data.get("phone")).replace(/\D/g, "")))
      errs.phone = "Укажите корректный телефон";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSent(true);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Запись · ${clinicName}`}>
      {sent ? (
        <SuccessCheck message="Демонстрация завершена. Запись не создана, клиника не получит ваши данные." />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm">Демо-форма: используйте вымышленные данные. Настоящая запись пока недоступна.</p>
          {serviceName && (
            <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              Услуга: <b>{serviceName}</b>
            </div>
          )}
          <Field label="Ваше имя" error={errors.name}>
            <input name="name" maxLength={100} aria-invalid={Boolean(errors.name)} className={inputCls} placeholder="Анна" />
          </Field>
          <Field label="Телефон" error={errors.phone}>
            <input name="phone" type="tel" maxLength={30} aria-invalid={Boolean(errors.phone)} className={inputCls} placeholder="+7 (___) ___-__-__" />
          </Field>
          <Field label="Имя питомца и вид">
            <input name="pet" className={inputCls} placeholder="Барсик, кот" />
          </Field>
          <Field label="Желаемая дата">
            <input name="date" type="date" className={inputCls} />
          </Field>
          <button className="w-full rounded-full bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">
            Записаться
          </button>
        </form>
      )}
    </Modal>
  );
}

/* ── Донат ── */
const amounts = [100, 300, 500, 1000, 5000];

export function DonateModal({
  open,
  onClose,
  title,
  orgName,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  orgName: string;
}) {
  const [amount, setAmount] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  useEffect(() => { if (open) { setSent(false); setAmount(null); } }, [open, title, orgName]);

  return (
    <Modal open={open} onClose={onClose} title={`Помочь · ${orgName}`}>
      {sent ? (
        <SuccessCheck message="Спасибо! Это демонстрационная версия — настоящая оплата не производится. 💜" />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (amount !== null && Number.isFinite(amount) && amount > 0) setSent(true);
          }}
          className="space-y-4"
        >
          <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            Сбор: <b>{title}</b>
          </div>
          <div className="flex flex-wrap gap-2">
            {amounts.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setAmount(a)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  amount === a
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {a} ₽
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            placeholder="Или своя сумма…"
            onChange={(e) => setAmount(Number(e.target.value) || null)}
            className={inputCls}
          />
          <button
            disabled={amount === null || !Number.isFinite(amount) || amount <= 0}
            className="w-full rounded-full bg-sky-500 py-3 text-sm font-semibold text-white transition enabled:hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Помочь {amount ? `${amount.toLocaleString("ru-RU")} ₽` : ""}
          </button>
        </form>
      )}
    </Modal>
  );
}
