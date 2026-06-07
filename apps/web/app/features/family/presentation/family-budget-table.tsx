import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { LoadingButton } from "@repo/ui/loading-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useTranslation } from "react-i18next";

import {
  getCategoryGroups,
  type FamilyBudgetLine,
} from "../domain/family-budget";
import type { FamilyCategory, RecurringLine } from "../domain/family";
import type { GeneratedFamilyBudgetLine } from "../domain/family-generated-recurring-lines";
import { FamilyBudgetEmptyState } from "./family-budget-empty-state";
import { FamilyBudgetCategoryGroup } from "./family-budget-category-group";
import {
  familyBudgetTableGridColumns,
  familyBudgetTableHeaderTextSx,
} from "./family-budget-table-layout";

interface FamilyBudgetTableProps {
  categories: FamilyCategory[];
  disabled?: boolean;
  lines: FamilyBudgetLine[];
  onAddLine: () => void;
  onDeleteLine: (line: RecurringLine) => void;
  onEditLine: (line: RecurringLine) => void;
  onToggleGeneratedLine: (line: GeneratedFamilyBudgetLine) => void;
  onViewLine?: (line: RecurringLine) => void;
  onViewBudgetLine?: (line: FamilyBudgetLine) => void;
}

export function FamilyBudgetTable({
  categories,
  disabled = false,
  lines,
  onAddLine,
  onDeleteLine,
  onEditLine,
  onToggleGeneratedLine,
  onViewBudgetLine,
  onViewLine,
}: FamilyBudgetTableProps) {
  const { t } = useTranslation();
  const categoryGroups = getCategoryGroups(categories, lines);
  const hasLines = lines.length > 0;

  return (
    <SectionPanel
      action={
        <LoadingButton
          disabled={disabled}
          onClick={onAddLine}
          startIcon={<AddIcon />}
          variant="contained"
        >
          {t("family.budget.addLine")}
        </LoadingButton>
      }
      contentSx={{ p: 0 }}
      headerSx={{
        alignItems: { sm: "center", xs: "flex-start" },
        flexDirection: { sm: "row", xs: "column" },
      }}
      title={t("family.budget.title")}
      titleId="family-budget-title"
    >
      {!hasLines ? <FamilyBudgetEmptyState /> : null}
      <TableContainer
        sx={{
          display: hasLines ? "block" : "none",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <Table
          aria-label={t("family.budget.tableAriaLabel")}
          stickyHeader
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: 760,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={4} sx={{ p: 0 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: familyBudgetTableGridColumns,
                    backgroundColor: "Background",
                    pb: 1,
                  }}
                >
                  <Typography sx={familyBudgetTableHeaderTextSx}>
                    {t("family.budget.columns.title")}
                  </Typography>
                  <Typography sx={familyBudgetTableHeaderTextSx}>
                    {t("family.budget.columns.amount")}
                  </Typography>
                  <Typography sx={familyBudgetTableHeaderTextSx}>
                    {t("family.budget.columns.recurrence")}
                  </Typography>
                  <Typography align="right" sx={familyBudgetTableHeaderTextSx}>
                    {t("family.budget.columns.actions")}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoryGroups.map((group) => (
              <FamilyBudgetCategoryGroup
                disabled={disabled}
                group={group}
                key={group.id}
                onDeleteLine={onDeleteLine}
                onEditLine={onEditLine}
                onToggleGeneratedLine={onToggleGeneratedLine}
                onViewBudgetLine={onViewBudgetLine}
                onViewLine={onViewLine}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionPanel>
  );
}
