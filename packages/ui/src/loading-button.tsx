import type { ReactNode } from "react";
import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingIndicator?: ReactNode;
}

export function LoadingButton({
  children,
  disabled,
  isLoading = false,
  loadingIndicator,
  startIcon,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      startIcon={
        isLoading
          ? (loadingIndicator ?? <CircularProgress color="inherit" size={16} />)
          : startIcon
      }
    >
      {children}
    </Button>
  );
}
