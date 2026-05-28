import { Fragment } from "react";
import type { KeyboardEvent } from "react";
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
import {
  formatCurrency,
  formatLineAmount,
  formatRecurrence,
} from "./family-format";

const lineHoverBackground = "#f2e5c9";
const lineHoverRadius = 14;

interface FamilyBudgetTableProps {
  categories: FamilyCategory[];
  disabled?: boolean;
  lines: RecurringLine[];
  onAddLine: () => void;
  onDeleteLine: (line: RecurringLine) => void;
  onEditLine: (line: RecurringLine) => void;
  onViewLine?: (line: RecurringLine) => void;
}

export function FamilyBudgetTable({
  categories,
  disabled = false,
  lines,
  onAddLine,
  onDeleteLine,
  onEditLine,
  onViewLine,
}: FamilyBudgetTableProps) {
  const categoryGroups = getCategoryGroups(categories, lines);

  function handleLineClick(line: RecurringLine) {
    if (!disabled) {
      onViewLine?.(line);
    }
  }

  function handleLineKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    line: RecurringLine,
  ) {
    if (disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onViewLine?.(line);
    }
  }

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
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: 740,
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                "& > .MuiTableCell-root": {
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
                      p: 0,
                    })}
                  >
                    <Box
                      sx={{
                        alignItems: { sm: "center", xs: "flex-start" },
                        display: "flex",
                        flexDirection: { sm: "row", xs: "column" },
                        gap: 0.75,
                        justifyContent: "space-between",
                        px: { md: 2, xs: 1.5 },
                        py: 0.85,
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
                    aria-disabled={disabled || undefined}
                    aria-label={`Voir ${line.title}`}
                    key={line.id}
                    onClick={() => handleLineClick(line)}
                    onKeyDown={(event) => handleLineKeyDown(event, line)}
                    role="button"
                    sx={{
                      cursor: disabled ? "default" : "pointer",
                      "& > .MuiTableCell-root": {
                        transition:
                          "background-color 150ms ease,border-radius 260ms ease",
                      },
                      "& > td:not(:first-of-type)": {
                        verticalAlign: "middle",
                      },
                      "&:hover > .MuiTableCell-root": {
                        backgroundColor: lineHoverBackground,
                      },
                      "&:hover > .MuiTableCell-root:first-of-type": {
                        borderBottomLeftRadius: lineHoverRadius,
                        borderTopLeftRadius: lineHoverRadius,
                      },
                      "&:hover > .MuiTableCell-root:last-of-type": {
                        borderBottomRightRadius: lineHoverRadius,
                        borderTopRightRadius: lineHoverRadius,
                      },
                    }}
                    tabIndex={disabled ? -1 : 0}
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
                              onClick={(event) => {
                                event.stopPropagation();
                                onEditLine(line);
                              }}
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
                              onClick={(event) => {
                                event.stopPropagation();
                                onDeleteLine(line);
                              }}
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
