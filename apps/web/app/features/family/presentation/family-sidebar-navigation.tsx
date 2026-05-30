import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import { SectionPanel } from "@repo/ui/section-panel";

const sidebarNavigationItems: SidebarNavigationItem[] = [
  { icon: DashboardIcon, isActive: true, label: "Tableau de bord" },
  { icon: ReceiptLongIcon, label: "Budget récurrent" },
  { icon: GroupsIcon, label: "Membres" },
  { icon: CategoryIcon, label: "Catégories" },
  { icon: AccountCircleIcon, label: "Gestion du compte" },
  { icon: SettingsIcon, label: "Réglages" },
];

interface SidebarNavigationItem {
  icon: SvgIconComponent;
  isActive?: boolean;
  label: string;
}

export function FamilySidebarNavigation() {
  return (
    <SectionPanel
      component="nav"
      contentSx={{ pb: { md: 1.5, xs: 1 }, px: { md: 1.5, xs: 1 } }}
      headerSx={{ pb: 1.25 }}
      subtitle="Finances du foyer"
      title="Family-Fi"
      titleId="family-navigation-title"
      titleVariant="h3"
    >
      <List aria-label="Navigation finances" disablePadding>
        {sidebarNavigationItems.map((item) => (
          <SidebarNavigationRow item={item} key={item.label} />
        ))}
      </List>
    </SectionPanel>
  );
}

function SidebarNavigationRow({ item }: { item: SidebarNavigationItem }) {
  const Icon = item.icon;

  return (
    <ListItem
      aria-current={item.isActive ? "page" : undefined}
      sx={(theme) => ({
        borderRadius: 1,
        color: item.isActive ? "primary.main" : "text.primary",
        gap: 1.25,
        minHeight: 36,
        px: 1,
        py: 0.75,
        ...(item.isActive && {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        }),
      })}
    >
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
                fontWeight: item.isActive ? 600 : 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              variant="body2"
            >
              {item.label}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}
