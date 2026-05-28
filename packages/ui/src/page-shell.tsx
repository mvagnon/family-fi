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
  title: ReactNode;
}

export function PageShell({
  actions,
  children,
  component = "main",
  subtitle,
  sx,
  title,
}: PageShellProps) {
  return (
    <Box
      component={component}
      sx={[
        {
          bgcolor: "background.default",
          color: "text.primary",
          minHeight: "100vh",
          px: { lg: 5, md: 3, xs: 2 },
          py: { md: 4, xs: 2.5 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack spacing={{ md: 3, xs: 2.25 }}>
        <Stack
          component="header"
          direction={{ md: "row", xs: "column" }}
          spacing={2}
          sx={{
            alignItems: { md: "flex-end", xs: "flex-start" },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h1">{title}</Typography>
            {subtitle ? (
              <Typography
                color="text.secondary"
                sx={{ maxWidth: 680, mt: 1.25 }}
                variant="body1"
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {actions}
        </Stack>

        {children}
      </Stack>
    </Box>
  );
}
