import { HoverCard } from "@mantine/core";
import { useMemo } from "react";
import type { ReactElement } from "react";
import {
  MemberCard,
  type MemberCardData,
} from "@/features/bands/components/MemberCard";
import { useCharacteristics } from "@/features/bands/hooks/useBandOptions";
import type { Characteristic } from "@/features/bands/types";

/**
 * Conteúdo da ficha flutuante. Fica num componente próprio para o catálogo de
 * traços só ser buscado quando a ficha abre.
 *
 * @param props.member - O integrante mostrado.
 * @returns O cartão do integrante em layout lateral.
 */
function MemberHoverContent({ member }: { member: MemberCardData }) {
  const { data: characteristics } = useCharacteristics();
  const catalog = useMemo(
    () =>
      new Map<string, Characteristic>(
        (characteristics ?? []).map((trait) => [trait.id, trait]),
      ),
    [characteristics],
  );
  return <MemberCard member={member} catalog={catalog} layout="side" />;
}

/**
 * Mostra a ficha do integrante (o cartão do Elenco, em layout lateral) ao
 * passar o mouse sobre qualquer elemento que o representa num modal: o botão
 * de convidado, a ficha de crédito, a linha de um seletor. O elemento continua
 * clicável como antes; a ficha só aparece por cima.
 *
 * @param props.member - O integrante mostrado na ficha.
 * @param props.children - O elemento que dispara a ficha. Precisa aceitar `ref`
 *   (botão nativo ou componente do Mantine).
 * @returns O elemento com a ficha flutuante.
 */
export function MemberHoverCard({
  member,
  children,
}: {
  member: MemberCardData;
  children: ReactElement;
}) {
  return (
    <HoverCard
      width={500}
      shadow="md"
      withArrow
      openDelay={350}
      closeDelay={80}
      position="right-start"
      middlewares={{ flip: true, shift: { padding: 12 } }}
    >
      <HoverCard.Target>{children}</HoverCard.Target>
      <HoverCard.Dropdown p={0} style={{ pointerEvents: "none" }}>
        <MemberHoverContent member={member} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
