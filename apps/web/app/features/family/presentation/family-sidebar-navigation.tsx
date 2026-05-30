import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import { SectionPanel } from "@repo/ui/section-panel";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

const sidebarNavigationItems: SidebarNavigationItem[] = [
  { icon: DashboardIcon, labelKey: "dashboard", to: "/family" },
  { icon: ReceiptLongIcon, labelKey: "recurringBudget" },
  { icon: GroupsIcon, labelKey: "members" },
  { icon: CategoryIcon, labelKey: "categories" },
  { icon: AccountCircleIcon, labelKey: "account" },
  { icon: SettingsIcon, labelKey: "settings", to: "/configuration" },
];

interface SidebarNavigationItem {
  icon: SvgIconComponent;
  labelKey:
    | "account"
    | "categories"
    | "dashboard"
    | "members"
    | "recurringBudget"
    | "settings";
  to?: string;
}

export function FamilySidebarNavigation() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <SectionPanel
      component="nav"
      contentSx={{ pb: { md: 1.5, xs: 1 }, px: { md: 1.5, xs: 1 } }}
      headerSx={{ pb: 1.25 }}
      subtitle={t("family.navigation.subtitle")}
      title="Family-Fi"
      titleId="family-navigation-title"
      titleVariant="h3"
    >
      <List aria-label={t("family.navigation.ariaLabel")} disablePadding>
        {sidebarNavigationItems.map((item) => (
          <SidebarNavigationRow
            isActive={isNavigationItemActive(location.pathname, item)}
            item={item}
            key={item.labelKey}
          />
        ))}
      </List>
    </SectionPanel>
  );
}

function SidebarNavigationRow({
  isActive,
  item,
}: {
  isActive: boolean;
  item: SidebarNavigationItem;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const label = t(`family.navigation.${item.labelKey}`);
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
              sx={{
                fontWeight: isActive ? 600 : 400,
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
          aria-current={isActive ? "page" : undefined}
          component={Link}
          sx={getNavigationRowSx(isActive)}
          to={item.to}
        >
          {content}
        </ListItemButton>
      </ListItem>
    );
  }

  return (
    <ListItem
      aria-current={isActive ? "page" : undefined}
      sx={getNavigationRowSx(isActive)}
    >
      {content}
    </ListItem>
  );
}

function getNavigationRowSx(isActive: boolean) {
  return (theme: Theme) => ({
    borderRadius: 1,
    color: isActive ? "primary.main" : "text.primary",
    gap: 1.25,
    minHeight: 36,
    px: 1,
    py: 0.75,
    ...(isActive && {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
    }),
  });
}

function isNavigationItemActive(pathname: string, item: SidebarNavigationItem) {
  if (!item.to) {
    return false;
  }

  if (item.to === "/family") {
    return pathname === item.to;
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}
