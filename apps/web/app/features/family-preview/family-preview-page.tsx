import { useState } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";

import { FamilyBudgetTable } from "./family-budget-table";
import { FamilyCategoryModal } from "./family-category-modal";
import { FamilyMemberModal } from "./family-member-modal";
import { familyPreviewTheme } from "./family-preview-theme";
import { FamilySidebar } from "./family-sidebar";
import { FamilySummaryStrip } from "./family-summary-strip";
import { LineEditDialog } from "./line-edit-dialog";
import {
  familyCategories,
  familyMembers,
  recurringLines,
} from "./preview-data";
import type { FamilyCategory, RecurringLine } from "./types";

export function FamilyPreviewPage() {
  const [categories, setCategories] = useState(familyCategories);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [lineDialogMode, setLineDialogMode] = useState<"create" | "edit">(
    "edit",
  );
  const [lines, setLines] = useState(recurringLines);
  const [selectedLine, setSelectedLine] = useState<RecurringLine | null>(null);

  function handleAddLine() {
    setLineDialogMode("create");
    setSelectedLine(createDraftLine(categories));
  }

  function handleEditLine(line: RecurringLine) {
    setLineDialogMode("edit");
    setSelectedLine(line);
  }

  function handleSaveLine(updatedLine: RecurringLine) {
    setLines((currentLines) =>
      currentLines.some((line) => line.id === updatedLine.id)
        ? currentLines.map((line) =>
            line.id === updatedLine.id ? updatedLine : line,
          )
        : [...currentLines, updatedLine],
    );
    setSelectedLine(null);
  }

  function handleSaveCategory(category: FamilyCategory) {
    setCategories((currentCategories) => [...currentCategories, category]);
    setIsCategoryModalOpen(false);
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
              categories={categories}
              lines={lines}
              onAddLine={handleAddLine}
              onEditLine={handleEditLine}
            />
            <FamilySidebar
              categories={categories}
              members={familyMembers}
              onAddCategory={() => setIsCategoryModalOpen(true)}
              onAddMember={() => setIsMemberModalOpen(true)}
            />
          </Box>
        </Stack>

        <FamilyCategoryModal
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          open={isCategoryModalOpen}
        />
        <FamilyMemberModal
          onClose={() => setIsMemberModalOpen(false)}
          open={isMemberModalOpen}
        />
        <LineEditDialog
          categories={categories}
          line={selectedLine}
          mode={lineDialogMode}
          onClose={() => setSelectedLine(null)}
          onSave={handleSaveLine}
          open={selectedLine !== null}
        />
      </Box>
    </ThemeProvider>
  );
}

function createDraftLine(categories: FamilyCategory[]): RecurringLine {
  return {
    amount: 0,
    categoryId: categories[0]?.id ?? "budget",
    description: "",
    id: `new-line-${Date.now()}`,
    isEstimate: false,
    movement: "negative",
    recurrenceMonths: 1,
    title: "Nouvelle ligne",
  };
}
