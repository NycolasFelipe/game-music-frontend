/**
 * Título de capa com a última palavra em vermelho, como no logotipo de uma
 * revista ("Raio X <em>Fluidez</em>").
 *
 * @param props.title - O nome a compor.
 * @param props.small - Versão menor, para páginas internas.
 */
export function Masthead({ title, small = false }: { title: string; small?: boolean }) {
  const trimmed = title.trim();
  const cut = trimmed.lastIndexOf(" ");
  const head = cut > 0 ? trimmed.slice(0, cut + 1) : "";
  const tail = cut > 0 ? trimmed.slice(cut + 1) : trimmed;
  return (
    <h1 className={`rv-mast ${small ? "rv-small" : ""}`} aria-label={trimmed}>
      {head}
      <em>{tail}</em>
    </h1>
  );
}
