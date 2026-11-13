export function MeetingMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 44" fill="currentColor" aria-hidden="true">
      <path d="M3 41V19C3 9 9 3 17 3h7v9h-7c-3 0-5 3-5 7v22Z" />
      <path d="M37 3v22c0 10-6 16-14 16h-7v-9h7c3 0 5-3 5-7V3Z" />
    </svg>
  );
}

export function Brand({ className = "" }: { className?: string }) {
  return <span className={`brand-lockup ${className}`}><MeetingMark /><span>зоопульс</span></span>;
}
