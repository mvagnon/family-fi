import type { ElementType, ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

interface PageShellProps {
  actions?: ReactNode;
  children: ReactNode;
  component?: ElementType;
  subtitle?: ReactNode;
  sx?: SxProps<Theme>;
  title?: ReactNode;
}

export function PageShell({
  actions,
  children,
  component = "main",
  subtitle,
  sx,
  title,
}: PageShellProps) {
  const hasHeader = Boolean(actions || subtitle || title);

  return (
    <Box
      component={component}
      sx={[
        {
          bgcolor: "background.default",
          color: "text.primary",
          minHeight: "100vh",
          px: { lg: 4, md: 3, xs: 2 },
          py: { md: 3, xs: 2 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack spacing={{ md: 2.5, xs: 2 }}>
        {hasHeader ? (
          <Stack
            component="header"
            direction={{ md: "row", xs: "column" }}
            spacing={2}
            sx={{
              alignItems: { md: "flex-end", xs: "flex-start" },
              justifyContent: "space-between",
            }}
          >
            {title || subtitle ? (
              <Box>
                {title ? <Typography variant="h1">{title}</Typography> : null}
                {subtitle ? (
                  <Typography
                    color="text.secondary"
                    sx={{ maxWidth: 680, mt: title ? 1.25 : 0 }}
                    variant="body1"
                  >
                    {subtitle}
                  </Typography>
                ) : null}
              </Box>
            ) : null}
            {actions}
          </Stack>
        ) : null}

        {children}
      </Stack>
    </Box>
  );
}
