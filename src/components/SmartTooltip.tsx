import { Tooltip } from "@mantine/core";
import type { FloatingPosition, TooltipProps } from "@mantine/core";
import {
  cloneElement,
  isValidElement,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react";

/**
 * Tooltip that opens on the side away from the pointer: when the cursor is on
 * the right half of the viewport it shows on the left, and vice versa — so it
 * never opens off-screen and stays near where the mouse is.
 */
export function SmartTooltip({ children, ...props }: TooltipProps) {
  const [position, setPosition] = useState<FloatingPosition>("right");

  if (!isValidElement(children)) {
    return <Tooltip {...props}>{children}</Tooltip>;
  }

  const child = children as ReactElement<{
    onMouseEnter?: (event: MouseEvent) => void;
  }>;

  const target = cloneElement(child, {
    onMouseEnter: (event: MouseEvent) => {
      setPosition(event.clientX > window.innerWidth / 2 ? "right" : "left");
      child.props.onMouseEnter?.(event);
    },
  });

  return (
    <Tooltip {...props} position={position}>
      {target}
    </Tooltip>
  );
}
