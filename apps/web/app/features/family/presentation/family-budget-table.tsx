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
import { alpha } from "@mui/material/styles";

import { getCategoryGroups, getMonthlyRange } from "../domain/family-budget";
import type { FamilyCategory, RecurringLine } from "../domain/family";
import {
  formatCurrency,
  formatLineCount,
  formatRecurrence,
} from "./family-format";
import { EditIcon, PlusIcon } from "./icons";

interface FamilyBudgetTableProps {
  categories: FamilyCategory[];
  disabled?: boolean;
  lines: RecurringLine[];
  onAddLine: () => void;
  onEditLine: (line: RecurringLine) => void;
}

export function FamilyBudgetTable({
  categories,
  disabled = false,
  lines,
  onAddLine,
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
          startIcon={<PlusIcon />}
          variant="contained"
        >
          Ajouter une ligne
        </Button>
      </Box>

      <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
        <Table
          aria-label="Configuration des dépenses et revenus récurrents"
          stickyHeader
          sx={{ minWidth: 980 }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 300 }}>Intitulé</TableCell>
              <TableCell sx={{ width: 150 }}>Mouvement</TableCell>
              <TableCell sx={{ width: 170 }}>Montant</TableCell>
              <TableCell sx={{ width: 190 }}>Estimation</TableCell>
              <TableCell sx={{ width: 170 }}>Récurrence</TableCell>
              <TableCell align="right" sx={{ width: 90 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoryGroups.map((group) => (
              <Fragment key={group.id}>
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                      <Box
                        sx={{
                          alignItems: "baseline",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 800 }}>
                          {group.label}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {formatLineCount(group.lines.length)}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Total mensuel : {formatCategoryTotal(group.lines)}
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
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          mt: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                        }}
                      >
                        {line.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {line.movement === "positive" ? "Entrée" : "Sortie"}
                    </TableCell>
                    <TableCell>
                      {line.isEstimate
                        ? `${formatCurrency(line.minAmount ?? line.amount)} à ${formatCurrency(
                            line.maxAmount ?? line.amount,
                          )}`
                        : formatCurrency(line.amount)}
                    </TableCell>
                    <TableCell>{line.isEstimate ? "Oui" : "Non"}</TableCell>
                    <TableCell>
                      {formatRecurrence(line.recurrenceMonths)}
                    </TableCell>
                    <TableCell align="right">
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
