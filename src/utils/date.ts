export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function prettyDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${m}月${d}日 · ${weekdays[date.getDay()]}`;
}

export function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

export function sumCalories<T extends { calories: number }>(
  items: T[],
): number {
  return items.reduce((acc, it) => acc + (Number(it.calories) || 0), 0);
}
