import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";

import { FamilyBudgetTable } from "./family-budget-table";
import { FamilyMemberModal } from "./family-member-modal";
import { familyPreviewTheme } from "./family-preview-theme";
import { FamilySidebar } from "./family-sidebar";
import { FamilySummaryStrip } from "./family-summary-strip";
import { PlusIcon } from "./icons";
import { LineEditDialog } from "./line-edit-dialog";
import {
  familyCategories,
  familyMembers,
  recurringLines,
} from "./preview-data";
import type { RecurringLine } from "./types";

export function FamilyPreviewPage() {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [lines, setLines] = useState(recurringLines);
  const [selectedLine, setSelectedLine] = useState<RecurringLine | null>(null);

  function handleSaveLine(updatedLine: RecurringLine) {
    setLines((currentLines) =>
      currentLines.map((line) =>
        line.id === updatedLine.id ? updatedLine : line,
      ),
    );
    setSelectedLine(null);
  }

  return (
    <ThemeProvider theme={familyPreviewTheme}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          bgcolor: "background.default",
          color: "text.primary",
          minHeight: "100vh",
          px: { lg: 5, md: 3, xs: 2 },
          py: { md: 4, xs: 2.5 },
        }}
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
              <Typography color="text.secondary" variant="overline">
                Family-Fi SaaS
              </Typography>
              <Typography variant="h1">Foyer</Typography>
              <Typography
                color="text.secondary"
                sx={{ maxWidth: 680, mt: 1.25 }}
                variant="body1"
              >
                Dépenses, revenus et récurrences du foyer
              </Typography>
            </Box>
            <Button
              onClick={() => setIsMemberModalOpen(true)}
              size="large"
              startIcon={<PlusIcon />}
              variant="contained"
            >
              Ajouter un membre
            </Button>
          </Stack>

          <FamilySummaryStrip lines={lines} />

          <Box
            sx={{
              alignItems: "start",
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: {
                lg: "minmax(0, 1fr) 320px",
                xs: "minmax(0, 1fr)",
              },
            }}
          >
            <FamilyBudgetTable
              categories={familyCategories}
              lines={lines}
              onEditLine={setSelectedLine}
            />
            <FamilySidebar
              categories={familyCategories}
              members={familyMembers}
              onAddMember={() => setIsMemberModalOpen(true)}
            />
          </Box>
        </Stack>

        <FamilyMemberModal
          onClose={() => setIsMemberModalOpen(false)}
          open={isMemberModalOpen}
        />
        <LineEditDialog
          categories={familyCategories}
          line={selectedLine}
          onClose={() => setSelectedLine(null)}
          onSave={handleSaveLine}
          open={selectedLine !== null}
        />
      </Box>
    </ThemeProvider>
  );
}
