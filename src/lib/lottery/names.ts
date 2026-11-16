export const MAX_NAMES = 500;

export const SAMPLE_TEXT = [
  "Ана",
  "Бојан",
  "Весна",
  "Гордана",
  "Дејан",
  "Елена",
  "Жељко",
  "Зорица",
  "Иван",
  "Јелена",
  "Катарина",
  "Лазар",
  "Љиљана",
  "Милица",
  "Ненад",
  "Олга",
  "Петар",
  "Радмила",
  "Стефан",
  "Тамара",
].join("\n");

export const LEGACY_SAMPLE_TEXT = [
  "Ана Петровић",
  "Бојан Илић",
  "Весна Костић",
  "Гордана Симић",
  "Дејан Поповић",
  "Елена Марковић",
  "Жељко Стојановић",
  "Зорица Ђорђевић",
  "Иван Радић",
  "Јелена Николић",
  "Катарина Вучетић",
  "Лазар Милошевић",
  "Љиљана Његован",
  "Милица Јовановић",
  "Ненад Павловић",
  "Олга Стевановић",
  "Петар Ковачевић",
  "Радмила Живковић",
  "Стефан Томић",
  "Тамара Лазић",
].join("\n");

export function parseNames(text: string): { names: string[]; truncated: boolean } {
  const names: string[] = [];
  let truncated = false;
  for (const line of text.split(/\r?\n/)) {
    const name = line.trim();
    if (!name) continue;
    if (names.length >= MAX_NAMES) {
      truncated = true;
      break;
    }
    names.push(name);
  }
  return { names, truncated };
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Unbiased random subset, in draw order. */
export function planDraw(names: string[], count: number, seed: number): string[] {
  const arr = names.slice();
  const rand = mulberry32(seed || 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr.slice(0, Math.max(0, Math.min(count, arr.length)));
}
