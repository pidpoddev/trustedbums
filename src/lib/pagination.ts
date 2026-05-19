export function getPageItems<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, Math.min(page, Math.max(1, Math.ceil(items.length / pageSize))));
  return items.slice((safePage - 1) * pageSize, safePage * pageSize);
}
