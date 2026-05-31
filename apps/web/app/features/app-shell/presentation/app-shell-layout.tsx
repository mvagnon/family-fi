import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { useMemo, type ReactNode } from "react";
import { Outlet } from "react-router";

import type { AuthRepository } from "../../auth/domain/auth-repository";
import { AppSidebarNavigation } from "./app-sidebar-navigation";

interface AppShellAreaProps {
  children: ReactNode;
}

interface AppShellHeaderProps {
  actions?: ReactNode;
  subtitle?: ReactNode;
  title?: ReactNode;
}

interface AppShellLayoutProps {
  authRepository: AuthRepository;
  showRouteContent?: boolean;
  showSpaceSwitcher?: boolean;
}

export function AppShellLayout({
  authRepository,
  showRouteContent = true,
  showSpaceSwitcher = true,
}: AppShellLayoutProps) {
  const navigation = useMemo(
    () => (
      <AppSidebarNavigation
        authRepository={authRepository}
        showSpaceSwitcher={showSpaceSwitcher}
      />
    ),
    [authRepository, showSpaceSwitcher],
  );

  return (
    <Box component="main" sx={appShellRootSx}>
      <Stack spacing={{ md: 2.5, xs: 2 }}>
        <Box sx={appShellLayoutGridSx}>
          <Box sx={appShellNavigationAreaSx}>{navigation}</Box>
          {showRouteContent ? <Outlet /> : null}
        </Box>
      </Stack>
    </Box>
  );
}

export function AppShellContent({ children }: AppShellAreaProps) {
  return <Box sx={appShellContentAreaSx}>{children}</Box>;
}

export function AppShellTop({ children }: AppShellAreaProps) {
  return <Box sx={appShellTopAreaSx}>{children}</Box>;
}

export function AppShellWidgets({ children }: AppShellAreaProps) {
  return <Box sx={appShellWidgetsAreaSx}>{children}</Box>;
}

export function AppShellHeader({
  actions,
  subtitle,
  title,
}: AppShellHeaderProps) {
  if (!actions && !subtitle && !title) {
    return null;
  }

  return (
    <AppShellTop>
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
    </AppShellTop>
  );
}

const APP_SHELL_MAX_WIDTH = 1920;

const appShellRootSx = {
  bgcolor: "background.default",
  color: "text.primary",
  maxWidth: APP_SHELL_MAX_WIDTH,
  minHeight: "100vh",
  mx: "auto",
  px: { lg: 4, md: 3, xs: 2 },
  py: { md: 3, xs: 2 },
  width: "100%",
} satisfies SxProps<Theme>;

const appShellLayoutGridSx = {
  alignItems: "start",
  columnGap: 2.5,
  display: "grid",
  gridTemplateAreas: {
    lg: `"top navigation" "content navigation" "content widgets"`,
    xl: `"navigation top top" "navigation content widgets"`,
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

const appShellContentAreaSx = {
  gridArea: "content",
  minWidth: 0,
} satisfies SxProps<Theme>;

const appShellNavigationAreaSx = {
  gridArea: "navigation",
  minWidth: 0,
} satisfies SxProps<Theme>;

const appShellTopAreaSx = {
  gridArea: "top",
  minWidth: 0,
} satisfies SxProps<Theme>;

const appShellWidgetsAreaSx = {
  gridArea: "widgets",
  minWidth: 0,
} satisfies SxProps<Theme>;
