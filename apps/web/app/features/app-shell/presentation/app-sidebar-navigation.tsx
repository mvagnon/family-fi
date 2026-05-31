import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import type { SvgIconComponent } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { SectionPanel } from "@repo/ui/section-panel";
import { memo } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";

import { AccountMenu } from "../../auth/presentation/account-menu";
import type { AuthRepository } from "../../auth/domain/auth-repository";
import { SpaceSwitcher } from "../../spaces/presentation/space-switcher";

const sidebarNavigationItems: SidebarNavigationItem[] = [
  { icon: DashboardIcon, labelKey: "dashboard", to: "/dashboard" },
  { icon: ReceiptLongIcon, labelKey: "recurringBudget", to: "/family" },
  { icon: AccountBalanceIcon, labelKey: "loans" },
  { icon: GroupsIcon, labelKey: "participations" },
  { icon: CallSplitIcon, labelKey: "distribution" },
  { icon: ShowChartIcon, labelKey: "investments" },
  { icon: AccountBalanceWalletIcon, labelKey: "assets" },
  { icon: SettingsIcon, labelKey: "settings", to: "/configuration" },
];

interface SidebarNavigationItem {
  icon: SvgIconComponent;
  labelKey:
    | "assets"
    | "dashboard"
    | "distribution"
    | "investments"
    | "loans"
    | "participations"
    | "recurringBudget"
    | "settings";
  to?: string;
}

interface AppSidebarNavigationProps {
  authRepository: AuthRepository;
  showSpaceSwitcher?: boolean;
}

export const AppSidebarNavigation = memo(function AppSidebarNavigation({
  authRepository,
  showSpaceSwitcher = true,
}: AppSidebarNavigationProps) {
  const { t } = useTranslation();

  return (
    <SectionPanel
      component="nav"
      contentSx={{ pb: { md: 1.5, xs: 1 }, px: { md: 1.5, xs: 1 } }}
      headerSx={{ pb: 1.25 }}
      subtitle={t("appShell.navigation.subtitle")}
      title="Family-Fi"
      titleId="app-navigation-title"
      titleVariant="h3"
    >
      {showSpaceSwitcher ? <SpaceSwitcher /> : null}
      <List aria-label={t("appShell.navigation.ariaLabel")} disablePadding>
        {sidebarNavigationItems.map((item) => (
          <SidebarNavigationRow item={item} key={item.labelKey} />
        ))}
      </List>
      <AccountMenu repository={authRepository} />
    </SectionPanel>
  );
});

function SidebarNavigationRow({ item }: { item: SidebarNavigationItem }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const label = t(`appShell.navigation.${item.labelKey}`);
  const content = (
    <>
      <ListItemIcon
        sx={{
          color: "inherit",
          minWidth: 0,
        }}
      >
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ minWidth: 0 }}>
            <Typography
              className={navigationLabelClassName}
              sx={{
                fontWeight: 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              variant="body2"
            >
              {label}
            </Typography>
          </Box>
        }
      />
    </>
  );

  if (item.to) {
    return (
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          component={NavLink}
          end={item.to === "/dashboard" || item.to === "/family"}
          sx={navigationRowSx}
          to={item.to}
        >
          {content}
        </ListItemButton>
      </ListItem>
    );
  }

  return <ListItem sx={navigationRowSx}>{content}</ListItem>;
}

const navigationLabelClassName = "AppSidebarNavigation-label";

const navigationRowSx = (theme: Theme) => ({
  borderRadius: 1,
  color: "text.primary",
  gap: 1.25,
  minHeight: 36,
  px: 1,
  py: 0.75,
  textDecoration: "none",
  "&.active": {
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    color: "primary.main",
    [`& .${navigationLabelClassName}`]: {
      fontWeight: 600,
    },
  },
  "&:hover": {
    bgcolor: alpha(theme.palette.primary.main, 0.05),
  },
  "&.active:hover": {
    bgcolor: alpha(theme.palette.primary.main, 0.1),
  },
});
