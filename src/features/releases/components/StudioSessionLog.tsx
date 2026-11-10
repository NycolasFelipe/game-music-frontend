/** Uma sessão de estúdio já decidida, pronta para o registro. */
export interface StudioSessionEntry {
  id: string;
  /** Rótulo da sessão, por exemplo "Sessão 1 · Conflito de visão". */
  heading: string;
  /** A situação, como foi apresentada. */
  prompt: string;
  /** A alternativa escolhida. */
  choice: string;
  /** Efeito na qualidade, quando conhecido (por exemplo "×1,04"). */
  effect?: string;
}

/**
 * O que se decidiu no estúdio, sessão por sessão: o rótulo, a situação entre
 * aspas e, num bloco à parte, a escolha. Serve à ficha de lançamento e à
 * resenha da obra.
 *
 * @param props.entries - As sessões, na ordem em que aconteceram.
 */
export function StudioSessionLog({ entries }: { entries: StudioSessionEntry[] }) {
  return (
    <div className="rv-session-log">
      <div className="rv-kicker">No estúdio</div>
      {entries.length > 0 ? (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>
              <div className="rv-label">{entry.heading}</div>
              <p className="rv-session-prompt">“{entry.prompt}”</p>
              <p className="rv-session-choice">
                <span>
                  Você escolheu
                  {entry.effect && <em className="rv-session-effect"> · qualidade {entry.effect}</em>}
                </span>
                {entry.choice}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rv-caption">Nenhuma sessão difícil. A gravação correu sem drama, o que é quase suspeito.</p>
      )}
    </div>
  );
}
