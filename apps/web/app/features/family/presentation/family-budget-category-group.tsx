import { Fragment } from "react";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import { getMonthlyRange } from "../domain/family-budget";
import type { RecurringLine } from "../domain/family";
import { formatCurrency } from "./family-format";
import { FamilyBudgetLineRow } from "./family-budget-line-row";
import { familyBudgetTableGridColumns } from "./family-budget-table-layout";

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
              {formatCategoryTotal(group.lines)} par mois
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

function formatCategoryTotal(lines: RecurringLine[]): string {
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
    return formatCurrency(total.low);
  }

  return `${formatCurrency(total.low)} à ${formatCurrency(total.high)}`;
}
