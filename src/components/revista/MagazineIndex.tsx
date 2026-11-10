import { Link } from "react-router-dom";

/** Uma seção do índice da revista. */
export interface MagazineSection {
  /** Caminho de destino. */
  to: string;
  label: string;
  /** Se é a seção aberta. */
  active: boolean;
}

/**
 * Índice da revista (ADR-0002): a navegação entre seções, com o número de
 * página de enfeite.
 *
 * @param props.sections - Seções na ordem de leitura.
 */
export function MagazineIndex({ sections }: { sections: MagazineSection[] }) {
  return (
    <nav className="rv-index" aria-label="Seções">
      {sections.map((section, i) => (
        <Link
          key={section.to}
          to={section.to}
          className={section.active ? "rv-on" : undefined}
          aria-current={section.active ? "page" : undefined}
        >
          <span className="rv-pg">p.{String(i * 4 + 1).padStart(2, "0")}</span>
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
