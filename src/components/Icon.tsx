import type { SVGProps } from "react";
const paths = {
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  home: "m3 10 9-7 9 7v11h-6v-7H9v7H3Z",
  menu: "M3 6h18M3 12h18M3 18h18",
  close: "m5 5 14 14M19 5 5 19",
  plus: "M12 4v16M4 12h16",
  check: "m4 12 5 5L20 6",
  filter: "M4 6h16M7 12h10M10 18h4",
  health: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z",
  compare: "M5 20V10M12 20V4M19 20v-7",
  arrow: "M5 19 19 5M5 5h14v14",
  up: "M12 20V4m-7 7 7-7 7 7",
};
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}
