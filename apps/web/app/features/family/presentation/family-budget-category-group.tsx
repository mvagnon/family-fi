import { Fragment } from "react";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import {
  getActiveBudgetRecurringLines,
  getMonthlyRange,
  type FamilyBudgetLine,
} from "../domain/family-budget";
import type { RecurringLine } from "../domain/family";
import type { GeneratedFamilyBudgetLine } from "../domain/family-generated-recurring-lines";
import { FamilyBudgetLineRow } from "./family-budget-line-row";
import { familyBudgetTableGridColumns } from "./family-budget-table-layout";
import { useFamilyFormat } from "./use-family-format";

interface FamilyBudgetCategoryGroupProps {
  disabled: boolean;
  generatedSavingLineId: string | null;
  group: {
    id: string;
    isGenerated?: boolean;
    label: string;
    lines: FamilyBudgetLine[];
  };
  isGeneratedLineSettingSaving: boolean;
  onDeleteLine: (line: RecurringLine) => void;
  onEditLine: (line: RecurringLine) => void;
  onToggleGeneratedLine: (line: GeneratedFamilyBudgetLine) => void;
  onViewBudgetLine?: (line: FamilyBudgetLine) => void;
  onViewLine?: (line: RecurringLine) => void;
  readonly?: boolean;
}

export function FamilyBudgetCategoryGroup({
  disabled,
  generatedSavingLineId,
  group,
  isGeneratedLineSettingSaving,
  onDeleteLine,
  onEditLine,
  onToggleGeneratedLine,
  onViewBudgetLine,
  onViewLine,
  readonly = false,
}: FamilyBudgetCategoryGroupProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const groupLabel = group.isGenerated
    ? t("family.budget.generatedCategory")
    : group.label;

  return (
    <Fragment>
      <TableRow>
        <TableCell colSpan={4} component="th" scope="rowgroup" sx={{ p: 0 }}>
          <Box
            sx={(theme) => ({
              alignItems: { sm: "center", xs: "flex-start" },
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: "grid",
              gap: 0.75,
              gridTemplateColumns: familyBudgetTableGridColumns,
              px: { md: 2, xs: 1.5 },
              py: 0.85,
            })}
          >
            <Typography sx={{ fontWeight: 600 }}>{groupLabel}</Typography>
            <Typography
              sx={{
                fontWeight: 600,
                gridColumn: "2 / -1",
                justifySelf: "end",
                whiteSpace: "nowrap",
              }}
            >
              {t("family.budget.category.monthlyTotal", {
                value: formatCategoryTotal(group.lines, familyFormat),
              })}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>

      {group.lines.map((line) => (
        <FamilyBudgetLineRow
          disabled={disabled}
          generatedSavingLineId={generatedSavingLineId}
          isGeneratedLineSettingSaving={isGeneratedLineSettingSaving}
          key={line.line.id}
          line={line}
          onDeleteLine={onDeleteLine}
          onEditLine={onEditLine}
          onToggleGeneratedLine={onToggleGeneratedLine}
          onViewBudgetLine={onViewBudgetLine}
          onViewLine={onViewLine}
          readonly={readonly}
        />
      ))}
    </Fragment>
  );
}

function formatCategoryTotal(
  lines: FamilyBudgetLine[],
  familyFormat: ReturnType<typeof useFamilyFormat>,
): string {
  const total = getActiveBudgetRecurringLines(lines).reduce(
    (summary, line) => {
      const range = getMonthlyRange(line);

      return {
        high: summary.high + range.max,
        low: summary.low + range.min,
      };
    },
    { high: 0, low: 0 },
  );

  if (total.low === total.high) {
    return familyFormat.formatCurrency(total.low);
  }

  return familyFormat.formatAmountRange(total.low, total.high);
}
