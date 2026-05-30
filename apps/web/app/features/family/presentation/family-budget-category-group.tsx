import { Fragment } from "react";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { getMonthlyRange } from "../domain/family-budget";
import type { RecurringLine } from "../domain/family";
import { FamilyBudgetLineRow } from "./family-budget-line-row";
import { familyBudgetTableGridColumns } from "./family-budget-table-layout";
import { useFamilyFormat } from "./use-family-format";

interface FamilyBudgetCategoryGroupProps {
  disabled: boolean;
  group: {
    id: string;
    label: string;
    lines: RecurringLine[];
  };
  onDeleteLine: (line: RecurringLine) => void;
  onEditLine: (line: RecurringLine) => void;
  onViewLine?: (line: RecurringLine) => void;
}

export function FamilyBudgetCategoryGroup({
  disabled,
  group,
  onDeleteLine,
  onEditLine,
  onViewLine,
}: FamilyBudgetCategoryGroupProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();

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
            <Typography sx={{ fontWeight: 600 }}>{group.label}</Typography>
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
          key={line.id}
          line={line}
          onDeleteLine={onDeleteLine}
          onEditLine={onEditLine}
          onViewLine={onViewLine}
        />
      ))}
    </Fragment>
  );
}

function formatCategoryTotal(
  lines: RecurringLine[],
  familyFormat: ReturnType<typeof useFamilyFormat>,
): string {
  const total = lines.reduce(
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
