/**
 * Letra de uma alternativa de decisão pelo índice (0 → A, 1 → B…).
 *
 * @param index - Posição da alternativa, a partir de 0.
 * @returns A letra maiúscula.
 */
export function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}
