import { Fragment } from "react";
import type { MemberCardData } from "@/features/bands/components/MemberCard";
import { MemberHoverName } from "@/features/bands/components/MemberHoverName";
import type { Characteristic } from "@/features/bands/types";

/** Escapa um texto para usar literalmente numa expressão regular. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Um texto de evento em que cada nome de integrante vira um link com a ficha
 * no hover. Vale o nome completo e o primeiro nome, quando ele é único na
 * banda. Os nomes mais longos são procurados primeiro, para que "Ana Luz" não
 * seja lido como "Ana".
 *
 * @param props.text - O texto do evento, com os nomes já preenchidos.
 * @param props.members - Integrantes que podem aparecer no texto.
 * @param props.catalog - Catálogo de traços (ficha ao passar o mouse).
 */
export function MemberMentions({
  text,
  members,
  catalog,
}: {
  text: string;
  members: MemberCardData[];
  catalog: Map<string, Characteristic>;
}) {
  const named = members.filter((member) => member.name.trim());
  const byName = new Map(named.map((member) => [member.name, member]));
  // O primeiro nome também vale, quando ninguém mais na banda o divide.
  const firstCount = new Map<string, number>();
  for (const member of named) {
    const first = member.name.split(" ")[0];
    firstCount.set(first, (firstCount.get(first) ?? 0) + 1);
  }
  for (const member of named) {
    const first = member.name.split(" ")[0];
    if (first.length >= 3 && firstCount.get(first) === 1 && !byName.has(first)) byName.set(first, member);
  }
  if (byName.size === 0) return <>{text}</>;

  const pattern = new RegExp(
    `(${[...byName.keys()]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join("|")})`,
    "g",
  );

  // `split` com grupo de captura intercala trechos e nomes: os índices ímpares são nomes.
  return (
    <>
      {text.split(pattern).map((part, index) => {
        const member = index % 2 === 1 ? byName.get(part) : undefined;
        return member ? (
          <MemberHoverName key={index} member={member} catalog={catalog} inline />
        ) : (
          <Fragment key={index}>{part}</Fragment>
        );
      })}
    </>
  );
}
