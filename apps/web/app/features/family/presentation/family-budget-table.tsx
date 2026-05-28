import { Fragment } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { alpha } from "@mui/material/styles";

import { getCategoryGroups, getMonthlyRange } from "../domain/family-budget";
import type { FamilyCategory, RecurringLine } from "../domain/family";
import { formatCurrency, formatRecurrence } from "./family-format";

interface FamilyBudgetTableProps {
  categories: FamilyCategory[];
  disabled?: boolean;
  lines: RecurringLine[];
  onAddLine: () => void;
  onDeleteLine: (line: RecurringLine) => void;
  onEditLine: (line: RecurringLine) => void;
}

export function FamilyBudgetTable({
  categories,
  disabled = false,
  lines,
  onAddLine,
  onDeleteLine,
  onEditLine,
}: FamilyBudgetTableProps) {
  const categoryGroups = getCategoryGroups(categories, lines);

  return (
    <Paper
      aria-labelledby="family-budget-title"
      component="section"
      sx={{ overflow: "hidden" }}
    >
      <Box
        sx={{
          alignItems: { sm: "center" },
          display: "flex",
          flexDirection: { sm: "row", xs: "column" },
          gap: 1.5,
          justifyContent: "space-between",
          p: { md: 3, xs: 2 },
        }}
      >
        <Box>
          <Typography id="family-budget-title" variant="h2">
            Budget récurrent
          </Typography>
        </Box>
        <Button
          disabled={disabled}
          onClick={onAddLine}
          startIcon={<AddIcon />}
          variant="contained"
        >
          Ajouter une ligne
        </Button>
      </Box>

      <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
        <Table
          aria-label="Configuration des dépenses et revenus récurrents"
          stickyHeader
          sx={{ minWidth: 740 }}
        >
          <TableHead>
            <TableRow
              sx={{
                "& > .MuiTableCell-root": {
                  borderTop: 0,
                  pt: 0,
                  pb: 1,
                },
              }}
            >
              <TableCell sx={{ width: 300 }}>Intitulé</TableCell>
              <TableCell sx={{ width: 170 }}>Montant</TableCell>
              <TableCell sx={{ width: 170 }}>Récurrence</TableCell>
              <TableCell align="right" sx={{ width: 120 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoryGroups.map((group) => (
              <Fragment key={group.id}>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    component="th"
                    scope="rowgroup"
                    sx={(theme) => ({
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderTop: "1px solid",
                      borderTopColor: "divider",
                      py: 1.25,
                    })}
                  >
                    <Box
                      sx={{
                        alignItems: { sm: "center", xs: "flex-start" },
                        display: "flex",
                        flexDirection: { sm: "row", xs: "column" },
                        gap: 0.75,
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography sx={{ fontWeight: 800 }}>
                        {group.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCategoryTotal(group.lines)} par mois
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>

                {group.lines.map((line) => (
                  <TableRow
                    hover
                    key={line.id}
                    sx={{
                      "& > td:not(:first-of-type)": {
                        verticalAlign: "middle",
                      },
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 800 }}>
                        {line.title}
                      </Typography>
                      <Typography
                        sx={(theme) => ({
                          color: alpha(theme.palette.text.secondary, 0.76),
                          display: "-webkit-box",
                          mt: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 1,
                        })}
                        variant="body2"
                      >
                        {line.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatLineAmount(line)}</TableCell>
                    <TableCell>
                      {formatRecurrence(line.recurrenceMonths)}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="Modifier la ligne">
                          <span>
                            <IconButton
                              aria-label={`Modifier ${line.title}`}
                              disabled={disabled}
                              onClick={() => onEditLine(line)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Supprimer la ligne">
                          <span>
                            <IconButton
                              aria-label={`Supprimer ${line.title}`}
                              disabled={disabled}
                              onClick={() => onDeleteLine(line)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function formatLineAmount(line: RecurringLine): string {
  if (!line.isEstimate) {
    return formatCurrency(getSignedAmount(line, line.amount));
  }

  const minAmount = getSignedAmount(line, line.minAmount ?? line.amount);
  const maxAmount = getSignedAmount(line, line.maxAmount ?? line.amount);

  return `${formatCurrency(Math.min(minAmount, maxAmount))} à ${formatCurrency(
    Math.max(minAmount, maxAmount),
  )}`;
}

function getSignedAmount(line: RecurringLine, amount: number): number {
  return line.movement === "positive" ? amount : -amount;
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
