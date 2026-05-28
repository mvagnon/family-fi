import type { ElementType, MouseEvent, ReactNode } from "react";
import IconButton from "@mui/material/IconButton";
import type { IconButtonProps } from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

interface ActionIconButtonProps extends Omit<
  IconButtonProps,
  "aria-label" | "children" | "onClick"
> {
  component?: ElementType;
  icon: ReactNode;
  label: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  stopPropagation?: boolean;
  tooltip?: ReactNode;
}

export function ActionIconButton({
  component,
  disabled,
  icon,
  label,
  onClick,
  stopPropagation = false,
  tooltip = label,
  ...props
}: ActionIconButtonProps) {
  function handleClick(event: MouseEvent<HTMLElement>) {
    if (stopPropagation) {
      event.stopPropagation();
    }

    onClick?.(event);
  }

  const iconButton = component ? (
    <IconButton
      {...props}
      aria-label={label}
      component={component}
      disabled={disabled}
      onClick={handleClick}
    >
      {icon}
    </IconButton>
  ) : (
    <IconButton
      {...props}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
    >
      {icon}
    </IconButton>
  );

  return (
    <Tooltip title={tooltip}>
      <span>{iconButton}</span>
    </Tooltip>
  );
}
