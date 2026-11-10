/**
 * Falas de um integrante sobre um colega, por nível de relação (−5 a 5), para
 * a entrevista do Elenco. São texto de apresentação: o catálogo do backend tem
 * uma só frase por nível, o que repetia a mesma fala para vários colegas.
 * `{nome}` vira o primeiro nome do colega. As falas evitam flexão de gênero de
 * quem fala e de quem é citado.
 */
const OPINIONS: Record<number, string[]> = {
  5: [
    "{nome} é família. Se a banda acabar amanhã, a gente monta outra.",
    "Com {nome} eu nem preciso falar: um olhar e a música muda de tom.",
    "Se {nome} sair, eu saio junto.",
    "Eu daria um rim por {nome}. Talvez os dois.",
    "Nossas mães marcam jantar juntas e comparam fotos de nós bebês.",
  ],
  4: [
    "{nome} é quem eu chamo às três da manhã.",
    "Já dividi quarto de hotel, carona e crise existencial com {nome}.",
    "Quando {nome} sorri no palco, eu sei que o show deu certo.",
    "{nome} sabe todos os meus segredos e ainda me aguenta.",
    "Nossas mães marcam jantar juntas e comparam fotos de nós bebês.",
  ],
  3: [
    "Gosto de compor com {nome}: as ideias encaixam.",
    "{nome} segura a onda quando eu perco a mão.",
    "Já vi {nome} chorar e passar mal no mesmo dia. Isso une.",
    "Confio em {nome} de olhos fechados no palco.",
    "Com {nome} até a viagem de van passa rápido.",
  ],
  2: [
    "{nome} é gente boa. Divide o lanche e não atrasa o ensaio.",
    "Com {nome} o ensaio rende.",
    "A gente se entende bem, sem drama.",
    "Sei que o café de {nome} é com duas de açúcar.",
    "{nome} sempre lembra de trazer cordas extras. Isso conta muito.",
  ],
  1: [
    "{nome}? Gente fina, mas a gente quase não conversa fora do ensaio.",
    "Respeito o trabalho de {nome}.",
    "Dividimos o palco e, às vezes, um pacote de salgadinho.",
    "Ainda estou conhecendo {nome}. Até aqui, tudo certo.",
    "Lidar com {nome} é tranquilo. Não é pouca coisa numa banda.",
  ],
  0: [
    "Sei o nome de {nome} porque está na escala.",
    "{nome} toca, eu toco. É isso.",
    "Não tenho nada contra {nome}. Nem a favor.",
    "A gente se cumprimenta. Às vezes.",
    "Se {nome} faltar ao ensaio, talvez eu note.",
  ],
  [-1]: [
    "{nome} me cansa, mas o contrato manda sorrir.",
    "Aguento {nome} pela música.",
    "Finjo que não me irrito com {nome}. Finjo bem.",
    "Prefiro não comentar sobre {nome}.",
    "{nome} tem talento. Pena que fala tanto.",
  ],
  [-2]: [
    "Divido o palco com {nome}, não a pizza.",
    "{nome} atrasa, desafina e ainda reclama do som.",
    "Toda ideia de {nome} vira meia hora de discussão.",
    "Fico no canto oposto do palco ao de {nome}.",
    "Quando {nome} pega o microfone entre as músicas, eu vou afinar.",
  ],
  [-3]: [
    "Se {nome} começa a falar, eu coloco o fone.",
    "Não consigo ficar na mesma sala que {nome} sem perder a paciência.",
    "Se o navio afundar, {nome} que espere o próximo bote.",
    "Ensaio em outro horário só para não ver a cara de {nome}.",
    "{nome} estraga qualquer música em que põe a mão.",
  ],
  [-4]: [
    "Prefiro lamber um corrimão de metrô a admitir que {nome} tem razão.",
    "Cada nota que {nome} toca é uma provocação.",
    "Já pedi para tirarem {nome} da foto da capa.",
    "Se {nome} ganhar um prêmio, eu não vou à festa.",
    "Com {nome} na banda, cada show é um teste de paciência.",
  ],
  [-5]: [
    "Um dia, eu ou {nome} vai sair desta banda. Torço para ser {nome}.",
    "Não falo com {nome}. Nem pelo empresário.",
    "Troquei a fechadura do estúdio por causa de {nome}.",
    "Se isso fosse um filme de terror, um de nós já estaria no jardim.",
    "Eu toco melhor quando imagino {nome} fora do palco.",
  ],
};

/** Um colega a comentar: id, nome e o nível de relação com quem fala. */
export interface Bandmate {
  id: string;
  name: string;
  level: number;
}

/**
 * Hash simples e estável de um texto (para a escolha não mudar a cada abertura).
 *
 * @param text - O texto.
 * @returns Um inteiro não negativo.
 */
function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (Math.imul(h, 31) + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Escolhe uma fala para cada colega, fixa por par (quem fala, colega) e sem
 * repetir frase dentro da mesma entrevista.
 *
 * @param speakerId - Quem dá a entrevista.
 * @param mates - Os colegas, com o nível de relação de cada um.
 * @returns A fala de cada colega, pelo id.
 */
export function bandmateOpinions(speakerId: string, mates: Bandmate[]): Map<string, string> {
  const used = new Set<string>();
  const result = new Map<string, string>();
  for (const mate of mates) {
    const pool = OPINIONS[Math.max(-5, Math.min(5, Math.round(mate.level)))] ?? OPINIONS[0];
    const start = hash(`${speakerId}:${mate.id}`) % pool.length;
    let text = pool[start];
    for (let step = 0; step < pool.length; step += 1) {
      const candidate = pool[(start + step) % pool.length];
      if (!used.has(candidate)) {
        text = candidate;
        break;
      }
    }
    used.add(text);
    result.set(mate.id, text.replaceAll("{nome}", mate.name.split(" ")[0]));
  }
  return result;
}
