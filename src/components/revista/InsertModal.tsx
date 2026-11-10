import { Modal } from "@mantine/core";
import type { ReactNode } from "react";

/**
 * Encarte da revista (ADR-0002): o modal com papel pontilhado, fio vermelho no
 * topo, um rótulo em versalete e a manchete em serifa. Todo modal do jogo usa
 * esta moldura, para que nenhum encarte "destoe" do resto da edição.
 *
 * @param props.opened - Se o encarte está aberto.
 * @param props.onClose - Fecha o encarte (×, Esc ou clique fora).
 * @param props.label - Linha de rótulo acima da manchete (seção, passo, contagem).
 * @param props.title - Manchete do encarte.
 * @param props.titleSize - Tamanho da manchete: `lg` (capa), `md` ou `sm`.
 * @param props.size - Largura do modal (padrão do Mantine).
 * @param props.centered - Centraliza na vertical.
 * @param props.closeOnClickOutside - Fecha ao clicar fora (padrão: sim).
 * @param props.children - Corpo do encarte.
 */
export function InsertModal({
  opened,
  onClose,
  label,
  title,
  titleSize = "md",
  size = "lg",
  centered = false,
  closeOnClickOutside = true,
  children,
}: {
  opened: boolean;
  onClose: () => void;
  label?: ReactNode;
  title: ReactNode;
  titleSize?: "lg" | "md" | "sm";
  size?: string | number;
  centered?: boolean;
  closeOnClickOutside?: boolean;
  children: ReactNode;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={size}
      centered={centered}
      closeOnClickOutside={closeOnClickOutside}
      padding="xl"
      transitionProps={{ transition: "slide-up", duration: 220 }}
      classNames={{ close: "rv-insert-close" }}
      styles={{
        content: {
          backgroundImage:
            "radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        },
        header: {
          backgroundColor: "var(--rv-paper)",
          backgroundImage:
            "radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          alignItems: "flex-start",
          paddingBottom: 14,
          marginBottom: 18,
          borderBottom: "1px solid var(--rv-ink)",
        },
        title: {
          font: "inherit",
          flex: 1,
          minWidth: 0,
        },
      }}
      title={
        <span style={{ display: "block" }}>
          {label && <span className="rv-label" style={{ display: "block" }}>{label}</span>}
          <span
            className={`rv-head ${titleSize === "lg" ? "" : `rv-${titleSize}`}`}
            style={{ display: "block", margin: "6px 0 0", lineHeight: 1.08 }}
          >
            {title}
          </span>
        </span>
      }
    >
      {children}
    </Modal>
  );
}
