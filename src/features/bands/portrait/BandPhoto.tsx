import { useState } from "react";
import type { ReactNode } from "react";
import { Figure } from "@/features/bands/portrait/Figure";
import type { PortraitSubject } from "@/features/bands/portrait/looks";
import { SceneBackdrop } from "@/features/bands/portrait/SceneBackdrop";
import type { PhotoScene } from "@/types/appearance";

/**
 * Foto da formação em retícula: fileira da frente e de trás alternadas, da
 * esquerda para a direita na ordem da lista (a legenda "da esquerda" usa a
 * mesma ordem). Passar o mouse sobre alguém mostra o nome da pessoa.
 *
 * @param props.members - Quem aparece, da esquerda para a direita.
 * @param props.scene - Cenário da foto.
 * @param props.label - Texto alternativo da imagem.
 * @param props.shape - `wide` (4:3) para capas de edição, `square` para a banca.
 * @param props.tag - Etiqueta vermelha no canto.
 * @param props.namesOnHover - Mostra o nome de quem está sob o mouse (desligado na banca).
 */
export function BandPhoto({
  members,
  scene,
  label,
  shape = "wide",
  tag,
  namesOnHover = true,
}: {
  members: PortraitSubject[];
  scene: PhotoScene;
  label: string;
  shape?: "wide" | "square";
  tag?: ReactNode;
  namesOnHover?: boolean;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const w = shape === "square" ? 300 : 400;
  const h = 300;
  const n = Math.max(1, members.length);
  const slot = w / n;
  // Teto de escala: com poucos integrantes a foto não vira close (rosto cortado, retícula grossa).
  const base = Math.min(1.2, (slot / 120) * 1.45);
  const placed = members.map((member, i) => {
    const back = n > 2 && i % 2 === 1;
    const s = base * (back ? 0.9 : 1);
    const cx = slot * (i + 0.5);
    const headY = h * (back ? 0.36 : 0.42);
    return {
      back,
      member,
      cx,
      labelY: headY + 62 * s,
      node: (
        <g
          key={member.id}
          transform={`translate(${(cx - 60 * s).toFixed(1)} ${(headY - 70 * s).toFixed(1)}) scale(${s.toFixed(3)})`}
          onMouseEnter={namesOnHover ? () => setHoveredId(member.id) : undefined}
          onMouseLeave={namesOnHover ? () => setHoveredId((id) => (id === member.id ? null : id)) : undefined}
          style={{ cursor: "default" }}
        >
          <Figure subject={member} />
        </g>
      ),
    };
  });
  const hovered = placed.find((p) => p.member.id === hoveredId);
  const hoveredName = hovered?.member.name ?? "";
  // Largura aproximada da etiqueta: 6,6 unidades por letra no corpo 11, mais a folga.
  const labelW = hoveredName.length * 6.6 + 16;
  const labelX = hovered ? Math.min(Math.max(hovered.cx - labelW / 2, 4), w - labelW - 4) : 0;

  return (
    <div className={`rv-photo ${shape === "square" ? "rv-sq" : ""}`}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
        <SceneBackdrop scene={scene} w={w} h={h} />
        {placed.filter((p) => p.back).map((p) => p.node)}
        {placed.filter((p) => !p.back).map((p) => p.node)}
        {hovered && (
          <g pointerEvents="none">
            <rect x={labelX} y={hovered.labelY} width={labelW} height={18} fill="var(--rv-ink)" />
            <text
              x={labelX + labelW / 2}
              y={hovered.labelY + 12.5}
              textAnchor="middle"
              fill="var(--rv-paper)"
              style={{ font: "700 11px var(--rv-sans)", letterSpacing: ".04em" }}
            >
              {hoveredName}
            </text>
          </g>
        )}
      </svg>
      {tag && <div className="rv-tag">{tag}</div>}
    </div>
  );
}
