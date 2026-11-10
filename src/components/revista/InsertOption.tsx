import type { ReactNode } from "react";

/**
 * Uma alternativa de decisão como item de enquete da revista: a letra em
 * vermelho, a escolha em serifa e a consequência em texto corrido.
 *
 * @param props.letter - Letra da alternativa (A, B, C…).
 * @param props.label - A escolha.
 * @param props.description - O que ela significa.
 * @param props.disabled - Bloqueia enquanto a escolha anterior é aplicada.
 * @param props.onChoose - Chamado ao escolher.
 */
export function InsertOption({
  letter,
  label,
  description,
  disabled = false,
  onChoose,
}: {
  letter: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  onChoose: () => void;
}) {
  return (
    <button type="button" className="rv-option" disabled={disabled} onClick={onChoose}>
      <span className="rv-k" aria-hidden>
        {letter}
      </span>
      <span>
        <b>{label}</b>
        {description && <span className="rv-p">{description}</span>}
      </span>
    </button>
  );
}

