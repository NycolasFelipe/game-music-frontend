/**
 * Quanto o mercado ainda paga por uma obra no ano (saturação, ADR-0015 §5 do
 * backend), dito em linguagem de jogador: sem "×0,6" e sem "mercado cheio",
 * que soava como o contrário do que queria dizer.
 *
 * @param launchesThisYear - Obras já lançadas no ano.
 * @param multiplier - Fração do normal que a próxima obra renderia (0..1).
 * @param subject - Como chamar a obra na frase ("a próxima", "esta").
 * @returns O aviso e se ele é uma perda (para pintar de vermelho).
 */
export function marketNote(
  launchesThisYear: number,
  multiplier: number,
  subject = "a próxima",
): { text: string; penalty: boolean } {
  if (launchesThisYear <= 0) {
    return {
      text: "Nenhuma obra lançada este ano: o público está com fome de disco novo.",
      penalty: false,
    };
  }
  const released =
    launchesThisYear === 1 ? "Já saiu 1 obra" : `Já saíram ${launchesThisYear} obras`;
  return {
    text: `${released} este ano: ${subject} rende ${Math.round(multiplier * 100)}% do normal.`,
    penalty: multiplier < 1,
  };
}
