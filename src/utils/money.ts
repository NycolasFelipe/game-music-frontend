/**
 * Formata um valor em dinheiro do jogo com o símbolo "$" na frente, para não
 * ser confundido com fãs, notas ou níveis: `5000` → `$5.000`, `-373` →
 * `−$373`. Arredonda para inteiro, como o caixa é mostrado no resto da revista.
 *
 * @param value - O valor.
 * @param options.signed - Mostra "+" nos positivos (variações, ganhos).
 * @returns O valor formatado em pt-BR.
 */
export function formatMoney(value: number, { signed = false }: { signed?: boolean } = {}): string {
  const rounded = Math.round(value);
  const abs = Math.abs(rounded).toLocaleString("pt-BR");
  if (rounded < 0) return `−$${abs}`;
  return `${signed && rounded > 0 ? "+" : ""}$${abs}`;
}
