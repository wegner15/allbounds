export interface OrderedItem {
  id: number;
  order_index?: number;
}

export interface ReorderResult<T> {
  items: T[];
  orders: { id: number; order_index: number }[];
}

/**
 * Move an item within the currently visible page and compute the new order_index values.
 *
 * The page's existing order_index values are re-used (sorted ascending) and reassigned to the new
 * arrangement. This keeps the moved items inside the slot range of the current page, so other
 * pages are never touched and only the visible rows are sent to the API.
 * Falls back to sequential values if the existing ones are not strictly increasing.
 */
export function reorderPage<T extends OrderedItem>(items: T[], from: number, to: number): ReorderResult<T> | null {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return null;

  const slots = items.map((item) => item.order_index ?? 0);
  const strictlyIncreasing = slots.every((v, i) => i === 0 || v > slots[i - 1]);
  const indices = strictlyIncreasing ? slots : items.map((_, i) => slots[0] + i);

  const moved = [...items];
  const [item] = moved.splice(from, 1);
  moved.splice(to, 0, item);

  const next = moved.map((it, i) => ({ ...it, order_index: indices[i] }));
  const orders = next.map((it) => ({ id: it.id, order_index: it.order_index as number }));
  return { items: next, orders };
}
