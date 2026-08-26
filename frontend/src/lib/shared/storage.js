// The public availability state of a single storage (colour) entry.
//
// Four states, derived from two fields:
//   available === true          -> DOSTĘPNY  (in stock, exact count unknown; wins over amount)
//   amount is null/unset        -> ZAPYTAJ   (unknown, ask us)
//   amount is 0                 -> BRAK      (out of stock)
//   amount > 0                  -> the number itself

export const AVAILABLE = 'available';
export const ASK = 'ask';
export const NONE = 'none';
export const AMOUNT = 'amount';

export function parseAmount({ available = false, amount = null } = {}) {
  if (available) return { state: AVAILABLE, label: 'DOSTĘPNY', amount: null };

  const n = Number(amount);
  const unknown = amount === null || amount === undefined || amount === '' || Number.isNaN(n);
  if (unknown) return { state: ASK, label: 'ZAPYTAJ', amount: null };

  if (n <= 0) return { state: NONE, label: 'BRAK', amount: 0 };
  return { state: AMOUNT, label: String(n), amount: n };
}
