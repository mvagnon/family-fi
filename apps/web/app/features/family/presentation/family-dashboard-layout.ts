import type { SxProps, Theme } from "@mui/material/styles";

export const familyDashboardContentGridSx = {
  alignItems: "start",
  columnGap: 2.5,
  display: "grid",
  gridTemplateAreas: {
    lg: `"summary summary" "budget navigation" "budget sidebar"`,
    xl: `"summary summary summary" "navigation budget sidebar"`,
    xs: `"navigation" "summary" "budget" "sidebar"`,
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

export const familyDashboardBudgetAreaSx = {
  gridArea: "budget",
  minWidth: 0,
} satisfies SxProps<Theme>;

export const familyDashboardNavigationAreaSx = {
  gridArea: "navigation",
  minWidth: 0,
} satisfies SxProps<Theme>;

export const familyDashboardSidebarAreaSx = {
  gridArea: "sidebar",
  minWidth: 0,
} satisfies SxProps<Theme>;

export const familyDashboardSummaryAreaSx = {
  gridArea: "summary",
  minWidth: 0,
} satisfies SxProps<Theme>;
