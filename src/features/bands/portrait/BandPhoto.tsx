import type { ReactNode } from "react";
import { Figure } from "@/features/bands/portrait/Figure";
import type { PortraitSubject } from "@/features/bands/portrait/looks";
import { SceneBackdrop } from "@/features/bands/portrait/SceneBackdrop";
import type { PhotoScene } from "@/types/appearance";

/**
 * Foto da formação em retícula: fileira da frente e de trás alternadas, da
 * esquerda para a direita na ordem da lista (a legenda "da esquerda" usa a
 * mesma ordem).
 *
 * @param props.members - Quem aparece, da esquerda para a direita.
 * @param props.scene - Cenário da foto.
 * @param props.label - Texto alternativo da imagem.
 * @param props.shape - `wide` (4:3) para capas de edição, `square` para a banca.
 * @param props.tag - Etiqueta vermelha no canto.
 */
export function BandPhoto({
  members,
  scene,
  label,
  shape = "wide",
  tag,
}: {
  members: PortraitSubject[];
  scene: PhotoScene;
  label: string;
  shape?: "wide" | "square";
  tag?: ReactNode;
}) {
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
      node: (
        <g
          key={member.id}
          transform={`translate(${(cx - 60 * s).toFixed(1)} ${(headY - 70 * s).toFixed(1)}) scale(${s.toFixed(3)})`}
        >
          <Figure subject={member} />
        </g>
      ),
    };
  });

  return (
    <div className={`rv-photo ${shape === "square" ? "rv-sq" : ""}`}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
        <SceneBackdrop scene={scene} w={w} h={h} />
        {placed.filter((p) => p.back).map((p) => p.node)}
        {placed.filter((p) => !p.back).map((p) => p.node)}
      </svg>
      {tag && <div className="rv-tag">{tag}</div>}
    </div>
  );
}
