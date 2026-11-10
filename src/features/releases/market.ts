/**
 * Quanto o mercado ainda paga por uma obra no ano (saturação, ADR-0015 §5 do
 * backend), dito como a revista diria: sem porcentagem, só o clima do público.
 * A frase muda com o degrau da saturação (60%, 35% e 20% do normal), então o
 * jogador ainda sente o tamanho da perda.
 *
 * @param launchesThisYear - Obras já lançadas no ano.
 * @param multiplier - Fração do normal que a próxima obra renderia (0..1).
 * @param subject - Como chamar a obra na frase ("a próxima obra", "esta obra").
 * @returns O aviso e se ele é uma perda (para pintar de vermelho).
 */
export function marketNote(
  launchesThisYear: number,
  multiplier: number,
  subject = "a próxima obra",
): { text: string; penalty: boolean } {
  if (launchesThisYear <= 0 || multiplier >= 1) {
    return {
      text: "Nenhuma obra lançada este ano: o público está com fome de disco novo.",
      penalty: false,
    };
  }
  const Subject = subject.charAt(0).toUpperCase() + subject.slice(1);
  if (multiplier >= 0.5) {
    return {
      text: `O público ainda está decorando o último disco. ${Subject} vai disputar atenção com ele e render bem menos.`,
      penalty: true,
    };
  }
  if (multiplier >= 0.3) {
    return {
      text: `Mais um disco no mesmo ano e a crítica já fala em excesso de produção. ${Subject} chega para um público cansado e vende pouco.`,
      penalty: true,
    };
  }
  return {
    text: `Nem os fãs mais fiéis aguentam tanto disco num ano só. ${Subject} vai sair quase em silêncio.`,
    penalty: true,
  };
}
