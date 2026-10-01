// The Polish word for a count: "kolor", "kolory", "kolorów"
export function pluralWord(n, one, few, many) {
  const isFew = n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14);
  return n === 1 ? one : isFew ? few : many;
}

// A count with its Polish word: "1 kolor", "3 kolory", "12 kolorów"
export const plural = (n, one, few, many) => `${n} ${pluralWord(n, one, few, many)}`;
