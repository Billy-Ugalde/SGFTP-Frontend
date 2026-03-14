const MAX_RECENT = 8;

const storageKey = (userId: number) => `admin_recent_modules_${userId}`;

export interface RecentEntry {
  key: string;
  visitedAt: number;
}

export function getRecentModules(userId: number): RecentEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as RecentEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordModuleVisit(userId: number, key: string): void {
  const entries = getRecentModules(userId).filter((e) => e.key !== key);
  entries.unshift({ key, visitedAt: Date.now() });
  localStorage.setItem(
    storageKey(userId),
    JSON.stringify(entries.slice(0, MAX_RECENT))
  );
}

export function getRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins < 1)   return 'Ahora mismo';
  if (mins < 60)  return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}
