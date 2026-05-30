import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { PageShell } from "@repo/ui/page-shell";

import {
  familyDashboardBudgetAreaSx,
  familyDashboardContentGridSx,
  familyDashboardNavigationAreaSx,
  familyDashboardSidebarAreaSx,
  familyDashboardSummaryAreaSx,
} from "./family-dashboard-layout";
import { FamilySidebarNavigation } from "./family-sidebar-navigation";

export function FamilyLoadingState() {
  return (
    <PageShell>
      <Box sx={familyDashboardContentGridSx}>
        <Box
          aria-label="Chargement du foyer"
          sx={[
            familyDashboardSummaryAreaSx,
            {
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                md: "repeat(2, minmax(0, 1fr))",
                xs: "minmax(0, 1fr)",
              },
            },
          ]}
        >
          {[0, 1].map((item) => (
            <Paper key={item} sx={{ p: { md: 2.25, xs: 1.75 } }}>
              <Skeleton height={20} width={96} />
              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: {
                    sm: "repeat(3, minmax(0, 1fr))",
                    xs: "minmax(0, 1fr)",
                  },
                  mt: 1,
                }}
              >
                {[0, 1, 2].map((metric) => (
                  <Box key={metric}>
                    <Skeleton height={18} width={48} />
                    <Skeleton height={36} sx={{ mt: 0.5 }} width="70%" />
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
        <Paper sx={[familyDashboardBudgetAreaSx, { p: { md: 3, xs: 2 } }]}>
          <Skeleton height={36} width={220} />
          <Skeleton height={320} sx={{ mt: 2 }} variant="rectangular" />
        </Paper>
        <Box sx={familyDashboardNavigationAreaSx}>
          <FamilySidebarNavigation />
        </Box>
        <Paper sx={[familyDashboardSidebarAreaSx, { p: { md: 2.5, xs: 2 } }]}>
          <Skeleton height={28} width={140} />
          {[0, 1, 2].map((item) => (
            <Skeleton height={48} key={item} sx={{ mt: 1.5 }} />
          ))}
        </Paper>
      </Box>
    </PageShell>
  );
}
