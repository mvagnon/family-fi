import type { ElementType, ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

interface PageShellProps {
  actions?: ReactNode;
  children: ReactNode;
  component?: ElementType;
  navigation?: ReactNode;
  subtitle?: ReactNode;
  sx?: SxProps<Theme>;
  title?: ReactNode;
  top?: ReactNode;
  widgets?: ReactNode;
}

export function PageShell({
  actions,
  children,
  component = "main",
  navigation,
  subtitle,
  sx,
  title,
  top,
  widgets,
}: PageShellProps) {
  const hasHeader = Boolean(actions || subtitle || title);
  const hasPageLayout = Boolean(navigation || top || widgets);

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

        {hasPageLayout ? (
          <Box sx={pageShellLayoutGridSx}>
            {top ? <Box sx={pageShellTopAreaSx}>{top}</Box> : null}
            <Box sx={pageShellContentAreaSx}>{children}</Box>
            {navigation ? (
              <Box sx={pageShellNavigationAreaSx}>{navigation}</Box>
            ) : null}
            {widgets ? (
              <Box sx={pageShellWidgetsAreaSx}>{widgets}</Box>
            ) : null}
          </Box>
        ) : (
          children
        )}
      </Stack>
    </Box>
  );
}

const pageShellLayoutGridSx = {
  alignItems: "start",
  columnGap: 2.5,
  display: "grid",
  gridTemplateAreas: {
    lg: `"top top" "content navigation" "content widgets"`,
    xl: `"top top top" "navigation content widgets"`,
    xs: `"navigation" "top" "content" "widgets"`,
  },
  gridTemplateColumns: {
    lg: "minmax(0, 1fr) 320px",
    xl: "280px minmax(0, 1fr) 320px",
    xs: "minmax(0, 1fr)",
  },
  gridTemplateRows: {
    lg: "auto auto 1fr",
    xl: "auto auto",
  },
  rowGap: {
    lg: 2,
    xs: 2.5,
  },
} satisfies SxProps<Theme>;

const pageShellContentAreaSx = {
  gridArea: "content",
  minWidth: 0,
} satisfies SxProps<Theme>;

const pageShellNavigationAreaSx = {
  gridArea: "navigation",
  minWidth: 0,
} satisfies SxProps<Theme>;

const pageShellTopAreaSx = {
  gridArea: "top",
  minWidth: 0,
} satisfies SxProps<Theme>;

const pageShellWidgetsAreaSx = {
  gridArea: "widgets",
  minWidth: 0,
} satisfies SxProps<Theme>;
